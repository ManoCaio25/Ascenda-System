
import React, { useState, useEffect } from 'react';
import { LearningPath as LearningPathEntity, Content } from '@estagiario/Entities/all';
import { motion } from 'framer-motion';
import { CheckCircle, Play, FileText, ExternalLink, BookOpen, Clock, Lock, Star } from 'lucide-react';
import { Progress } from '@estagiario/Components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@estagiario/Components/ui/dialog";

const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};


const ContentItem = ({ item, index, onContentClick }) => {
  const getStatusIcon = () => {
    switch (item.status_conclusao) {
      case 'Concluido':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'Em Progresso':
        return <Clock className="w-6 h-6 text-blue-400 animate-pulse" />;
      default:
        return <Lock className="w-6 h-6 text-slate-500" />;
    }
  };

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

  const levelColor = {
    Basic: 'text-green-400',
    Medium: 'text-yellow-400',
    Advanced: 'text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onContentClick(item)}
      className="flex items-center gap-4 p-4 cosmic-card rounded-lg hover:border-purple-500 transition-all duration-300 cursor-pointer"
    >
      <div className="text-3xl font-bold text-slate-600">{String(item.ordem_na_trilha).padStart(2, '0')}</div>
      <div className="flex-grow">
        <h3 className="font-semibold text-white">{item.titulo}</h3>
        <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
          <div className="flex items-center gap-1">
            {getTypeIcon()}
            <span>{item.tipo_conteudo}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{item.duracao_estimada_minutos} min</span>
          </div>
          {item.level && (
            <div className={`flex items-center gap-1 font-medium ${levelColor[item.level]}`}>
                <Star className="w-4 h-4" />
                <span>{item.level}</span>
            </div>
          )}
        </div>
      </div>
      <div>{getStatusIcon()}</div>
    </motion.div>
  );
};

export default function LearningPathPage() {
  const [learningPath, setLearningPath] = useState(null);
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [pathData, contentData] = await Promise.all([
        LearningPathEntity.list('-created_date', 1).then(res => res[0]),
        Content.list('ordem_na_trilha')
      ]);
      setLearningPath(pathData);
      setContents(contentData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleContentClick = (content) => {
    setSelectedContent(content);
  };
  
  if (isLoading || !learningPath) {
    return <div className="text-white text-center p-10">Loading Learning Path...</div>;
  }

  const videoId = getYoutubeVideoId(selectedContent?.url_acesso);

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">{learningPath.nome_trilha}</h1>
        <p className="text-slate-300 mb-6">{learningPath.descricao}</p>
        <div className="flex items-center gap-4 mb-8">
          <Progress value={learningPath.progress_percent} className="h-3" />
          <span className="font-bold text-lg">{learningPath.progress_percent}%</span>
        </div>
      </motion.div>
      
      <div className="relative space-y-4">
        <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-slate-700"></div>
        {contents.map((item, index) => (
          <div key={item.id} className="relative pl-14">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-800 border-2 border-slate-700 rounded-full flex items-center justify-center">
              {item.status_conclusao === 'Concluido' && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <ContentItem item={item} index={index} onContentClick={handleContentClick} />
          </div>
        ))}
      </div>

      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="cosmic-card text-white border-purple-700 max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedContent?.titulo}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedContent?.descricao}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {videoId ? (
                <div className="aspect-video">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="rounded-lg"
                    ></iframe>
                </div>
            ) : selectedContent?.url_acesso ? (
                <a href={selectedContent.url_acesso} target="_blank" rel="noopener noreferrer" className="cosmic-gradient text-white font-bold py-3 px-5 rounded-lg inline-block">
                    Open Content Link
                </a>
            ) : (
                <div className="py-10 text-center text-slate-500">
                    <BookOpen className="w-16 h-16 mx-auto mb-4" />
                    <p>Content viewer placeholder</p>
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
