import { useCallback, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ExternalLink, RotateCcw, X, AlertTriangle } from 'lucide-react';
import VideoPlayer, { VideoPlayerHandle } from './VideoPlayer';
import { loadProgress, saveProgress } from './progressStorage';
import { Progress as ProgressBar } from '@estagiario/Components/ui/progress';
import { useI18n } from '@estagiario/Components/utils/i18n';

type Props = {
  lessonId: string;
  title: string;
  youtubeId: string;
  onBack: () => void;
  onClose: () => void;
  onProgress?: (payload: {
    lessonId: string;
    currentTime: number;
    duration: number;
    percent: number;
    completed: boolean;
  }) => void;
};

const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
};

const COMPLETION_THRESHOLD = 3;

export default function VideoShell({ lessonId, title, youtubeId, onBack, onClose, onProgress }: Props) {
  const { t } = useI18n();
  const saved = loadProgress(lessonId);
  const playerHandleRef = useRef<VideoPlayerHandle | null>(null);
  const lastPersistRef = useRef(0);
  const lastEmitRef = useRef(0);
  const lastRenderedTimeRef = useRef(saved?.currentTime ?? 0);
  const [duration, setDuration] = useState(saved?.duration ?? 0);
  const [currentTime, setCurrentTime] = useState(saved?.currentTime ?? 0);
  const [errorCode, setErrorCode] = useState<number | undefined>();

  const completed = useMemo(() => {
    if (!duration) return false;
    return currentTime >= Math.max(duration - COMPLETION_THRESHOLD, duration * 0.98);
  }, [currentTime, duration]);

  const percentWatched = useMemo(() => {
    if (!duration) return saved?.duration ? clampPercent((currentTime / duration) * 100) : 0;
    return clampPercent((currentTime / duration) * 100);
  }, [currentTime, duration, saved?.duration]);

  const handleProgressEmit = useCallback(
    (time: number, videoDuration: number, isCompleted: boolean) => {
      if (!videoDuration) return;
      const percent = clampPercent((time / videoDuration) * 100);
      onProgress?.({ lessonId, currentTime: time, duration: videoDuration, percent, completed: isCompleted });
    },
    [lessonId, onProgress],
  );

  const persistProgress = useCallback(
    (time: number, videoDuration: number) => {
      saveProgress(lessonId, {
        currentTime: time,
        duration: videoDuration,
        updatedAt: new Date().toISOString(),
      });
    },
    [lessonId],
  );

  const handleReady = useCallback(
    (videoDuration: number) => {
      setErrorCode(undefined);
      setDuration(videoDuration);
      const isCompleted = videoDuration
        ? currentTime >= Math.max(videoDuration - COMPLETION_THRESHOLD, videoDuration * 0.98)
        : completed;
      handleProgressEmit(currentTime, videoDuration, isCompleted);
    },
    [completed, currentTime, handleProgressEmit],
  );

  const handleDuration = useCallback((videoDuration: number) => {
    setDuration(videoDuration);
  }, []);

  const handleTime = useCallback(
    (time: number) => {
      if (!Number.isFinite(time)) return;
      const now = performance.now();
      if (Math.abs(time - lastRenderedTimeRef.current) >= 0.25) {
        lastRenderedTimeRef.current = time;
        setCurrentTime(time);
      }

      const effectiveDuration = duration || saved?.duration || 0;
      if (effectiveDuration) {
        const isCompleted = time >= Math.max(effectiveDuration - COMPLETION_THRESHOLD, effectiveDuration * 0.98);
        if (now - lastEmitRef.current > 400) {
          handleProgressEmit(time, effectiveDuration, isCompleted);
          lastEmitRef.current = now;
        }
        if (now - lastPersistRef.current > 1000) {
          persistProgress(time, effectiveDuration);
          lastPersistRef.current = now;
        }
      }
    },
    [duration, handleProgressEmit, persistProgress, saved?.duration],
  );

  const handleEnd = useCallback(() => {
    if (!duration) return;
    const completedTime = duration;
    setCurrentTime(completedTime);
    persistProgress(completedTime, duration);
    handleProgressEmit(completedTime, duration, true);
  }, [duration, handleProgressEmit, persistProgress]);

  const handleError = useCallback(
    (code?: number) => {
      setErrorCode(code);
    },
    [],
  );

  const handleRetry = useCallback(() => {
    setErrorCode(undefined);
    playerHandleRef.current?.reload();
  }, []);

  const startAt = saved && saved.currentTime >= 5 ? saved.currentTime : 0;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-purple-700/40 bg-slate-950/80 shadow-xl shadow-purple-900/30">
      <header className="flex items-center gap-4 border-b border-purple-700/40 bg-slate-950/60 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-sm font-medium text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/20"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('learningVideoBack')}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs uppercase tracking-[0.3em] text-purple-300/70">{t('learningVideoNowPlaying')}</p>
          <h2 className="truncate text-base font-semibold text-purple-50">{title}</h2>
        </div>
        <div className="hidden sm:flex sm:flex-col sm:items-end sm:justify-center sm:gap-1">
          <span className="text-xs font-medium text-purple-200/80">{t('learningVideoProgress')}</span>
          <span className="text-sm font-semibold text-purple-100">{percentWatched.toFixed(1)}%</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/20"
          aria-label={t('learningVideoClose')}
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="grid flex-1 grid-rows-[auto_1fr_auto] gap-4 overflow-hidden px-4 py-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <ProgressBar value={percentWatched} className="h-2" />
            <span className="text-sm font-medium text-purple-100">{percentWatched.toFixed(1)}%</span>
          </div>
          <p className="text-xs text-purple-200/70">
            {completed ? t('learningVideoCompleted') : t('learningVideoAutoSaving')}
          </p>
        </div>

        <div className="relative flex min-h-0 flex-col">
          <div className={`flex-1 overflow-hidden rounded-xl border border-purple-700/40 bg-black/80 ${errorCode ? 'opacity-20' : ''}`}>
            <VideoPlayer
              ref={(instance) => {
                playerHandleRef.current = instance;
              }}
              videoId={youtubeId}
              startAt={startAt}
              onReady={handleReady}
              onDuration={handleDuration}
              onTime={handleTime}
              onEnd={handleEnd}
              onError={handleError}
            />
          </div>

          {errorCode !== undefined && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl border border-rose-500/40 bg-slate-950/95 p-6 text-center text-rose-100">
              <AlertTriangle className="h-10 w-10 text-rose-300" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-rose-100">{t('learningVideoUnavailableTitle')}</h3>
                <p className="text-sm text-rose-100/80">{t('learningVideoUnavailableDescription')}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/20"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('learningVideoRetry')}
                </button>
                <a
                  href={`https://youtu.be/${youtubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-transparent px-4 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/10"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('learningVideoOpenYoutube')}
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-purple-700/40 bg-slate-950/70 px-4 py-3 text-sm text-purple-100">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-200/70">{t('learningVideoStatusLabel')}</p>
            <p className="text-sm font-medium text-purple-50">
              {completed ? t('learningVideoStatusCompleted') : t('learningVideoStatusWatching')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-200/70">{t('learningVideoTimeLabel')}</p>
            <p className="text-sm font-medium text-purple-50">
              {Math.floor(currentTime / 60)}:{`${Math.floor(currentTime % 60)}`.padStart(2, '0')} / {Math.floor(duration / 60)}:{`${Math.floor(duration % 60)}`.padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
