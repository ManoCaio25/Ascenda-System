import React, { useEffect, useMemo, useState } from 'react';
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
  ArrowLeft,
  X,
  RotateCcw,
} from 'lucide-react';
import { Progress } from '@estagiario/Components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@estagiario/Components/ui/dialog';
import YouTubePlayer from '@estagiario/Components/learning/YouTubePlayer.jsx';
import { useI18n } from '@estagiario/Components/utils/i18n';

const LEVEL_ORDER = ['Basic', 'Medium', 'Advanced'];
const PROGRESS_KEY_PREFIX = 'ascenda-learning-progress';

const createInitialPlaybackState = (currentTime = 0) => ({
  currentTime,
  duration: 0,
  percent: 0,
  state: 'idle',
});

const formatTime = (totalSeconds) => {
  if (typeof totalSeconds !== 'number' || Number.isNaN(totalSeconds) || totalSeconds <= 0) {
    return '00:00';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const getProgressDescriptorKey = (percent) => {
  if (percent >= 85) return 'videoProgressStatusEnd';
  if (percent >= 40) return 'videoProgressStatusMiddle';
  return 'videoProgressStatusBeginning';
};

const getYoutubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const buildProgressKey = (id) => `${PROGRESS_KEY_PREFIX}-${id}`;

const statusConfig = (status, t) => {
  switch (status) {
    case 'Concluido':
      return { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, label: t('contentStatusCompleted') };
    case 'Em Progresso':
      return { icon: <Clock className="w-5 h-5 text-amber-400" />, label: t('contentStatusInProgress') };
    default:
      return { icon: <Lock className="w-5 h-5 text-slate-500" />, label: t('contentStatusLocked') };
  }
};

const levelStyles = {
  Basic: { badge: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30', iconColor: 'text-emerald-500' },
  Medium: { badge: 'bg-amber-500/10 text-amber-500 border border-amber-500/30', iconColor: 'text-amber-500' },
  Advanced: { badge: 'bg-rose-500/10 text-rose-500 border border-rose-500/30', iconColor: 'text-rose-500' },
};

const ContentItem = ({ item, index, onContentClick, progressSeconds, levelBadge, t }) => {
  const status = statusConfig(item.status_conclusao, t);
  const hasProgress = Boolean(progressSeconds && progressSeconds > 0);
  const minutesElapsed = Math.floor((progressSeconds || 0) / 60);
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
          {hasProgress && item.tipo_conteudo === 'Video' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-300 bg-purple-500/10 px-2 py-1 rounded-full">
              <Play className="w-3 h-3" />
              {t('resumeFrom', { minutes: minutesElapsed })}
            </span>
          )}
        </div>
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
  const [videoPlayback, setVideoPlayback] = useState(() => createInitialPlaybackState());
  const [playerInstance, setPlayerInstance] = useState(null);

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
      const stored = localStorage.getItem(buildProgressKey(item.id));
      if (stored) {
        acc[item.id] = Number(stored);
      }
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
    const savedSeconds = contentProgress[content.id] || 0;
    setVideoPlayback(createInitialPlaybackState(savedSeconds));
    setPlayerInstance(null);
  };

  const handleProgressUpdate = (contentId, seconds) => {
    if (!contentId || typeof seconds !== 'number') return;
    const normalizedSeconds = Math.max(0, Math.floor(seconds));
    setContentProgress((prev) => ({ ...prev, [contentId]: normalizedSeconds }));
    localStorage.setItem(buildProgressKey(contentId), String(normalizedSeconds));
  };

  const handleVideoProgress = (progressData) => {
    if (!selectedContent || !progressData) return;
    setVideoPlayback((prev) => ({ ...prev, ...progressData }));
    handleProgressUpdate(selectedContent.id, progressData.currentTime);
  };

  const handleVideoDuration = (duration) => {
    if (!selectedContent || typeof duration !== 'number') return;
    setVideoPlayback((prev) => {
      const normalizedDuration = Math.max(0, Math.floor(duration));
      const currentTime = prev.currentTime || contentProgress[selectedContent.id] || 0;
      const percent = normalizedDuration
        ? Math.min(100, Math.round((currentTime / normalizedDuration) * 100))
        : prev.percent;
      return { ...prev, duration: normalizedDuration, percent };
    });
  };

  const handlePlaybackStateChange = (state) => {
    setVideoPlayback((prev) => ({ ...prev, state }));
  };

  const closeDialog = () => {
    if (selectedContent?.tipo_conteudo === 'Video') {
      const lastKnownTime = videoPlayback.currentTime || selectedProgress || 0;
      handleProgressUpdate(selectedContent.id, lastKnownTime);
    }
    setSelectedContent(null);
    setVideoPlayback(createInitialPlaybackState());
    setPlayerInstance(null);
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
  const selectedProgress = selectedContent ? contentProgress[selectedContent.id] || 0 : 0;
  const youtubeShareUrl = selectedVideoId ? `https://www.youtube.com/watch?v=${selectedVideoId}` : null;
  const estimatedMinutes = selectedContent?.duracao_estimada_minutos;
  const hasEstimatedMinutes = typeof estimatedMinutes === 'number' && !Number.isNaN(estimatedMinutes);
  const playbackStatusKeyMap = {
    idle: 'videoStatusIdle',
    ready: 'videoStatusReady',
    playing: 'videoStatusPlaying',
    paused: 'videoStatusPaused',
    buffering: 'videoStatusBuffering',
    ended: 'videoStatusEnded',
    cued: 'videoStatusCued',
    unstarted: 'videoStatusUnstarted',
    unknown: 'videoStatusUnknown',
  };
  const lastCheckpointSeconds = videoPlayback.currentTime || selectedProgress || 0;
  const playbackStatusText = t(playbackStatusKeyMap[videoPlayback.state] || 'videoStatusUnknown');
  const displayCurrentTime = formatTime(videoPlayback.currentTime);
  const displayDuration = videoPlayback.duration ? formatTime(videoPlayback.duration) : '00:00';
  const displayCheckpoint = formatTime(lastCheckpointSeconds);
  const showOverlay =
    ['paused', 'ended', 'cued'].includes(videoPlayback.state) ||
    (videoPlayback.state === 'ready' && lastCheckpointSeconds === 0);
  const canRestart = lastCheckpointSeconds > 5;

  const handleResumePlayback = () => {
    if (playerInstance && typeof playerInstance.playVideo === 'function') {
      playerInstance.playVideo();
    }
  };

  const handleRestartPlayback = () => {
    if (playerInstance && typeof playerInstance.seekTo === 'function') {
      playerInstance.seekTo(0, true);
      if (typeof playerInstance.playVideo === 'function') {
        playerInstance.playVideo();
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-text-primary space-y-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
          {learningPath.nome_trilha}
        </h1>
        <p className="text-text-secondary max-w-3xl mb-6">{learningPath.descricao}</p>
        <div className="flex items-center gap-4 mb-2">
          <Progress value={learningPath.progress_percent} className="h-3 flex-1" />
          <span className="font-bold text-lg text-purple-300">{learningPath.progress_percent}%</span>
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

        return (
          <section key={level} className="space-y-4">
            <header className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-text-primary">{moduleLabels[level]}</h2>
              <span className="text-sm text-text-secondary/80">
                {t('learningProgress')}: {Math.round((items.filter((item) => item.status_conclusao === 'Concluido').length / items.length) * 100) || 0}%
              </span>
            </header>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="relative">
                  <ContentItem
                    item={item}
                    index={index}
                    onContentClick={handleContentClick}
                    progressSeconds={contentProgress[item.id]}
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
          <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeDialog}
                className="inline-flex items-center gap-2 rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-sm font-medium text-purple-100 transition hover:border-purple-400/60 hover:bg-purple-500/20"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('videoBackToLearningPath')}
              </button>
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-full border border-transparent p-2 text-text-secondary transition hover:border-purple-400/40 hover:bg-purple-500/10 hover:text-text-primary"
                aria-label={t('videoClosePlayer')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <DialogHeader className="border-none p-0 space-y-2">
              <DialogTitle className="text-2xl text-text-primary">{selectedContent?.titulo}</DialogTitle>
              <DialogDescription className="text-sm text-text-secondary">
                {selectedContent?.descricao}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {selectedVideoId ? (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <section className="space-y-5">
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.25),_transparent_60%)]" />
                      <div className="aspect-video w-full">
                        <YouTubePlayer
                          videoId={selectedVideoId}
                          startTime={selectedProgress}
                          onProgress={handleVideoProgress}
                          onDuration={handleVideoDuration}
                          onPlaybackStateChange={handlePlaybackStateChange}
                          onPlayerReady={setPlayerInstance}
                        />
                      </div>
                      {showOverlay && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-slate-950/70 backdrop-blur-sm">
                          <span className="text-sm font-medium text-purple-100">{playbackStatusText}</span>
                          <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={handleResumePlayback}
                              disabled={!playerInstance}
                              className="inline-flex items-center gap-2 rounded-full border border-purple-400/60 bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-50 transition hover:border-purple-300 hover:bg-purple-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 disabled:cursor-not-allowed disabled:border-purple-400/20 disabled:bg-purple-500/10 disabled:text-purple-200/60"
                            >
                              <Play className="h-4 w-4" />
                              {t('videoResumePlaybackButton')}
                            </button>
                            {canRestart && (
                              <button
                                type="button"
                                onClick={handleRestartPlayback}
                                disabled={!playerInstance}
                                className="inline-flex items-center gap-2 rounded-full border border-purple-400/60 bg-transparent px-4 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 disabled:cursor-not-allowed disabled:border-purple-400/20 disabled:text-purple-200/60"
                              >
                                <RotateCcw className="h-4 w-4" />
                                {t('videoRestartButton')}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="pointer-events-none absolute left-6 top-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-purple-100 shadow-lg">
                        <Play className="h-3 w-3" />
                        {t('continueVideo')}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950/80 px-6 py-4 text-sm text-text-secondary">
                        <div className="flex items-center gap-2 text-text-primary">
                          <Clock className="h-4 w-4 text-purple-200" />
                          <span>
                            {displayCurrentTime} / {displayDuration}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-purple-200/80">
                            <span>{t('videoStatusLabel')}</span>
                            <span className="text-sm font-semibold text-purple-100 normal-case tracking-normal">
                              {playbackStatusText}
                            </span>
                          </div>
                          {youtubeShareUrl && (
                            <a
                              href={youtubeShareUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-purple-400/60 px-3 py-1 text-xs font-semibold text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {t('videoOpenInYoutube')}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                  <aside className="space-y-5">
                    <div className="space-y-3 rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-purple-200/80">
                        <span>{t('videoProgressLabel')}</span>
                        <span>{Math.min(100, Math.max(0, Math.round(videoPlayback.percent || 0)))}%</span>
                      </div>
                      <Progress value={videoPlayback.percent} className="h-2" />
                      <div className="grid grid-cols-2 gap-3 text-xs text-text-secondary/80">
                        <div className="space-y-1">
                          <span className="block text-[0.65rem] uppercase tracking-[0.3em] text-purple-200/70">
                            {t('videoCurrentPositionLabel')}
                          </span>
                          <span className="text-sm font-semibold text-text-primary">{displayCurrentTime}</span>
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="block text-[0.65rem] uppercase tracking-[0.3em] text-purple-200/70">
                            {t('videoDurationLabel')}
                          </span>
                          <span className="text-sm font-semibold text-text-primary">{displayDuration}</span>
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary">
                        {t(getProgressDescriptorKey(videoPlayback.percent || 0))}
                      </p>
                    </div>

                    {(selectedProgress > 0 || videoPlayback.currentTime > 0) && (
                      <div className="space-y-2 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 text-sm text-text-secondary">
                        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-purple-200/80">
                          <span>{t('videoLastCheckpoint')}</span>
                          <span className="text-text-primary">{displayCheckpoint}</span>
                        </div>
                        <p className="text-text-primary">
                          {t('resumeFrom', { minutes: Math.floor(lastCheckpointSeconds / 60) })}
                        </p>
                      </div>
                    )}

                    <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm text-text-secondary">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-200/80">
                        {t('videoLessonInsights')}
                      </h4>
                      <dl className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <dt className="font-medium text-text-primary">{t('videoEstimatedDuration')}</dt>
                          <dd>{hasEstimatedMinutes ? `${estimatedMinutes} ${t('minutes')}` : '-'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <dt className="font-medium text-text-primary">{t('videoContentType')}</dt>
                          <dd>{selectedContent?.tipo_conteudo || '-'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <dt className="font-medium text-text-primary">{t('videoLevelLabel')}</dt>
                          <dd>{badgeLabels[selectedContent?.level] || selectedContent?.level || '-'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <dt className="font-medium text-text-primary">{t('videoStatusLabel')}</dt>
                          <dd className="text-purple-200">{playbackStatusText}</dd>
                        </div>
                      </dl>
                    </div>
                  </aside>
                </div>
              ) : selectedContent?.url_acesso ? (
                <a
                  href={selectedContent.url_acesso}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 cosmic-gradient text-white font-semibold py-3 px-5 rounded-lg"
                >
                  <LinkIcon className="w-4 h-4" />
                  {t('openContentLink')}
                </a>
              ) : (
                <div className="py-10 text-center text-text-secondary">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                  <h3 className="font-semibold mb-2 text-text-primary">{t('contentPlaceholderTitle')}</h3>
                  <p>{t('contentPlaceholderDescription')}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}
