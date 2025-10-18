import React, { useCallback, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Play, X } from 'lucide-react';
import useVideoProgress, { formatVideoTime } from '@estagiario/hooks/useVideoProgress';
import { Progress } from '@estagiario/Components/ui/progress';
import YouTubePlayer from './YouTubePlayer.jsx';

const getMissionMessage = (completed) => (completed ? 'Treinamento concluído. Excelente trabalho, explorador!' : 'Missão iniciada 🚀');

const getStatusLabel = (completed) => (completed ? 'Status: Concluído' : 'Status: Em curso');

const gradientBackground =
  'relative overflow-hidden rounded-3xl border border-purple-500/40 bg-slate-950/80 shadow-[0_0_40px_rgba(168,85,247,0.25)] backdrop-blur-xl';

export default function VideoPlayer({
  contentId,
  videoId,
  title,
  description,
  onClose,
  onProgressChange,
  onCompletion,
  levelLabel,
  estimatedMinutes,
  contentType,
}) {
  const {
    percent,
    currentTime,
    duration,
    remainingTime,
    completed,
    resumeTime,
    formatted,
    updateProgress,
    updateDuration,
  } = useVideoProgress(contentId || videoId);

  const handleDuration = useCallback(
    (value) => {
      const normalized = updateDuration(value);
      if (typeof onProgressChange === 'function') {
        onProgressChange(contentId, {
          percent,
          currentTime,
          duration: normalized,
          completed,
        });
      }
    },
    [completed, contentId, currentTime, onProgressChange, percent, updateDuration],
  );

  const handleProgress = useCallback(
    (payload) => {
      const nextState = updateProgress(payload);
      if (typeof onProgressChange === 'function') {
        onProgressChange(contentId, nextState);
      }
      if (nextState.justCompleted && typeof onCompletion === 'function') {
        onCompletion(contentId, nextState);
      }
    },
    [contentId, onCompletion, onProgressChange, updateProgress],
  );

  useEffect(() => {
    if (typeof onProgressChange === 'function') {
      onProgressChange(contentId, {
        percent,
        currentTime,
        duration,
        completed,
      });
    }
  }, [completed, contentId, currentTime, duration, onProgressChange, percent]);

  const cosmicMessage = getMissionMessage(completed);
  const statusLabel = getStatusLabel(completed);
  const progressLabel = `Progress: ${Math.round(percent)}% | Remaining: ${formatVideoTime(remainingTime)}`;

  const handleCloseRequest = useCallback(() => {
    if (typeof onClose === 'function') {
      onClose({
        contentId,
        percent,
        currentTime,
        completed,
      });
    }
  }, [completed, contentId, currentTime, onClose, percent]);

  return (
    <div className={gradientBackground}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.35),_transparent_70%)]" />
      <div className="relative flex flex-col gap-6 p-6 text-text-primary">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={handleCloseRequest}
            className="group inline-flex items-center gap-2 rounded-full border border-purple-400/50 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/20"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            Voltar
          </button>
          <button
            type="button"
            onClick={handleCloseRequest}
            className="rounded-full border border-transparent p-2 text-text-secondary transition hover:border-purple-400/40 hover:bg-purple-500/10 hover:text-text-primary"
            aria-label="Fechar player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-200/90">{cosmicMessage}</p>
          <h2 className="mt-3 text-3xl font-semibold text-text-primary">{title}</h2>
          {description && <p className="mt-2 text-sm text-text-secondary">{description}</p>}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,_rgba(168,85,247,0.1),_transparent_60%)]" />
          <div className="aspect-video w-full">
            <YouTubePlayer
              videoId={videoId}
              startTime={Math.floor(resumeTime || 0)}
              onProgress={handleProgress}
              onDuration={handleDuration}
            />
          </div>
          {completed && (
            <div className="pointer-events-none absolute right-5 top-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              <CheckCircle className="h-4 w-4" />
              Concluído
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-purple-500/40 bg-purple-500/10 p-5 text-sm text-purple-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-lg font-semibold text-purple-100">
              <Play className="h-5 w-5" />
              {Math.round(percent)}%
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-purple-200/80">{statusLabel}</span>
          </div>
          <Progress value={percent} className="h-2" />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.2em] text-purple-200/70">
            <span>Atual: {formatted.current}</span>
            <span>Restante: {formatted.remaining}</span>
            <span>Total: {formatted.duration}</span>
          </div>
          <p className="text-xs font-medium text-purple-100/80">{progressLabel}</p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm text-text-secondary">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-200/80">Detalhes da jornada</span>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-primary">Tipo de conteúdo</dt>
              <dd>{contentType || 'Video'}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-primary">Nível</dt>
              <dd>{levelLabel || '-'}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-primary">Duração estimada</dt>
              <dd>{estimatedMinutes ? `${estimatedMinutes} min` : formatted.duration}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-primary">Assistido</dt>
              <dd>{formatVideoTime(currentTime)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
