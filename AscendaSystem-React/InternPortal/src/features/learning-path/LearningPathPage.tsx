import { useCallback, useEffect, useMemo, useState } from 'react';
import { LearningPath as LearningPathEntity, Content } from '@estagiario/Entities/all';
import { Play, FileText, ExternalLink, BookOpen, Clock, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoShell from './VideoShell';
import { loadProgress } from './progressStorage';
import { Progress } from '@estagiario/Components/ui/progress';
import { useI18n } from '@estagiario/Components/utils/i18n';

interface Lesson {
  id: string;
  titulo: string;
  descricao?: string;
  url_acesso?: string;
  tipo_conteudo: string;
  status_conclusao?: string;
  duracao_estimada_minutos?: number;
  ordem_na_trilha?: number;
  level?: string;
}

interface ProgressState {
  currentTime: number;
  duration: number;
  percent: number;
  completed: boolean;
}

type ProgressMap = Record<string, ProgressState>;

const LEVEL_ORDER = ['Basic', 'Medium', 'Advanced'];

const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
};

const getYoutubeVideoId = (url?: string | null) => {
  if (!url) return null;
  const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[1]?.length === 11 ? match[1] : null;
};

const statusLabel = (status: string | undefined, completed: boolean, t: ReturnType<typeof useI18n>['t']) => {
  if (completed || status === 'Concluido') {
    return {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
      label: t('contentStatusCompleted'),
    };
  }
  if (status === 'Em Progresso') {
    return {
      icon: <Clock className="h-4 w-4 text-amber-300" />,
      label: t('contentStatusInProgress'),
    };
  }
  return {
    icon: <Lock className="h-4 w-4 text-purple-200/60" />,
    label: t('contentStatusLocked'),
  };
};

export default function LearningPathPage() {
  const { t } = useI18n();
  const [learningPath, setLearningPath] = useState<any | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [pathData, contentData] = await Promise.all([
          LearningPathEntity.list('-created_date', 1).then((res: any[]) => res?.[0] ?? null),
          Content.list('ordem_na_trilha'),
        ]);
        setLearningPath(pathData);
        setLessons(contentData ?? []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!lessons.length) return;
    setProgressMap((current) => {
      const next: ProgressMap = { ...current };
      lessons.forEach((lesson) => {
        if (next[lesson.id]) return;
        const stored = loadProgress(lesson.id);
        const duration = stored?.duration ?? 0;
        const time = stored?.currentTime ?? 0;
        const percent = duration > 0 ? clampPercent((time / duration) * 100) : 0;
        next[lesson.id] = {
          currentTime: time,
          duration,
          percent,
          completed: (lesson.status_conclusao === 'Concluido') || percent >= 99,
        };
      });
      return next;
    });
  }, [lessons]);

  const groupedLessons = useMemo(() => {
    const groups: Record<string, Lesson[]> = {};
    LEVEL_ORDER.forEach((level) => {
      groups[level] = [];
    });
    lessons.forEach((lesson) => {
      const level = LEVEL_ORDER.includes(lesson.level ?? '') ? lesson.level! : 'Basic';
      groups[level].push(lesson);
    });
    LEVEL_ORDER.forEach((level) => {
      groups[level] = groups[level]
        .slice()
        .sort((a, b) => (a.ordem_na_trilha ?? 0) - (b.ordem_na_trilha ?? 0));
    });
    return groups;
  }, [lessons]);

  const overallProgress = useMemo(() => {
    if (!lessons.length) return 0;
    const completedLessons = lessons.reduce((count, lesson) => {
      const progress = progressMap[lesson.id];
      if (progress?.completed || lesson.status_conclusao === 'Concluido') {
        return count + 1;
      }
      return count;
    }, 0);
    return Math.round((completedLessons / lessons.length) * 100);
  }, [lessons, progressMap]);

  const handleSelectLesson = useCallback((lesson: Lesson) => {
    setSelectedLesson(lesson);
  }, []);

  const handleProgressUpdate = useCallback(
    ({ lessonId, currentTime, duration, percent, completed }: { lessonId: string; currentTime: number; duration: number; percent: number; completed: boolean }) => {
      setProgressMap((prev) => ({
        ...prev,
        [lessonId]: {
          currentTime,
          duration,
          percent,
          completed,
        },
      }));
    },
    [],
  );

  const handleCloseViewer = useCallback(() => {
    setSelectedLesson(null);
  }, []);

  const renderLessonCard = (lesson: Lesson, index: number) => {
    const progressState = progressMap[lesson.id];
    const isSelected = selectedLesson?.id === lesson.id;
    const isVideo = lesson.tipo_conteudo === 'Video';
    const percent = clampPercent(progressState?.percent ?? 0);
    const completed = Boolean(progressState?.completed || lesson.status_conclusao === 'Concluido');
    const status = statusLabel(lesson.status_conclusao, completed, t);

    const icon = (() => {
      switch (lesson.tipo_conteudo) {
        case 'Video':
          return <Play className="h-4 w-4" />;
        case 'PDF':
          return <FileText className="h-4 w-4" />;
        case 'Link Externo':
          return <ExternalLink className="h-4 w-4" />;
        default:
          return <BookOpen className="h-4 w-4" />;
      }
    })();

    return (
      <motion.button
        key={lesson.id}
        type="button"
        onClick={() => handleSelectLesson(lesson)}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className={`w-full rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
          isSelected
            ? 'border-purple-500/60 bg-purple-500/10 shadow-[0_0_24px_rgba(168,85,247,0.2)]'
            : 'border-transparent hover:border-purple-500/40 hover:bg-purple-500/5'
        }`}
        data-selected={isSelected || undefined}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm text-purple-100/80">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/40 bg-purple-500/10 text-lg font-semibold text-purple-100">
              {String(lesson.ordem_na_trilha ?? 0).padStart(2, '0')}
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-purple-50">{lesson.titulo}</h3>
                <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-purple-200">
                  {lesson.level || 'Basic'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-purple-200/80">
                <span className="inline-flex items-center gap-1">{icon}{lesson.tipo_conteudo}</span>
                {typeof lesson.duracao_estimada_minutos === 'number' && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {lesson.duracao_estimada_minutos} {t('minutes')}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  {status.icon}
                  {status.label}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <span className="text-sm font-semibold text-purple-100">{Math.round(percent)}%</span>
            {completed && <p className="text-xs text-emerald-300">{t('contentStatusCompleted')}</p>}
          </div>
        </div>
        {isVideo && (percent > 0 || completed) && (
          <div className="mt-4 flex items-center gap-3">
            <Progress value={completed ? 100 : percent} className="h-1.5" />
            <span className="text-xs font-semibold text-purple-200">{Math.round(percent)}%</span>
          </div>
        )}
      </motion.button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center text-purple-100">
        {t('learningPathLoading')}
      </div>
    );
  }

  const selectedVideoId = selectedLesson ? getYoutubeVideoId(selectedLesson.url_acesso) : null;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-3xl border border-purple-700/40 bg-slate-950/70 p-6 shadow-lg shadow-purple-900/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-purple-200/70">{learningPath?.nome || t('learningPath')}</p>
            <h1 className="text-2xl font-semibold text-purple-50">{t('learningProgress')}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-40">
              <Progress value={overallProgress} className="h-2" />
            </div>
            <span className="text-lg font-semibold text-purple-100">{overallProgress}%</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          {LEVEL_ORDER.map((level) => {
            const items = groupedLessons[level];
            if (!items?.length) return null;
            return (
              <section key={level} className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-200/70">{t(level === 'Basic' ? 'learningModuleBeginner' : level === 'Medium' ? 'learningModuleIntermediate' : 'learningModuleAdvanced')}</h2>
                  <p className="text-xs text-purple-200/60">{t('learningVideoModuleDescription')}</p>
                </div>
                <div className="space-y-3">
                  {items.map((lesson, index) => renderLessonCard(lesson, index))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="min-h-[360px]">
          <AnimatePresence mode="wait">
            {selectedLesson ? (
              selectedVideoId ? (
                <motion.div
                  key={selectedLesson.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.25 }}
                  className="h-full"
                >
                  <VideoShell
                    lessonId={selectedLesson.id}
                    title={selectedLesson.titulo}
                    youtubeId={selectedVideoId}
                    onBack={handleCloseViewer}
                    onClose={handleCloseViewer}
                    onProgress={handleProgressUpdate}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={`resource-${selectedLesson.id}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.2 }}
                  className="flex h-full min-h-[360px] flex-col justify-between gap-6 rounded-2xl border border-purple-700/40 bg-slate-950/75 p-8 text-purple-100"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-purple-300" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-purple-200/70">{t('learningVideoNoStreamTitle')}</p>
                        <h3 className="text-xl font-semibold text-purple-50">{selectedLesson.titulo}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-purple-200/80">{t('learningVideoNoStreamDescription')}</p>
                  </div>
                  {selectedLesson.url_acesso && (
                    <a
                      href={selectedLesson.url_acesso}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-5 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/20"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t('openContentLink')}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleCloseViewer}
                    className="inline-flex items-center justify-center rounded-full border border-purple-500/30 bg-transparent px-5 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-300 hover:bg-purple-500/10"
                  >
                    {t('learningVideoBack')}
                  </button>
                </motion.div>
              )
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[360px] flex-col items-center justify-center gap-4 rounded-2xl border border-purple-700/40 bg-slate-950/70 p-10 text-center text-purple-100/80"
              >
                <BookOpen className="h-12 w-12 text-purple-300" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-purple-50">{t('learningContentEmptyTitle')}</h3>
                  <p className="text-sm text-purple-200/80">{t('learningContentEmptyDescription')}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
