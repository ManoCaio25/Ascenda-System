import React, { useState, useEffect, useCallback, useMemo } from "react";
import { VacationRequest } from "@padrinho/entities/VacationRequest";
import { Intern } from "@padrinho/entities/Intern";
import { Notification } from "@padrinho/entities/Notification";
import { User } from "@padrinho/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@padrinho/components/ui/card";
import { Button } from "@padrinho/components/ui/button";
import { Badge } from "@padrinho/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@padrinho/components/ui/tabs";
import { Textarea } from "@padrinho/components/ui/textarea";
import { Input } from "@padrinho/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@padrinho/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@padrinho/components/ui/select";
import {
  Check,
  X,
  Calendar,
  CalendarCheck,
  AlertCircle,
  Pencil,
  Users,
  Clock,
  Search,
} from "lucide-react";
import { format, startOfToday, differenceInCalendarDays } from "date-fns";
import { useTranslation } from "@padrinho/i18n";
import { eventBus, EventTypes } from "../utils/eventBus";
import VacationCalendar from "./VacationCalendar";
import Avatar from "@padrinho/components/ui/Avatar";

export default function VacationRequestsPanel() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [interns, setInterns] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterIntern, setFilterIntern] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(null);
  const [managerNote, setManagerNote] = useState("");
  const [user, setUser] = useState(null);
  const [emojiEditor, setEmojiEditor] = useState(null);
  const [emojiValue, setEmojiValue] = useState("");
  const [isUpdatingEmoji, setIsUpdatingEmoji] = useState(false);

  const loadData = useCallback(async () => {
    const [requestsData, internsData] = await Promise.all([
      VacationRequest.list('-created_date'),
      Intern.list(),
    ]);
    setRequests(requestsData);
    setInterns(internsData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        console.log("User not loaded");
      }
    };
    loadUser();
  }, []);

  const internsById = useMemo(() => {
    return Object.fromEntries(interns.map((i) => [i.id, i]));
  }, [interns]);

  const statusCounts = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((req) => req.status === 'pending').length,
    approved: requests.filter((req) => req.status === 'approved').length,
    rejected: requests.filter((req) => req.status === 'rejected').length,
  }), [requests]);

  const requestsByIntern = useMemo(() => {
    const map = new Map();
    requests.forEach((request) => {
      const key = String(request.intern_id);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, request);
        return;
      }
      const existingDate = existing.start_date ? new Date(existing.start_date) : new Date(existing.created_date);
      const nextDate = request.start_date ? new Date(request.start_date) : new Date(request.created_date);
      if (existingDate < nextDate) {
        map.set(key, request);
      }
    });
    return map;
  }, [requests]);

  const sortedInterns = useMemo(() => {
    return [...interns].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
  }, [interns]);

  const internSummaries = useMemo(() => {
    return sortedInterns.map((intern) => ({
      intern,
      latest: requestsByIntern.get(String(intern.id)) || null,
    }));
  }, [sortedInterns, requestsByIntern]);

  const openEmojiEditor = useCallback((intern) => {
    if (!intern) return;
    setEmojiEditor(intern);
    setEmojiValue(intern.avatar_url || "");
  }, []);

  const closeEmojiEditor = useCallback(() => {
    setEmojiEditor(null);
    setEmojiValue("");
    setIsUpdatingEmoji(false);
  }, []);

  const saveEmoji = useCallback(async () => {
    if (!emojiEditor || isUpdatingEmoji) return;

    const nextValue = emojiValue.trim();
    const currentValue = emojiEditor.avatar_url || '';
    if (nextValue === currentValue) {
      return;
    }

    setIsUpdatingEmoji(true);

    try {
      await Intern.update(emojiEditor.id, { avatar_url: nextValue || null });
      setInterns((prev) =>
        prev.map((item) =>
          String(item.id) === String(emojiEditor.id)
            ? { ...item, avatar_url: nextValue || null }
            : item
        )
      );
      closeEmojiEditor();
    } catch (error) {
      console.error('Error updating emoji:', error);
    } finally {
      setIsUpdatingEmoji(false);
    }
  }, [emojiEditor, emojiValue, isUpdatingEmoji, closeEmojiEditor]);

  const handleApprove = useCallback(async (request) => {
    if (processingId) return;

    setProcessingId(request.id);
    try {
      await VacationRequest.update(request.id, {
        status: 'approved',
        decided_at: new Date().toISOString(),
      });

      const intern = internsById[request.intern_id];
      await Notification.create({
        type: 'vacation_status_changed',
        title: t('vacation.notifications.approvedTitle'),
        body: t('vacation.notifications.approvedBody', {
          start: format(new Date(request.start_date), 'MMM d'),
          end: format(new Date(request.end_date), 'MMM d'),
        }),
        target_id: request.id,
        target_kind: 'request',
        actor_name: user?.full_name || t('vacation.notifications.managerFallback'),
      });

      eventBus.emit(EventTypes.VACATION_STATUS_CHANGED, {
        requestId: request.id,
        status: 'APPROVED',
        internName: intern?.full_name,
      });

      loadData();
    } finally {
      setProcessingId(null);
    }
  }, [processingId, internsById, user, loadData, t]);

  const handleReject = useCallback((request) => {
    setRejectDialog(request);
    setManagerNote("");
  }, []);

  const confirmReject = useCallback(async () => {
    if (!rejectDialog || processingId) return;

    setProcessingId(rejectDialog.id);
    try {
      await VacationRequest.update(rejectDialog.id, {
        status: 'rejected',
        decided_at: new Date().toISOString(),
        manager_note: managerNote,
      });

      const intern = internsById[rejectDialog.intern_id];
      await Notification.create({
        type: 'vacation_status_changed',
        title: t('vacation.notifications.rejectedTitle'),
        body: t('vacation.notifications.rejectedBody', {
          start: format(new Date(rejectDialog.start_date), 'MMM d'),
          end: format(new Date(rejectDialog.end_date), 'MMM d'),
          note: managerNote ? ` ${t('vacation.notifications.managerNotePrefix')} ${managerNote}` : '',
        }),
        target_id: rejectDialog.id,
        target_kind: 'request',
        actor_name: user?.full_name || t('vacation.notifications.managerFallback'),
      });

      eventBus.emit(EventTypes.VACATION_STATUS_CHANGED, {
        requestId: rejectDialog.id,
        status: 'REJECTED',
        internName: intern?.full_name,
      });

      setRejectDialog(null);
      setManagerNote("");
      loadData();
    } finally {
      setProcessingId(null);
    }
  }, [rejectDialog, processingId, managerNote, internsById, user, loadData, t]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return requests
      .filter((req) => {
        if (filterStatus !== 'all' && req.status !== filterStatus) {
          return false;
        }
        if (filterIntern !== 'all' && String(req.intern_id) !== filterIntern) {
          return false;
        }
        if (normalizedSearch) {
          const intern = internsById[req.intern_id];
          const matches = [
            intern?.full_name?.toLowerCase() || '',
            intern?.track?.toLowerCase() || '',
            req.reason?.toLowerCase() || '',
          ].some((value) => value.includes(normalizedSearch));
          if (!matches) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const first = a.created_date || a.start_date;
        const second = b.created_date || b.start_date;
        return new Date(second) - new Date(first);
      });
  }, [requests, filterStatus, filterIntern, searchTerm, internsById]);

  const upcomingRequests = useMemo(() => {
    const today = startOfToday();
    return requests
      .filter((req) => req.status === 'approved' && new Date(req.end_date) >= today)
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
      .slice(0, 5);
  }, [requests]);

  const statusColors = {
    pending: "bg-yellow-500/20 text-warning border-yellow-500/30",
    approved: "bg-green-500/20 text-success border-green-500/30",
    rejected: "bg-red-500/20 text-error border-red-500/30",
  };

  const trimmedEmojiValue = emojiValue.trim();
  const previewEmoji = trimmedEmojiValue || emojiEditor?.avatar_url || '👤';
  const emojiHasChanges = emojiEditor
    ? trimmedEmojiValue !== (emojiEditor.avatar_url || '')
    : Boolean(trimmedEmojiValue);

  const getStatusLabel = useCallback((status) => t(`vacation.status.${status}`), [t]);

  return (
    <>
      <Card className="border-border bg-surface shadow-e1">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t('vacation.panelTitle')}
              </CardTitle>
              <p className="text-sm text-muted mt-1 max-w-xl">
                {t('vacation.subtitle')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[{
              key: 'total',
              label: t('vacation.stats.total'),
              value: statusCounts.total,
              icon: Users,
              accent: 'bg-brand/10 text-brand border-brand/20',
            }, {
              key: 'pending',
              label: t('vacation.stats.pending'),
              value: statusCounts.pending,
              icon: Clock,
              accent: 'bg-yellow-500/15 text-warning border-yellow-500/30',
            }, {
              key: 'approved',
              label: t('vacation.stats.approved'),
              value: statusCounts.approved,
              icon: Check,
              accent: 'bg-green-500/15 text-success border-green-500/30',
            }, {
              key: 'rejected',
              label: t('vacation.stats.rejected'),
              value: statusCounts.rejected,
              icon: X,
              accent: 'bg-red-500/15 text-error border-red-500/30',
            }].map(({ key, label, value, icon: Icon, accent }) => (
              <div
                key={key}
                className="p-4 rounded-xl border border-border bg-surface2 flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
                  <p className="text-2xl font-semibold text-primary">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="mb-6 bg-surface2">
                <TabsTrigger value="list" className="data-[state=active]:bg-surface">
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  {t('vacation.tabs.list')}
                </TabsTrigger>
                <TabsTrigger value="calendar" className="data-[state=active]:bg-surface">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('vacation.tabs.calendar')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-40 bg-surface2 border-border text-primary">
                        <SelectValue placeholder={t('vacation.filterPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-border">
                        <SelectItem value="all">{t('vacation.filters.allStatus')}</SelectItem>
                        <SelectItem value="pending">{getStatusLabel('pending')}</SelectItem>
                        <SelectItem value="approved">{getStatusLabel('approved')}</SelectItem>
                        <SelectItem value="rejected">{getStatusLabel('rejected')}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterIntern} onValueChange={setFilterIntern}>
                      <SelectTrigger className="w-full sm:w-48 bg-surface2 border-border text-primary">
                        <SelectValue placeholder={t('vacation.filters.internPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-border max-h-64 overflow-y-auto">
                        <SelectItem value="all">{t('vacation.filters.allInterns')}</SelectItem>
                        {sortedInterns.map((intern) => (
                          <SelectItem key={intern.id} value={String(intern.id)}>
                            {intern.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative w-full lg:w-auto lg:min-w-[220px]">
                    <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('vacation.filters.searchPlaceholder')}
                      className="bg-surface2 border-border text-primary pl-9"
                      aria-label={t('vacation.filters.searchPlaceholder')}
                    />
                  </div>
                </div>

                <div className="text-sm text-muted">
                  {t('vacation.listCount', {
                    count: filteredRequests.length,
                    suffix:
                      filteredRequests.length === 1
                        ? t('vacation.listCountSuffix.single')
                        : t('vacation.listCountSuffix.plural'),
                  })}
                </div>

                <div className="space-y-4">
                  {filteredRequests.map((request) => {
                    const intern = internsById[request.intern_id];
                    const isPending = request.status === 'pending';

                    return (
                      <article
                        key={request.id}
                        className="p-4 rounded-xl border border-border bg-surface2 hover:shadow-e1 transition-all"
                        aria-label={t('vacation.aria.request', {
                          name: intern?.full_name || t('vacation.unknownIntern'),
                        })}
                      >
                        <div className="grid grid-cols-[auto,1fr,auto] gap-4 items-start">
                          <div className="relative flex-shrink-0">
                            {intern ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEmojiEditor(intern)}
                                  className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-brand2 flex items-center justify-center text-2xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                  title={t('vacation.emoji.open', { name: intern.full_name })}
                                >
                                  {intern.avatar_url || '👤'}
                                  <span className="sr-only">{t('vacation.emoji.open', { name: intern.full_name })}</span>
                                </button>
                                <span className="absolute -bottom-1 -right-1 rounded-full bg-surface text-muted border border-border p-1 shadow-sm">
                                  <Pencil className="w-3 h-3" aria-hidden="true" />
                                </span>
                              </>
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-brand2 flex items-center justify-center text-2xl">
                                {'👤'}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold text-primary truncate max-w-[220px]">
                                {intern?.full_name || t('vacation.unknownIntern')}
                              </h3>
                              <Badge className={`${statusColors[request.status]} border flex-shrink-0`}>
                                {getStatusLabel(request.status)}
                              </Badge>
                            </div>

                            {intern && (
                              <p className="text-xs text-muted mb-2">
                                {t('vacation.labels.track', {
                                  track: intern.track || t('vacation.labels.trackUnknown'),
                                })}
                              </p>
                            )}

                            <div className="space-y-1 text-sm">
                              <p className="text-secondary">
                                <span className="text-muted">{t('vacation.labels.from')}</span>{' '}
                                <span className="font-medium">
                                  {format(new Date(request.start_date), 'MMM d, yyyy')}
                                </span>
                              </p>
                              <p className="text-secondary">
                                <span className="text-muted">{t('vacation.labels.to')}</span>{' '}
                                <span className="font-medium">
                                  {format(new Date(request.end_date), 'MMM d, yyyy')}
                                </span>
                              </p>
                              {request.reason && (
                                <p className="text-secondary flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-muted mt-0.5" aria-hidden="true" />
                                  <span>{request.reason}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            <div className="text-xs text-muted text-right">
                              {t('vacation.labels.submittedOn', {
                                date: format(new Date(request.created_date), 'MMM d, yyyy'),
                              })}
                            </div>

                            {isPending ? (
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                  size="sm"
                                  className="bg-success text-white hover:bg-success/90 font-medium"
                                  onClick={() => handleApprove(request)}
                                  disabled={processingId === request.id}
                                  aria-label={t('vacation.aria.approve', {
                                    name: intern?.full_name || t('vacation.unknownIntern'),
                                  })}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  {t('vacation.approve')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(request)}
                                  disabled={processingId === request.id}
                                  className="border-error text-error hover:bg-error/10 font-medium"
                                  aria-label={t('vacation.aria.reject', {
                                    name: intern?.full_name || t('vacation.unknownIntern'),
                                  })}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  {t('vacation.reject')}
                                </Button>
                              </div>
                            ) : (
                              request.manager_note && (
                                <div className="text-xs text-secondary flex items-start gap-2 text-left">
                                  <Pencil className="w-4 h-4 text-muted mt-0.5" aria-hidden="true" />
                                  <span>{request.manager_note}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {filteredRequests.length === 0 && (
                    <div className="text-center py-12 bg-surface2 rounded-xl border border-border">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted opacity-50" />
                      <p className="text-muted">{t('vacation.none')}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="calendar">
                <VacationCalendar
                  requests={requests}
                  interns={interns}
                />
              </TabsContent>
            </Tabs>

            <section className="p-4 border border-border rounded-xl bg-surface2">
              <h3 className="text-sm font-semibold text-primary mb-3">
                {t('vacation.stats.upcomingTitle')}
              </h3>
              <div className="space-y-3">
                {upcomingRequests.length > 0 ? (
                  upcomingRequests.map((request) => {
                    const intern = internsById[request.intern_id];
                    const today = startOfToday();
                    const daysUntil = differenceInCalendarDays(new Date(request.start_date), today);
                    let timelineLabel = t('vacation.stats.startsToday');
                    if (daysUntil > 0) {
                      timelineLabel = t('vacation.stats.startsIn', {
                        count: daysUntil,
                        suffix: daysUntil !== 1 ? 's' : '',
                      });
                    }
                    if (daysUntil < 0 && new Date(request.end_date) >= today) {
                      timelineLabel = t('vacation.stats.inProgress');
                    }

                    return (
                      <div key={request.id} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand2 flex items-center justify-center text-xl">
                          {intern?.avatar_url || '👤'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-primary truncate">
                            {intern?.full_name || t('vacation.unknownIntern')}
                          </p>
                          <p className="text-xs text-muted">
                            {t('vacation.stats.range', {
                              start: format(new Date(request.start_date), 'MMM d'),
                              end: format(new Date(request.end_date), 'MMM d'),
                            })}
                          </p>
                          <p className="text-xs text-secondary mt-1">{timelineLabel}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted">
                    {t('vacation.stats.noUpcoming')}
                  </p>
                )}
              </div>
            </section>

            <section className="p-4 border border-border rounded-xl bg-surface2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-primary">
                  {t('vacation.internOverview.title')}
                </h3>
                <span className="text-xs text-muted">
                  {t('vacation.internOverview.count', {
                    count: interns.length,
                    suffix: interns.length !== 1 ? 's' : '',
                  })}
                </span>
              </div>
              <p className="text-xs text-muted mt-1">
                {t('vacation.internOverview.subtitle')}
              </p>
              <div className="mt-3 space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {internSummaries.map(({ intern, latest }) => (
                  <div
                    key={intern.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-surface p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">
                        {intern.full_name}
                      </p>
                      {latest ? (
                        <p className="text-xs text-muted mt-1">
                          {t('vacation.internOverview.latest', {
                            status: getStatusLabel(latest.status),
                            range: t('vacation.stats.range', {
                              start: format(new Date(latest.start_date), 'MMM d'),
                              end: format(new Date(latest.end_date), 'MMM d'),
                            }),
                          })}
                        </p>
                      ) : (
                        <p className="text-xs text-muted mt-1">
                          {t('vacation.internOverview.none')}
                        </p>
                      )}
                    </div>
                    {latest && (
                      <Badge className={`${statusColors[latest.status]} border hidden sm:inline-flex`}>
                        {getStatusLabel(latest.status)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={!!emojiEditor}
        onOpenChange={(open) => {
          if (!open && !isUpdatingEmoji) {
            closeEmojiEditor();
          }
        }}
      >
        <DialogContent className="bg-surface border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">{t('vacation.emoji.title')}</DialogTitle>
            <DialogDescription className="text-secondary">
              {t('vacation.emoji.description', {
                name: emojiEditor?.full_name || t('vacation.unknownIntern'),
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-brand2 p-0.5">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
                  <Avatar
                    src={previewEmoji}
                    alt={emojiEditor?.full_name || 'Intern avatar preview'}
                    size={56}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-secondary">{t('vacation.emoji.preview')}</p>
                <p className="text-base font-semibold text-primary truncate max-w-[180px]">
                  {emojiEditor?.full_name || t('vacation.unknownIntern')}
                </p>
              </div>
            </div>

            <Input
              value={emojiValue}
              onChange={(e) => setEmojiValue(e.target.value)}
              placeholder={t('vacation.emoji.placeholder')}
              className="bg-surface2 border-border text-primary"
            />
            <p className="text-xs text-muted">
              {t('vacation.emoji.helper')}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (!isUpdatingEmoji) {
                  closeEmojiEditor();
                }
              }}
              className="border-border"
            >
              {t('vacation.emoji.cancel')}
            </Button>
            <Button
              onClick={saveEmoji}
              disabled={!emojiHasChanges || isUpdatingEmoji}
              className="bg-brand hover:bg-brand/90 text-white font-medium"
            >
              {t('vacation.emoji.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent className="bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="text-primary">{t('vacation.rejectTitle')}</DialogTitle>
            <DialogDescription className="text-secondary">
              {t('vacation.rejectDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-secondary mb-2 block">
                {t('vacation.managerNoteOptional')}
              </label>
              <Textarea
                value={managerNote}
                onChange={(e) => setManagerNote(e.target.value)}
                placeholder={t('vacation.rejectPlaceholder')}
                className="bg-surface2 border-border text-primary"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog(null)}
              className="border-border"
            >
              {t('vacation.actions.cancel')}
            </Button>
            <Button
              onClick={confirmReject}
              disabled={processingId === rejectDialog?.id}
              className="bg-error hover:bg-error/90 text-white font-medium"
            >
              <X className="w-4 h-4 mr-2" />
              {t('vacation.rejectConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
