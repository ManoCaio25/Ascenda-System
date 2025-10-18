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
} from 'lucide-react';
import { Progress } from '@estagiario/Components/ui/progress';
import { Dialog, DialogContent } from '@estagiario/Components/ui/dialog';
import VideoPlayer from '@estagiario/Components/learning/VideoPlayer.jsx';
import { readStoredVideoProgress } from '@estagiario/hooks/useVideoProgress';
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onContentClick(item)}
      className="w-full text-left flex items-center gap-4 p-4 cosmic-card rounded-lg hover:border-purple-500 transition-all duration-300 cursor-pointer border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
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

  const closeDialog = () => {
    setSelectedContent(null);
  };

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
  const computedLearningProgress = useMemo(() => {
    if (!contents.length) {
      return learningPath.progress_percent || 0;
    }

    const total = contents.length;
    if (total === 0) {
      return learningPath.progress_percent || 0;
    }

    const completedCount = contents.reduce((count, item) => {
      const progressState = contentProgress[item.id];
      if (progressState?.completed || item.status_conclusao === 'Concluido') {
        return count + 1;
      }
      return count;
    }, 0);

    const localPercent = Math.round((completedCount / total) * 100);
    return Math.max(localPercent, learningPath.progress_percent || 0);
  }, [contentProgress, contents, learningPath.progress_percent]);

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

      {!hasContent && (
        <div className="cosmic-card rounded-xl p-10 text-center border border-dashed border-purple-500/30">
          <p className="text-text-secondary">{t('noContentAvailable')}</p>
        </div>
      )}

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
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <Dialog open={Boolean(selectedContent)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="cosmic-card text-text-primary border-purple-700/60 max-w-6xl w-full overflow-hidden bg-slate-950/95 p-0">
          {selectedContent?.tipo_conteudo === 'Video' && selectedVideoId ? (
            <VideoPlayer
              contentId={selectedContent.id}
              videoId={selectedVideoId}
              title={selectedContent.titulo}
              description={selectedContent.descricao}
              onClose={closeDialog}
              onProgressChange={handleVideoProgressChange}
              onCompletion={handleVideoCompletion}
              levelLabel={badgeLabels[selectedContent.level]}
              estimatedMinutes={hasEstimatedMinutes ? estimatedMinutes : null}
              contentType={selectedContent.tipo_conteudo}
            />
          ) : selectedContent?.url_acesso ? (
            <div className="space-y-6 p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-text-primary">{selectedContent.titulo}</h2>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/20"
                >
                  {t('videoBackToLearningPath')}
                </button>
              </div>
              {selectedContent.descricao && <p className="text-sm text-text-secondary">{selectedContent.descricao}</p>}
              <a
                href={selectedContent.url_acesso}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 self-start rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/20"
              >
                <LinkIcon className="w-4 h-4" />
                {t('openContentLink')}
              </a>
            </div>
          ) : selectedContent ? (
            <div className="space-y-6 p-10 text-center text-text-secondary">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-purple-300" />
              <h3 className="text-xl font-semibold text-text-primary">{t('contentPlaceholderTitle')}</h3>
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
    </div>
  );
}
