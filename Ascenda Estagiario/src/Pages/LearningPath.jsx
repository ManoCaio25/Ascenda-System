import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LearningPath as LearningPathEntity, Content } from '@estagiario/Entities/all';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Play,
  FileText,
  ExternalLink,
  BookOpen,
  Clock,
  Lock,
  Star,
  Link as LinkIcon,
  Sparkles,
  Target,
} from 'lucide-react';
import { Progress } from '@estagiario/Components/ui/progress';
import { Dialog, DialogContent } from '@estagiario/Components/ui/dialog';
import VideoPlayer from '@estagiario/Components/learning/VideoPlayer.jsx';
import { formatVideoTime, readStoredVideoProgress } from '@estagiario/hooks/useVideoProgress';
import { useI18n } from '@estagiario/Components/utils/i18n';

const LEVEL_ORDER = ['Basic', 'Medium', 'Advanced'];
const getYoutubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const statusConfig = (status, t, isCompleted = false) => {
  if (isCompleted || status === 'Concluido') {
    return { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, label: t('contentStatusCompleted') };
  }

  if (status === 'Em Progresso') {
    return { icon: <Clock className="w-5 h-5 text-amber-400" />, label: t('contentStatusInProgress') };
  }

  return { icon: <Lock className="w-5 h-5 text-slate-500" />, label: t('contentStatusLocked') };
};

const levelStyles = {
  Basic: { badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30', iconColor: 'text-emerald-400' },
  Medium: { badge: 'bg-amber-500/10 text-amber-300 border border-amber-500/30', iconColor: 'text-amber-300' },
  Advanced: { badge: 'bg-rose-500/10 text-rose-300 border border-rose-500/30', iconColor: 'text-rose-300' },
};

const clampPercent = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
};

const formatTotalDuration = (minutes) => {
  if (!minutes || Number.isNaN(minutes)) return 0;
  if (minutes < 60) return minutes;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return { hours, minutes: remaining };
};

const ContentItem = ({ item, index, onContentClick, progressState, levelBadge, t }) => {
  const isVideo = item.tipo_conteudo === 'Video';
  const completionState = Boolean(progressState?.completed || item.status_conclusao === 'Concluido');
  const status = statusConfig(item.status_conclusao, t, completionState);
  const percentWatched = completionState ? 100 : clampPercent(progressState?.percent || 0);
  const showProgress = isVideo && (percentWatched > 0 || completionState);
  const hasProgressBadge = isVideo && percentWatched > 0 && !completionState;
  const minutesElapsed = Math.floor((progressState?.currentTime || 0) / 60);
  const levelStyle = levelStyles[item.level] || levelStyles.Basic;

  const getTypeIcon = () => {
    switch (item.tipo_conteudo) {
      case 'Video':
        return <Play className="w-4 h-4" />;
      case 'PDF':
        return <FileText className="w-4 h-4" />;
      case 'Link Externo':
        return <ExternalLink className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onContentClick(item)}
      className="group w-full text-left flex items-center gap-5 p-5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-purple-400/60 hover:bg-slate-900/90 transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      <div className="relative flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/60 to-emerald-500/40 text-lg font-bold text-white shadow-[0_12px_40px_rgba(168,85,247,0.35)]">
        <span>{String(item.ordem_na_trilha).padStart(2, '0')}</span>
        <span className="absolute -bottom-1 h-1 w-12 rounded-full bg-white/20" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-semibold text-text-primary text-xl leading-tight group-hover:text-white transition-colors">
            {item.titulo}
          </h3>
          {levelBadge && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${levelStyle.badge}`}>
              <span className="inline-flex items-center gap-1">
                <Star className={`w-3 h-3 ${levelStyle.iconColor}`} />
                {levelBadge}
              </span>
            </span>
          )}
          {hasProgressBadge && (
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-[11px] font-semibold text-purple-200">
              <Play className="w-3 h-3" />
              {t('resumeFrom', { minutes: minutesElapsed })}
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary/80 line-clamp-2">{item.descricao}</p>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2 text-text-secondary">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-200">
              {getTypeIcon()}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-text-secondary/60">{t('contentType')}</p>
              <p className="font-medium text-text-primary">{item.tipo_conteudo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2 text-text-secondary">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-200">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-text-secondary/60">{t('duration')}</p>
              <p className="font-medium text-text-primary">{item.duracao_estimada_minutos} {t('minutes')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2 text-text-secondary">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-200">
              {status.icon}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-text-secondary/60">{t('status')}</p>
              <p className="font-medium text-text-primary">{status.label}</p>
            </div>
          </div>
        </div>
        {showProgress && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Progress value={percentWatched} className="h-2 bg-white/10" />
            </div>
            <span className="text-xs font-semibold text-purple-200">{Math.round(percentWatched)}%</span>
          </div>
        )}
      </div>
      <div className="shrink-0 self-stretch">
        <div className="flex h-full flex-col items-center justify-between">
          <span className="h-full w-px rounded-full bg-gradient-to-b from-transparent via-purple-500/50 to-transparent" />
          <span className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-200 shadow-inner shadow-purple-500/30">
            <Play className="w-4 h-4" />
          </span>
        </div>
      </div>
    </motion.button>
  );
};

export default function LearningPathPage() {
  const { t } = useI18n();
  const [learningPath, setLearningPath] = useState(null);
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentProgress, setContentProgress] = useState({});
  const [videoNotification, setVideoNotification] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [pathData, contentData] = await Promise.all([
        LearningPathEntity.list('-created_date', 1).then((res) => res[0]),
        Content.list('ordem_na_trilha')
      ]);
      setLearningPath(pathData);
      setContents(contentData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!contents.length) return;
    const storedProgress = contents.reduce((acc, item) => {
      const stored = readStoredVideoProgress(item.id);
      const isCompleted = item.status_conclusao === 'Concluido';
      acc[item.id] = {
        percent: isCompleted ? 100 : clampPercent(stored.percent),
        currentTime: stored.currentTime,
        completed: isCompleted || stored.completed,
      };
      return acc;
    }, {});
    setContentProgress(storedProgress);
  }, [contents]);

  const groupedContents = useMemo(() => {
    const groups = LEVEL_ORDER.reduce((acc, level) => {
      acc[level] = [];
      return acc;
    }, {});

    contents.forEach((content) => {
      const level = LEVEL_ORDER.includes(content.level) ? content.level : 'Basic';
      groups[level].push(content);
    });

    LEVEL_ORDER.forEach((level) => {
      groups[level] = groups[level]
        .slice()
        .sort((a, b) => (a.ordem_na_trilha || 0) - (b.ordem_na_trilha || 0));
    });

    return groups;
  }, [contents]);

  const handleContentClick = (content) => {
    setSelectedContent(content);
  };

  const handleVideoProgressChange = useCallback((contentId, progressData) => {
    if (!contentId || !progressData) return;
    setContentProgress((prev) => {
      const previous = prev[contentId] || { percent: 0, currentTime: 0, completed: false };
      return {
        ...prev,
        [contentId]: {
          percent: clampPercent(progressData.percent ?? previous.percent),
          currentTime:
            typeof progressData.currentTime === 'number'
              ? Math.max(0, progressData.currentTime)
              : previous.currentTime,
          completed: progressData.completed ?? previous.completed,
        },
      };
    });
  }, []);

  const handleVideoCompletion = useCallback(
    (contentId, progressData) => {
      if (!contentId) return;
      handleVideoProgressChange(contentId, { ...progressData, completed: true });
    },
    [handleVideoProgressChange],
  );

  const closeDialog = useCallback(() => {
    setSelectedContent(null);
  }, []);

  const handlePlayerClose = useCallback(
    (payload = {}) => {
      if (selectedContent) {
        const progressState = payload.contentId
          ? {
              percent: payload.percent,
              currentTime: payload.currentTime,
              completed: payload.completed,
            }
          : contentProgress[selectedContent.id];

        if (progressState) {
          const message = progressState.completed
            ? t('videoProgressNotificationCompleted')
            : t('videoProgressNotificationResume', {
                time: formatVideoTime(Math.max(0, progressState.currentTime || 0)),
              });

          setVideoNotification({
            id: selectedContent.id,
            title: t('videoProgressNotificationTitle', { title: selectedContent.titulo }),
            message,
          });
        }
      }

      closeDialog();
    },
    [closeDialog, contentProgress, selectedContent, t],
  );

  useEffect(() => {
    if (!videoNotification) return undefined;
    const timeout = setTimeout(() => setVideoNotification(null), 5000);
    return () => clearTimeout(timeout);
  }, [videoNotification]);

  const learningProgressBaseline = learningPath?.progress_percent ?? 0;

  const computedLearningProgress = useMemo(() => {
    if (!Array.isArray(contents) || contents.length === 0) {
      return learningProgressBaseline;
    }

    const completedCount = contents.reduce((count, item) => {
      const progressState = contentProgress[item.id];
      if (progressState?.completed || item.status_conclusao === 'Concluido') {
        return count + 1;
      }
      return count;
    }, 0);

    const localPercent = Math.round((completedCount / contents.length) * 100);
    return Math.max(localPercent, learningProgressBaseline);
  }, [contentProgress, contents, learningProgressBaseline]);

  if (isLoading || !learningPath) {
    return <div className="text-center p-10 text-text-secondary">{t('learningPathLoading')}</div>;
  }

  const moduleLabels = {
    Basic: t('learningModuleBeginner'),
    Medium: t('learningModuleIntermediate'),
    Advanced: t('learningModuleAdvanced'),
  };

  const badgeLabels = {
    Basic: t('basic'),
    Medium: t('intermediate'),
    Advanced: t('advanced'),
  };

  const hasContent = contents.length > 0;
  const selectedVideoId = getYoutubeVideoId(selectedContent?.url_acesso);
  const estimatedMinutes = selectedContent?.duracao_estimada_minutos;
  const hasEstimatedMinutes = typeof estimatedMinutes === 'number' && !Number.isNaN(estimatedMinutes);

  const totalDurationMinutes = useMemo(
    () =>
      contents.reduce((total, item) => {
        if (typeof item.duracao_estimada_minutos === 'number') {
          return total + item.duracao_estimada_minutos;
        }
        return total;
      }, 0),
    [contents],
  );

  const formattedDuration = useMemo(() => {
    const total = formatTotalDuration(totalDurationMinutes);
    if (typeof total === 'number') {
      return `${total} ${t('minutes')}`;
    }
    if (total.hours && total.minutes) {
      return `${total.hours}h ${total.minutes} ${t('minutes')}`;
    }
    if (total.hours) {
      return `${total.hours}h`;
    }
    return `${total.minutes} ${t('minutes')}`;
  }, [t, totalDurationMinutes]);

  const completedContents = useMemo(
    () =>
      contents.filter((item) => {
        const progressState = contentProgress[item.id];
        return progressState?.completed || item.status_conclusao === 'Concluido';
      }),
    [contentProgress, contents],
  );

  const videoCount = useMemo(() => contents.filter((item) => item.tipo_conteudo === 'Video').length, [contents]);
  const pdfCount = useMemo(() => contents.filter((item) => item.tipo_conteudo === 'PDF').length, [contents]);
  const externalLinksCount = useMemo(
    () => contents.filter((item) => item.tipo_conteudo === 'Link Externo').length,
    [contents],
  );

  const stats = [
    {
      icon: <CheckCircle className="h-5 w-5" />,
      label: t('learningProgress'),
      value: `${computedLearningProgress}%`,
      hint: t('videoProgressSaved'),
    },
    {
      icon: <Play className="h-5 w-5" />,
      label: t('videoProgressLabel'),
      value: `${videoCount} ${t('contentTypeVideo', { count: videoCount })}`,
      hint: `${pdfCount} PDF · ${externalLinksCount} ${t('links')}`,
    },
    {
      icon: <Target className="h-5 w-5" />,
      label: t('coursesCompleted'),
      value: `${completedContents.length}/${contents.length}`,
      hint: t('learningProgress'),
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      label: t('videoEstimatedDuration'),
      value: formattedDuration,
      hint: t('videoLessonInsights'),
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-text-primary">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),_transparent_70%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-20 pt-14 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-950/95 p-10 shadow-[0_30px_80px_rgba(15,23,42,0.45)]"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-purple-200">
                {t('learningPath')}
              </span>
              <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
                {learningPath.nome_trilha}
              </h1>
              <p className="text-base text-text-secondary/80 md:text-lg">{learningPath.descricao}</p>
              <div className="flex items-center gap-4">
                <Progress value={computedLearningProgress} className="h-2 flex-1 bg-white/10" />
                <span className="text-2xl font-semibold text-purple-200">{computedLearningProgress}%</span>
              </div>
            </div>
            <div className="grid w-full max-w-md grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-slate-950/80 p-5 text-sm">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-2 rounded-xl border border-white/5 bg-slate-900/80 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-purple-200/80">
                    {stat.icon}
                    {stat.label}
                  </div>
                  <p className="text-lg font-semibold text-white">{stat.value}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-secondary/70">{stat.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {!hasContent && (
          <div className="rounded-3xl border border-dashed border-purple-500/40 bg-slate-900/60 p-10 text-center">
            <p className="text-text-secondary">{t('noContentAvailable')}</p>
          </div>
        )}

        {LEVEL_ORDER.map((level) => {
          const items = groupedContents[level] || [];
          if (!items.length) return null;
          const levelBadgeLabel = badgeLabels[level] || badgeLabels.Basic;
          const completedCountForLevel = items.reduce((count, item) => {
            const progressState = contentProgress[item.id];
            if (progressState?.completed || item.status_conclusao === 'Concluido') {
              return count + 1;
            }
            return count;
          }, 0);
          const levelPercent = items.length ? Math.round((completedCountForLevel / items.length) * 100) : 0;

          return (
            <section key={level} className="space-y-6">
              <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-200/80">{levelBadgeLabel}</p>
                  <h2 className="text-2xl font-semibold text-white">{moduleLabels[level]}</h2>
                </div>
                <div className="inline-flex items-center gap-3 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm text-purple-100">
                  <Clock className="h-4 w-4" />
                  {t('learningProgress')}: {levelPercent}%
                </div>
              </header>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <ContentItem
                    key={item.id}
                    item={item}
                    index={index}
                    onContentClick={handleContentClick}
                    progressState={contentProgress[item.id]}
                    levelBadge={levelBadgeLabel}
                    t={t}
                  />
                ))}
              </div>
            </section>
          );
        })}

        <Dialog open={Boolean(selectedContent)} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="max-w-6xl border border-purple-700/60 bg-slate-950/95 p-0 text-text-primary shadow-[0_40px_80px_rgba(76,29,149,0.45)]">
            {selectedContent?.tipo_conteudo === 'Video' && selectedVideoId ? (
              <VideoPlayer
                contentId={selectedContent.id}
                videoId={selectedVideoId}
                title={selectedContent.titulo}
                description={selectedContent.descricao}
                onClose={handlePlayerClose}
                onProgressChange={handleVideoProgressChange}
                onCompletion={handleVideoCompletion}
                levelLabel={badgeLabels[selectedContent.level]}
                estimatedMinutes={hasEstimatedMinutes ? estimatedMinutes : null}
                contentType={selectedContent.tipo_conteudo}
              />
            ) : selectedContent?.url_acesso ? (
              <div className="space-y-6 p-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-3xl font-semibold text-white">{selectedContent.titulo}</h2>
                    {selectedContent.descricao && <p className="mt-2 text-sm text-text-secondary">{selectedContent.descricao}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/20"
                  >
                    {t('videoBackToLearningPath')}
                  </button>
                </div>
                <a
                  href={selectedContent.url_acesso}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:border-purple-400/60 hover:bg-purple-500/20"
                >
                  <LinkIcon className="h-4 w-4" />
                  {t('openContentLink')}
                </a>
              </div>
            ) : selectedContent ? (
              <div className="space-y-6 p-12 text-center text-text-secondary">
                <BookOpen className="mx-auto h-16 w-16 text-purple-300" />
                <h3 className="text-xl font-semibold text-white">{t('contentPlaceholderTitle')}</h3>
                <p>{t('contentPlaceholderDescription')}</p>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="mx-auto inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/20"
                >
                  {t('videoBackToLearningPath')}
                </button>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      {videoNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-purple-500/40 bg-slate-900/95 p-5 shadow-lg shadow-purple-500/30">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <div className="flex-1 text-text-primary">
              <p className="text-sm font-semibold text-purple-200">{videoNotification.title}</p>
              <p className="mt-1 text-xs text-text-secondary/80">{videoNotification.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setVideoNotification(null)}
              className="rounded-full p-1 text-text-secondary transition hover:text-text-primary"
              aria-label={t('videoClosePlayer')}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
