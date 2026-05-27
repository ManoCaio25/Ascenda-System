import React, { useEffect, useMemo, useState } from 'react';
import { CalendarEvent } from '@estagiario/Entities/all';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  addMonths,
  subMonths,
  differenceInBusinessDays,
  parseISO,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Umbrella,
  CalendarRange,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@estagiario/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@estagiario/Components/ui/dialog';
import { Input } from '@estagiario/Components/ui/input';
import Textarea from '@estagiario/Components/ui/textarea';
import { useI18n } from '@estagiario/Components/utils/i18n';

const eventTypeStyles = {
  meeting: 'bg-blue-500/20 text-blue-200 border border-blue-500/40',
  learning: 'bg-purple-500/20 text-purple-200 border border-purple-500/40',
  community: 'bg-pink-500/20 text-pink-200 border border-pink-500/40',
  focus: 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40',
  vacation: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40',
  default: 'bg-slate-700/30 text-slate-200 border border-slate-600/50',
};

function normalizeDate(value, fallbackHour = '09:00') {
  if (!value) return null;
  const isoString = `${value}T${fallbackHour}:00`;
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function formatRange(start, end, language) {
  if (!start || !end) return '';
  try {
    const options = language === 'pt' ? 'dd/MM' : 'MMM dd';
    return `${format(parseISO(start), options)} - ${format(parseISO(end), options)}`;
  } catch (error) {
    return `${start} - ${end}`;
  }
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isVacationDialogOpen, setIsVacationDialogOpen] = useState(false);
  const [vacationForm, setVacationForm] = useState({
    start: '',
    end: '',
    reason: '',
    handoff: '',
  });
  const [formError, setFormError] = useState('');
  const { t, language } = useI18n();

  useEffect(() => {
    CalendarEvent.list().then(setEvents);
  }, []);

  const weekDays = useMemo(
    () => (language === 'pt'
      ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']),
    [language],
  );

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayIndex = getDay(monthStart);

  const eventsForDay = (day) => events.filter((event) => isSameDay(new Date(event.data_hora_inicio), day));

  const upcomingVacations = useMemo(
    () =>
      events
        .filter((event) => event.tipo_evento === 'vacation' && new Date(event.data_hora_inicio) >= new Date())
        .sort((a, b) => new Date(a.data_hora_inicio).getTime() - new Date(b.data_hora_inicio).getTime()),
    [events],
  );

  const handleVacationFieldChange = (field, value) => {
    setVacationForm((previous) => ({ ...previous, [field]: value }));
    setFormError('');
  };

  const handleVacationSubmit = async (event) => {
    event.preventDefault();

    if (!vacationForm.start || !vacationForm.end) {
      setFormError(t('vacationDatesRequired'));
      return;
    }

    const startISO = normalizeDate(vacationForm.start, '00:00');
    const endISO = normalizeDate(vacationForm.end, '23:59');

    if (!startISO || !endISO) {
      setFormError(t('invalidDates'));
      return;
    }

    if (new Date(startISO) > new Date(endISO)) {
      setFormError(t('vacationDateOrder'));
      return;
    }

    const workingDays = Math.max(1, differenceInBusinessDays(new Date(endISO), new Date(startISO)) + 1);

    const created = await CalendarEvent.create({
      titulo_evento: `${t('vacationRequest')} · ${formatRange(startISO, endISO, language)}`,
      descricao: vacationForm.reason,
      data_hora_inicio: startISO,
      data_hora_fim: endISO,
      tipo_evento: 'vacation',
      handoff_notes: vacationForm.handoff,
      business_days: workingDays,
    });

    setEvents((previous) => [...previous, created]);
    setVacationForm({ start: '', end: '', reason: '', handoff: '' });
    setIsVacationDialogOpen(false);
  };

  const headerTitle = format(currentDate, language === 'pt' ? "MMMM 'de' yyyy" : 'MMMM yyyy');

  return (
    <div className="p-8 max-w-7xl mx-auto text-text-primary space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold capitalize">{headerTitle}</h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              aria-label={t('previousMonth')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              aria-label={t('nextMonth')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            <CalendarRange className="w-4 h-4 mr-2" /> {t('goToToday')}
          </Button>
          <Button variant="gradient" onClick={() => setIsVacationDialogOpen(true)}>
            <Umbrella className="w-4 h-4 mr-2" /> {t('requestVacation')}
          </Button>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" /> {t('newEvent')}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[3fr,1fr] gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-px bg-slate-700 dark:bg-slate-700 light:bg-slate-300 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg overflow-hidden">
            {weekDays.map((day) => (
              <div key={day} className="text-center font-semibold text-sm py-3 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-text-primary">
                {day}
              </div>
            ))}
            {Array.from({ length: startingDayIndex }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50" />
            ))}
            {daysInMonth.map((day) => (
              <div key={day.toString()} className="h-44 bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 p-3 flex flex-col overflow-hidden border border-slate-900/30">
                <span
                  className={`font-semibold text-sm ${
                    isSameDay(day, new Date()) ? 'text-purple-400' : 'text-text-secondary'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                <div className="mt-2 space-y-2 overflow-y-auto pr-1">
                  {eventsForDay(day).map((event) => {
                    const badge = eventTypeStyles[event.tipo_evento] || eventTypeStyles.default;
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-lg px-3 py-2 text-xs leading-snug ${badge}`}
                      >
                        <div className="font-semibold truncate">{event.titulo_evento}</div>
                        <div className="text-[11px] opacity-80 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(event.data_hora_inicio), 'HH:mm')}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="cosmic-card rounded-xl p-4 border border-purple-500/30">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-200 mb-3">
              {t('upcomingHighlights')}
            </h2>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
              {events
                .slice()
                .sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio))
                .map((event) => (
                  <div key={event.id} className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white truncate">{event.titulo_evento}</p>
                      <span className="text-xs text-slate-400">
                        {format(new Date(event.data_hora_inicio), 'dd MMM')}
                      </span>
                    </div>
                    {event.descricao ? (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{event.descricao}</p>
                    ) : null}
                  </div>
                ))}
            </div>
          </div>

          <div className="cosmic-card rounded-xl p-4 border border-emerald-500/30">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200 mb-3 flex items-center gap-2">
              <Umbrella className="w-4 h-4" /> {t('vacationSummary')}
            </h3>
            {upcomingVacations.length ? (
              <div className="space-y-3">
                {upcomingVacations.map((vacation) => (
                  <div key={vacation.id} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
                    <p className="font-semibold text-emerald-100">
                      {formatRange(vacation.data_hora_inicio, vacation.data_hora_fim, language)}
                    </p>
                    {vacation.business_days ? (
                      <p className="text-xs text-emerald-200 mt-1">
                        {t('businessDays', { count: vacation.business_days })}
                      </p>
                    ) : null}
                    {vacation.handoff_notes ? (
                      <p className="text-xs text-emerald-200 mt-2 leading-relaxed">
                        {vacation.handoff_notes}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">{t('noVacationPlanned')}</p>
            )}
          </div>
        </aside>
      </div>

      <Dialog open={isVacationDialogOpen} onOpenChange={setIsVacationDialogOpen}>
        {isVacationDialogOpen ? (
          <DialogContent className="bg-slate-950/95 border border-purple-500/40">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Umbrella className="w-6 h-6 text-emerald-300" /> {t('requestVacation')}
              </DialogTitle>
              <DialogDescription>{t('vacationDialogSubtitle')}</DialogDescription>
            </DialogHeader>

            <form className="p-6 space-y-5" onSubmit={handleVacationSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300" htmlFor="vacation-start">
                    {t('startDate')}
                  </label>
                  <Input
                    id="vacation-start"
                    type="date"
                    value={vacationForm.start}
                    onChange={(event) => handleVacationFieldChange('start', event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300" htmlFor="vacation-end">
                    {t('endDate')}
                  </label>
                  <Input
                    id="vacation-end"
                    type="date"
                    value={vacationForm.end}
                    onChange={(event) => handleVacationFieldChange('end', event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="vacation-reason">
                  {t('vacationReason')}
                </label>
                <Textarea
                  id="vacation-reason"
                  rows={3}
                  value={vacationForm.reason}
                  onChange={(event) => handleVacationFieldChange('reason', event.target.value)}
                  placeholder={t('vacationReasonPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="vacation-handoff">
                  {t('handoffNotes')}
                </label>
                <Textarea
                  id="vacation-handoff"
                  rows={3}
                  value={vacationForm.handoff}
                  onChange={(event) => handleVacationFieldChange('handoff', event.target.value)}
                  placeholder={t('handoffPlaceholder')}
                />
              </div>

              {formError ? <p className="text-sm text-red-400">{formError}</p> : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => setIsVacationDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button variant="gradient" type="submit">
                  <Umbrella className="w-4 h-4 mr-2" /> {t('submitRequest')}
                </Button>
              </div>
            </form>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
