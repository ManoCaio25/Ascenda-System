import React, { useEffect, useMemo, useState } from 'react';
import { Activity, User } from '@estagiario/Entities/all';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Link as LinkIcon,
  Reply,
} from 'lucide-react';
import { Button } from '@estagiario/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@estagiario/Components/ui/dialog';
import Textarea from '@estagiario/Components/ui/textarea';

const statusConfig = {
  open: {
    label: 'Aberta',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
  },
  in_progress: {
    label: 'Em andamento',
    badge: 'bg-blue-500/20 text-blue-200 border border-blue-500/40',
  },
  completed: {
    label: 'Concluída',
    badge: 'bg-purple-500/20 text-purple-200 border border-purple-500/40',
  },
};

const rarityColor = {
  ritual: 'from-purple-500/80 to-purple-300/30',
  project: 'from-orange-500/80 to-orange-300/30',
  reflection: 'from-blue-500/80 to-blue-300/30',
};

function formatDeadline(dateString) {
  try {
    return format(new Date(dateString), "dd MMM, HH:mm");
  } catch (error) {
    return dateString;
  }
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [responseLinks, setResponseLinks] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    Activity.list('-created_date').then(setActivities);
    User.me()
      .then(setUser)
      .catch(() =>
        setUser({
          full_name: 'Caio Menezes',
          email: 'caio.alvarenga@ascenda.com',
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const open = activities.filter((activity) => activity.status !== 'completed');
    const completed = activities.filter((activity) => activity.status === 'completed');
    const next = open
      .map((activity) => new Date(activity.prazo_resposta))
      .sort((a, b) => a.getTime() - b.getTime())[0];

    return {
      open: open.length,
      completed: completed.length,
      nextDeadline: next ? formatDeadline(next) : '—',
    };
  }, [activities]);

  const handleRespond = async () => {
    if (!selectedActivity || !responseText.trim()) return;

    const payload = {
      autor: user?.full_name || 'Você',
      conteudo: responseText.trim(),
      links: responseLinks
        .split('\n')
        .map((link) => link.trim())
        .filter(Boolean),
      tipo: 'intern',
    };

    const updated = await Activity.addResponse(selectedActivity.id, payload);
    if (updated) {
      setActivities((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedActivity(updated);
      setResponseText('');
      setResponseLinks('');
    }
  };

  const handleMarkComplete = async (activityId) => {
    const updated = await Activity.update(activityId, { status: 'completed' });
    if (updated) {
      setActivities((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedActivity((current) => (current?.id === updated.id ? updated : current));
    }
  };

  const closeDialog = () => {
    setSelectedActivity(null);
    setResponseText('');
    setResponseLinks('');
  };

  const isEmpty = !loading && activities.length === 0;

  return (
    <div className="p-8 max-w-6xl mx-auto text-white space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="cosmic-card rounded-2xl p-6 border border-purple-500/30 backdrop-blur"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-purple-300">
              <ClipboardList className="w-4 h-4" /> Mentor Activities
            </span>
            <h1 className="text-3xl font-bold">Sua jornada guiada pelo padrinho</h1>
            <p className="text-slate-300 max-w-2xl">
              Acompanhe missões, rituais e reflexões enviados pelo seu padrinho. Responda rapidamente
              para manter a constelação alinhada!
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 min-w-[260px]">
            <div className="rounded-xl border border-purple-500/40 bg-purple-500/10 p-4 text-center">
              <p className="text-sm text-purple-200">Abertas</p>
              <p className="text-2xl font-bold">{summary.open}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center">
              <p className="text-sm text-emerald-200">Concluídas</p>
              <p className="text-2xl font-bold">{summary.completed}</p>
            </div>
            <div className="rounded-xl border border-orange-500/40 bg-orange-500/10 p-4 text-center">
              <p className="text-sm text-orange-200">Próximo prazo</p>
              <p className="text-lg font-semibold">{summary.nextDeadline}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {isEmpty ? (
        <div className="cosmic-card rounded-2xl p-12 text-center border border-dashed border-purple-500/40">
          <Sparkles className="w-10 h-10 text-purple-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Tudo pronto por aqui!</h2>
          <p className="text-slate-400">
            Seu padrinho ainda não enviou novas atividades. Aproveite para revisar suas conquistas.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {activities.map((activity, index) => {
            const status = statusConfig[activity.status] || statusConfig.open;
            const gradient = rarityColor[activity.categoria] || 'from-purple-500/80 to-slate-700/30';
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="cosmic-card rounded-2xl p-6 border border-purple-500/20"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold bg-gradient-to-r ${gradient}`}>
                        {activity.categoria}
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status.badge}`}>
                        {status.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-4 h-4" /> {formatDeadline(activity.prazo_resposta)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold mb-1">{activity.titulo}</h2>
                      <p className="text-slate-300 leading-relaxed">{activity.descricao}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700">
                        <Sparkles className="w-4 h-4 text-purple-300" /> Mentor: {activity.mentor}
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700">
                        <MessageCircle className="w-4 h-4 text-orange-300" /> {activity.respostas?.length || 0} interações
                      </span>
                    </div>
                    {activity.recursos_sugeridos?.length ? (
                      <div className="text-sm">
                        <p className="text-slate-400 mb-1">Recursos sugeridos</p>
                        <div className="flex flex-wrap gap-2">
                          {activity.recursos_sugeridos.map((link) => (
                            <a
                              key={link}
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-purple-500/50 text-purple-200 hover:bg-purple-500/10"
                            >
                              <LinkIcon className="w-3 h-3" /> {link.replace('https://', '')}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3 min-w-[220px]">
                    <Button
                      variant="gradient"
                      onClick={() => setSelectedActivity(activity)}
                      className="w-full"
                    >
                      Responder atividade
                    </Button>
                    {activity.status !== 'completed' ? (
                      <Button
                        variant="outline"
                        className="w-full border-emerald-400 text-emerald-200 hover:bg-emerald-500/10"
                        onClick={() => handleMarkComplete(activity.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar como concluída
                      </Button>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/40 rounded-lg py-2">
                        <CheckCircle2 className="w-4 h-4" /> Entrega registrada
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={Boolean(selectedActivity)} onOpenChange={closeDialog}>
        {selectedActivity ? (
          <DialogContent className="bg-slate-950/95 border border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <Reply className="w-6 h-6 text-purple-300" /> {selectedActivity.titulo}
              </DialogTitle>
              <DialogDescription>
                Prazo: {formatDeadline(selectedActivity.prazo_resposta)} · Mentor {selectedActivity.mentor}
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300" htmlFor="activity-response">
                  Sua resposta
                </label>
                <Textarea
                  id="activity-response"
                  rows={5}
                  placeholder="Compartilhe seus insights, anexos ou dúvidas..."
                  value={responseText}
                  onChange={(event) => setResponseText(event.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300" htmlFor="activity-links">
                  Links úteis (opcional)
                </label>
                <Textarea
                  id="activity-links"
                  rows={3}
                  placeholder="Cole cada link em uma nova linha"
                  value={responseLinks}
                  onChange={(event) => setResponseLinks(event.target.value)}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-200">Histórico de interações</p>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {selectedActivity.respostas?.length ? (
                    selectedActivity.respostas
                      .slice()
                      .reverse()
                      .map((resposta) => (
                        <div
                          key={resposta.id}
                          className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white">{resposta.autor}</span>
                            <span className="text-xs text-slate-400">
                              {formatDeadline(resposta.created_date)}
                            </span>
                          </div>
                          <p className="text-slate-300 whitespace-pre-line">{resposta.conteudo}</p>
                          {resposta.links?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {resposta.links.map((link) => (
                                <a
                                  key={link}
                                  href={link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-purple-200 hover:text-purple-100"
                                >
                                  <LinkIcon className="w-3 h-3" /> {link}
                                </a>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-slate-400">Seja o primeiro a responder esta atividade.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <Button variant="ghost" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button variant="gradient" onClick={handleRespond} disabled={!responseText.trim()}>
                  Enviar resposta
                </Button>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
