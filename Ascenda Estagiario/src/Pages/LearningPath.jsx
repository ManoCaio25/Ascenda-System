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
  Link as LinkIcon
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
  };

  const handleProgressUpdate = (contentId, seconds) => {
    if (!contentId) return;
    setContentProgress((prev) => ({ ...prev, [contentId]: seconds }));
    localStorage.setItem(buildProgressKey(contentId), String(seconds));
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

      <Dialog open={Boolean(selectedContent)} onOpenChange={(open) => !open && setSelectedContent(null)}>
        <DialogContent className="cosmic-card text-text-primary border-purple-700/60 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-text-primary">{selectedContent?.titulo}</DialogTitle>
            <DialogDescription className="text-text-secondary">
              {selectedContent?.descricao}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedVideoId ? (
              <div className="space-y-3">
                <div className="aspect-video rounded-xl overflow-hidden">
                  <YouTubePlayer
                    videoId={selectedVideoId}
                    startTime={selectedProgress}
                    onProgress={(seconds) => handleProgressUpdate(selectedContent.id, seconds)}
                  />
                </div>
                {selectedProgress > 0 && (
                  <p className="text-sm text-text-secondary">
                    {t('resumeFrom', { minutes: Math.floor(selectedProgress / 60) })}
                  </p>
                )}
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
