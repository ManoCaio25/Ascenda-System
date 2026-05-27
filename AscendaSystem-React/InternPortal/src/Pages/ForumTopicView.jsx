import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ForumTopic, ForumReply } from '@estagiario/Entities/all';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useI18n } from '@estagiario/Components/utils/i18n';
import { Textarea } from '@estagiario/Components/ui/textarea';
import { Button } from '@estagiario/Components/ui/button';

const mockUsers = {
  user_1: { full_name: 'Galileo', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face' },
  user_2: { full_name: 'Newton', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
  user_3: { full_name: 'Curie', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face' },
};

const ReplyCard = ({ reply, formattedDate, t }) => {
  const author = mockUsers[reply.id_usuario_criador] || { full_name: 'Anonymous', avatar_url: '' };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-4 p-5 rounded-lg cosmic-card border ${reply.melhor_resposta ? 'border-green-500/60' : 'border-transparent'}`}
    >
      <img src={author.avatar_url} alt={author.full_name} className="w-10 h-10 rounded-full object-cover" />
      <div className="flex-grow space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">{author.full_name}</span>
            <span>·</span>
            <span>{formattedDate}</span>
          </div>
          {reply.melhor_resposta && (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span>{t('bestAnswer')}</span>
            </div>
          )}
        </div>
        <p className="text-text-secondary leading-relaxed">{reply.conteudo_resposta}</p>
      </div>
    </motion.div>
  );
};

export default function ForumTopicViewPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const topicId = searchParams.get('id');
  const { t, language } = useI18n();

  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!topicId) return;
    const fetchData = async () => {
      setIsLoading(true);
      const [topicData, repliesData] = await Promise.all([
        ForumTopic.get(topicId),
        ForumReply.filter({ id_topico: topicId }, 'created_date')
      ]);

      if (topicData) {
        const updatedTopic = await ForumTopic.update(topicData.id, {
          visualizacoes: (topicData.visualizacoes || 0) + 1,
        });
        setTopic(updatedTopic || topicData);
      } else {
        setTopic(null);
      }

      setReplies(repliesData);
      setIsLoading(false);
    };
    fetchData();
  }, [topicId]);

  const locale = language === 'pt' ? ptBR : undefined;

  const formattedReplies = useMemo(() => {
    return replies.map((reply) => ({
      reply,
      formattedDate: format(new Date(reply.created_date), language === 'pt' ? 'dd/MM/yyyy' : 'MMM d, yyyy', { locale }),
    }));
  }, [replies, language, locale]);

  const handlePostReply = async () => {
    if (!newReply.trim() || !topic) return;
    setIsSubmitting(true);
    try {
      const payload = {
        id_topico: topic.id,
        conteudo_resposta: newReply.trim(),
        id_usuario_criador: 'user_1',
        melhor_resposta: false,
      };
      const created = await ForumReply.create(payload);
      setReplies((prev) => [...prev, created]);

      const updatedTopic = await ForumTopic.update(topic.id, {
        reply_count: (topic.reply_count || 0) + 1,
      });
      setTopic(updatedTopic || topic);
      setNewReply('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="text-center p-10 text-text-secondary">{t('loading')}</div>;
  if (!topic) return <div className="text-center p-10 text-text-secondary">{t('forumNoCategoriesLoaded')}</div>;

  const creator = mockUsers[topic.id_usuario_criador] || { full_name: 'Anonymous' };
  const formattedDate = format(new Date(topic.created_date), language === 'pt' ? 'dd/MM/yyyy' : 'MMMM d, yyyy', { locale });
  const bestAnswer = formattedReplies.find((item) => item.reply.melhor_resposta);
  const otherReplies = formattedReplies.filter((item) => !item.reply.melhor_resposta);

  return (
    <div className="p-8 max-w-4xl mx-auto text-text-primary space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">{topic.titulo}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <span>{creator.full_name}</span>
          <span>·</span>
          <span>{formattedDate}</span>
          <span>·</span>
          <span>{(topic.visualizacoes || 0)} {t('forumViewsLabel').toLowerCase()}</span>
        </div>
      </div>

      <div className="cosmic-card p-6 space-y-4">
        <p className="text-text-secondary leading-relaxed">{topic.conteudo_topico}</p>
      </div>

      <div className="space-y-5">
        {bestAnswer && <ReplyCard reply={bestAnswer.reply} formattedDate={bestAnswer.formattedDate} t={t} />}
        {otherReplies.map((item) => (
          <ReplyCard key={item.reply.id} reply={item.reply} formattedDate={item.formattedDate} t={t} />
        ))}
      </div>

      <div className="cosmic-card p-6 space-y-4">
        <h3 className="font-semibold text-lg text-text-primary">{t('forumPostReply')}</h3>
        <Textarea
          value={newReply}
          onChange={(event) => setNewReply(event.target.value)}
          placeholder={t('forumReplyPlaceholder')}
          rows={6}
        />
        <div className="flex justify-end">
          <Button onClick={handlePostReply} disabled={isSubmitting || !newReply.trim()}>
            {t('forumPostReply')}
          </Button>
        </div>
      </div>
    </div>
  );
}
