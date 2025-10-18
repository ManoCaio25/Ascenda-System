import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, User } from 'lucide-react';
import { ForumTopic } from '@padrinho/entities/ForumTopic';
import { ForumReply } from '@padrinho/entities/ForumReply';
import { Textarea } from '@padrinho/components/ui/textarea';
import { Button } from '@padrinho/components/ui/button';
import { useTranslation } from '@padrinho/i18n';
import { useForumAuthors } from '@padrinho/hooks/useForumAuthors';

const ReplyCard = ({ reply, formattedDate, author, t }) => {
  const authorProfile = author || { full_name: t('forum.anonymous'), avatar: '' };
  const highlightClasses = reply.melhor_resposta
    ? 'border-green-500/60 bg-green-500/5'
    : 'border-border';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-4 rounded-lg border bg-surface p-5 shadow-e1 ${highlightClasses}`}
    >
      <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-surface2">
        {authorProfile.avatar ? (
          <img
            src={authorProfile.avatar}
            alt={authorProfile.displayName || authorProfile.full_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">
            <User className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="flex-grow space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="font-semibold text-primary">{authorProfile.displayName || authorProfile.full_name}</span>
            <span>·</span>
            <span>{formattedDate}</span>
            {authorProfile.track ? (
              <>
                <span>·</span>
                <span className="rounded-full bg-surface2 px-2 py-1 text-[11px] font-medium text-brand">
                  {authorProfile.track}
                </span>
              </>
            ) : null}
          </div>
          {reply.melhor_resposta && (
            <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-500">
              <CheckCircle className="h-4 w-4" />
              <span>{t('forum.bestAnswer')}</span>
            </div>
          )}
        </div>
        <p className="text-sm leading-relaxed text-muted">{reply.conteudo_resposta}</p>
      </div>
    </motion.div>
  );
};

export default function ForumTopicViewPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const topicId = searchParams.get('id');
  const { t, language } = useTranslation();
  const { getAuthorProfile } = useForumAuthors();

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
        ForumReply.filter({ id_topico: topicId }, 'created_date'),
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
      author: getAuthorProfile(reply.id_usuario_criador),
      formattedDate: format(new Date(reply.created_date), language === 'pt' ? 'dd/MM/yyyy' : 'MMM d, yyyy', { locale }),
    }));
  }, [replies, language, locale, getAuthorProfile]);

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

  if (isLoading) return <div className="p-10 text-center text-muted">{t('forum.loading')}</div>;
  if (!topic) return <div className="p-10 text-center text-muted">{t('forum.noCategories')}</div>;

  const creatorProfile = getAuthorProfile(topic.id_usuario_criador);
  const creator = creatorProfile
    ? { full_name: creatorProfile.displayName, track: creatorProfile.track }
    : { full_name: t('forum.anonymous') };
  const formattedDate = format(new Date(topic.created_date), language === 'pt' ? 'dd/MM/yyyy' : 'MMMM d, yyyy', { locale });
  const bestAnswer = formattedReplies.find((item) => item.reply.melhor_resposta);
  const otherReplies = formattedReplies.filter((item) => !item.reply.melhor_resposta);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">{topic.titulo}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>{creator.full_name}</span>
          <span>·</span>
          <span>{formattedDate}</span>
          <span>·</span>
          <span>
            {(topic.visualizacoes || 0)} {t('forum.viewsLabel').toLowerCase()}
          </span>
          {creator.track ? (
            <>
              <span>·</span>
              <span className="rounded-full bg-surface2 px-2 py-1 text-[11px] font-medium text-brand">
                {creator.track}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6 shadow-e1">
        <p className="text-base leading-relaxed text-muted">{topic.conteudo_topico}</p>
      </div>

      <div className="space-y-5">
        {bestAnswer && (
          <ReplyCard
            reply={bestAnswer.reply}
            formattedDate={bestAnswer.formattedDate}
            author={bestAnswer.author}
            t={t}
          />
        )}
        {otherReplies.map((item) => (
          <ReplyCard
            key={item.reply.id}
            reply={item.reply}
            formattedDate={item.formattedDate}
            author={item.author}
            t={t}
          />
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface p-6 shadow-e1">
        <h3 className="text-lg font-semibold text-primary">{t('forum.postReply')}</h3>
        <Textarea
          value={newReply}
          onChange={(event) => setNewReply(event.target.value)}
          placeholder={t('forum.replyPlaceholder')}
          rows={6}
          className="mt-4"
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={handlePostReply} disabled={isSubmitting || !newReply.trim()}>
            {t('forum.postReply')}
          </Button>
        </div>
      </div>
    </div>
  );
}
