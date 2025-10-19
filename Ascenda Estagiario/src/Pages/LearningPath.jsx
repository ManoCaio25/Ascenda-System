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
  AlertTriangle,
} from 'lucide-react';
import { Progress } from '@estagiario/Components/ui/progress';
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
  Basic: { badge: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30', iconColor: 'text-emerald-500' },
  Medium: { badge: 'bg-amber-500/10 text-amber-500 border border-amber-500/30', iconColor: 'text-amber-500' },
  Advanced: { badge: 'bg-rose-500/10 text-rose-500 border border-rose-500/30', iconColor: 'text-rose-500' },
};

const clampPercent = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
};

const ContentItem = ({ item, index, onContentClick, progressState, levelBadge, t, isSelected }) => {
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onContentClick(item)}
      className={`w-full text-left flex items-center gap-4 p-4 cosmic-card rounded-lg transition-all duration-300 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
        isSelected
          ? 'border-purple-500/60 bg-purple-500/10 shadow-[0_0_24px_rgba(168,85,247,0.25)]'
          : 'border-transparent hover:border-purple-500/40 hover:bg-purple-500/10'
      }`}
      data-selected={isSelected || undefined}
      aria-pressed={isSelected}
    >
      <div className="text-3xl font-bold text-text-secondary">{String(item.ordem_na_trilha).padStart(2, '0')}</div>
      <div className="flex-grow space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-semibold text-text-primary text-lg">{item.titulo}</h3>
          {levelBadge && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${levelStyle.badge}`}>
              <span className="inline-flex items-center gap-1">
                <Star className={`w-3 h-3 ${levelStyle.iconColor}`} />
                {levelBadge}
              </span>
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary/80">
          <div className="flex items-center gap-1">
            {getTypeIcon()}
            <span>{item.tipo_conteudo}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{item.duracao_estimada_minutos} {t('minutes')}</span>
          </div>
          <div className="flex items-center gap-1">
            {status.icon}
            <span>{status.label}</span>
          </div>
          {hasProgressBadge && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-300 bg-purple-500/10 px-2 py-1 rounded-full">
              <Play className="w-3 h-3" />
              {t('resumeFrom', { minutes: minutesElapsed })}
            </span>
          )}
        </div>
        {showProgress && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Progress value={percentWatched} className="h-1.5" />
            </div>
            <span className="text-xs font-semibold text-purple-200">{Math.round(percentWatched)}%</span>
          </div>
        )}
      </div>
      <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
        {status.icon}
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

  const showProgressNotification = useCallback(
    (content, progressState) => {
      if (!content || content.tipo_conteudo !== 'Video' || !progressState) {
        return;
      }

      const message = progressState.completed
        ? t('videoProgressNotificationCompleted')
        : t('videoProgressNotificationResume', {
            time: formatVideoTime(Math.max(0, progressState.currentTime || 0)),
          });

      setVideoNotification({
        id: content.id,
        title: t('videoProgressNotificationTitle', { title: content.titulo }),
        message,
      });
    },
    [t],
  );

  const closeViewerWithProgress = useCallback(
    (payload = {}) => {
      if (!selectedContent) return;

      let progressState = null;
      if (payload.contentId) {
        progressState = {
          percent: clampPercent(payload.percent ?? 0),
          currentTime: Math.max(0, payload.currentTime || 0),
          completed: Boolean(payload.completed),
        };
      } else if (contentProgress[selectedContent.id]) {
        progressState = contentProgress[selectedContent.id];
      }

      showProgressNotification(selectedContent, progressState);
      setSelectedContent(null);
    },
    [contentProgress, selectedContent, showProgressNotification],
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
  const selectedProgressState = selectedContent ? contentProgress[selectedContent.id] : null;
  const selectedVideoId = selectedContent ? getYoutubeVideoId(selectedContent.url_acesso) : null;
  const estimatedMinutes = selectedContent?.duracao_estimada_minutos;
  const hasEstimatedMinutes = typeof estimatedMinutes === 'number' && !Number.isNaN(estimatedMinutes);

  const renderSelectedPanel = () => {
    if (!selectedContent) {
      return (
        <div className="cosmic-card rounded-2xl border border-purple-700/40 bg-slate-950/70 p-10 text-center text-text-secondary">
          <BookOpen className="mx-auto mb-4 h-14 w-14 text-purple-300" />
          <h3 className="text-xl font-semibold text-text-primary">{t('learningContentEmptyTitle')}</h3>
          <p className="mt-2 text-sm">{t('learningContentEmptyDescription')}</p>
        </div>
      );
    }

    const headerTag = badgeLabels[selectedContent.level] || selectedContent.tipo_conteudo || t('learningContentDetailsHeading');
    const metadata = [
      { label: t('learningContentMetaType'), value: selectedContent.tipo_conteudo || '—' },
    ];
    const showHeaderDescription = selectedContent.tipo_conteudo === 'Video';

    if (selectedContent.level) {
      metadata.push({
        label: t('learningContentMetaLevel'),
        value: badgeLabels[selectedContent.level] || selectedContent.level,
      });
    }

    if (hasEstimatedMinutes) {
      metadata.push({
        label: t('learningContentMetaDuration'),
        value: `${estimatedMinutes} ${t('minutes')}`,
      });
    }

    if (selectedContent.tipo_conteudo === 'Video' && selectedProgressState) {
      metadata.push({
        label: t('learningContentMetaProgress'),
        value: selectedProgressState.completed
          ? t('contentStatusCompleted')
          : `${Math.round(clampPercent(selectedProgressState.percent))}%`,
      });
    } else if (selectedContent.status_conclusao) {
      const status = statusConfig(selectedContent.status_conclusao, t, selectedProgressState?.completed);
      metadata.push({
        label: t('learningContentMetaStatus'),
        value: status.label,
      });
    }

    const resumeBadge =
      selectedContent.tipo_conteudo === 'Video' &&
      selectedProgressState &&
      !selectedProgressState.completed &&
      (selectedProgressState.currentTime || 0) > 0
        ? t('resumeFrom', { minutes: Math.floor(Math.max(0, selectedProgressState.currentTime || 0) / 60) })
        : null;

    const detailIcon =
      selectedContent.tipo_conteudo === 'Link Externo' ? (
        <ExternalLink className="h-5 w-5 text-purple-300" />
      ) : (
        <FileText className="h-5 w-5 text-purple-300" />
      );

    return (
      <div className="cosmic-card rounded-2xl border border-purple-700/40 bg-slate-950/80 p-6 space-y-6 shadow-lg shadow-purple-900/20">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-200/80">{headerTag}</p>
              <h2 className="text-2xl font-semibold text-text-primary">{selectedContent.titulo}</h2>
            </div>
            <button
              type="button"
              onClick={closeViewerWithProgress}
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/20"
            >
              {t('learningContentCloseViewer')}
            </button>
          </div>
          {selectedContent.descricao && showHeaderDescription && (
            <p className="text-sm leading-relaxed text-text-secondary">{selectedContent.descricao}</p>
          )}
          {resumeBadge && (
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-100">
              <Play className="h-3 w-3" />
              {resumeBadge}
            </span>
          )}
        </div>

        {selectedContent.tipo_conteudo === 'Video' ? (
          selectedVideoId ? (
            <VideoPlayer
              contentId={selectedContent.id}
              videoId={selectedVideoId}
              title={selectedContent.titulo}
              description={selectedContent.descricao}
              onClose={closeViewerWithProgress}
              onProgressChange={handleVideoProgressChange}
              onCompletion={handleVideoCompletion}
              levelLabel={badgeLabels[selectedContent.level]}
              estimatedMinutes={hasEstimatedMinutes ? estimatedMinutes : null}
              contentType={selectedContent.tipo_conteudo}
              variant="inline"
            />
          ) : (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-10 text-center text-text-primary">
              <AlertTriangle className="mx-auto h-12 w-12 text-amber-300" />
              <h3 className="mt-4 text-xl font-semibold text-text-primary">{t('learningContentVideoUnavailableTitle')}</h3>
              <p className="mt-2 text-sm text-text-secondary">{t('learningContentVideoUnavailableDescription')}</p>
              {selectedContent.url_acesso && (
                <a
                  href={selectedContent.url_acesso}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/20"
                >
                  <LinkIcon className="h-4 w-4" />
                  {t('videoOpenInYoutube')}
                </a>
              )}
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-purple-500/40 bg-purple-500/10 p-6 space-y-4 text-text-secondary">
            <div className="flex items-center gap-3 text-text-primary">
              {detailIcon}
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-200">
                {t('learningContentDetailsHeading')}
              </span>
            </div>
            {selectedContent.descricao && (
              <p className="text-sm leading-relaxed text-text-secondary">{selectedContent.descricao}</p>
            )}
            {selectedContent.url_acesso ? (
              <a
                href={selectedContent.url_acesso}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 self-start rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/20"
              >
                <LinkIcon className="h-4 w-4" />
                {t('openContentLink')}
              </a>
            ) : (
              <p className="text-sm text-text-secondary/80">{t('contentPlaceholderDescription')}</p>
            )}
          </div>
        )}

        {metadata.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm text-text-secondary">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-purple-200/80">
              {t('learningContentDetailsHeading')}
            </h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              {metadata.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <dt className="text-text-primary">{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-text-primary space-y-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
          {learningPath.nome_trilha}
        </h1>
        <p className="text-text-secondary max-w-3xl mb-6">{learningPath.descricao}</p>
        <div className="flex items-center gap-4 mb-2">
          <Progress value={computedLearningProgress} className="h-3 flex-1" />
          <span className="font-bold text-lg text-purple-300">{computedLearningProgress}%</span>
        </div>
        <p className="text-xs text-text-secondary/80">{t('videoProgressSaved')}</p>
      </motion.div>

      {hasContent ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            {LEVEL_ORDER.map((level) => {
              const items = groupedContents[level] || [];
              if (!items.length) return null;
              const completedCount = items.reduce((count, item) => {
                const progressState = contentProgress[item.id];
                if (progressState?.completed || item.status_conclusao === 'Concluido') {
                  return count + 1;
                }
                return count;
              }, 0);
              const levelPercent = items.length ? Math.round((completedCount / items.length) * 100) : 0;

              return (
                <section key={level} className="space-y-4">
                  <header className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-text-primary">{moduleLabels[level]}</h2>
                    <span className="text-sm text-text-secondary/80">
                      {t('learningProgress')}: {levelPercent}%
                    </span>
                  </header>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={item.id} className="relative">
                        <ContentItem
                          item={item}
                          index={index}
                          onContentClick={handleContentClick}
                          progressState={contentProgress[item.id]}
                          levelBadge={badgeLabels[level]}
                          t={t}
                          isSelected={selectedContent?.id === item.id}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
          <aside className="space-y-4 lg:sticky lg:top-6">{renderSelectedPanel()}</aside>
        </div>
      ) : (
        <div className="cosmic-card rounded-xl p-10 text-center border border-dashed border-purple-500/30">
          <p className="text-text-secondary">{t('noContentAvailable')}</p>
        </div>
      )}
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
