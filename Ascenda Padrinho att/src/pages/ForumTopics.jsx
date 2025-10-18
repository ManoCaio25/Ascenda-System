import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Calendar, ChevronLeft, Plus } from 'lucide-react';
import { createPageUrl } from '@padrinho/utils';
import { ForumTopic } from '@padrinho/entities/ForumTopic';
import { ForumCategory } from '@padrinho/entities/ForumCategory';
import { Button } from '@padrinho/components/ui/button';
import { Textarea } from '@padrinho/components/ui/textarea';
import { Input } from '@padrinho/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@padrinho/components/ui/dialog';
import { useTranslation } from '@padrinho/i18n';
import { useForumAuthors } from '@padrinho/hooks/useForumAuthors';
import Avatar from '@padrinho/components/ui/Avatar';

const initialTopicState = { title: '', content: '' };

export default function ForumTopicsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryId = searchParams.get('category');
  const { t, language } = useTranslation();
  const { getAuthorProfile } = useForumAuthors();

  const [category, setCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTopic, setNewTopic] = useState(initialTopicState);

  useEffect(() => {
    if (!categoryId) return;
    const fetchData = async () => {
      setIsLoading(true);
      const [categoryData, topicsData] = await Promise.all([
        ForumCategory.get(categoryId),
        ForumTopic.filter({ id_categoria_forum: categoryId }, '-created_date'),
      ]);
      setCategory(categoryData);
      setTopics(topicsData);
      setIsLoading(false);
    };
    fetchData();
  }, [categoryId]);

  const locale = language === 'pt' ? ptBR : undefined;

  const formattedTopics = useMemo(() => {
    return topics.map((topic) => {
      const authorProfile = getAuthorProfile(topic.id_usuario_criador);
      const creator = authorProfile
        ? {
            full_name: authorProfile.displayName,
            avatar_url: authorProfile.avatar,
            track: authorProfile.track,
          }
        : { full_name: t('forum.anonymous'), avatar_url: '' };
      return {
        ...topic,
        creator,
        formattedDate: format(new Date(topic.created_date), language === 'pt' ? 'dd/MM/yyyy' : 'MMM d, yyyy', { locale }),
      };
    });
    }, [topics, language, locale, t, getAuthorProfile]);

  const handleCreateTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim() || !category) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id_categoria_forum: category.id,
        titulo: newTopic.title.trim(),
        conteudo_topico: newTopic.content.trim(),
        id_usuario_criador: 'user_1',
        reply_count: 0,
        visualizacoes: 1,
      };
      const created = await ForumTopic.create(payload);
      setTopics((prev) => [created, ...prev]);

      const updatedCount = (category.topic_count || 0) + 1;
      const updatedCategory = await ForumCategory.update(category.id, { topic_count: updatedCount });
      setCategory(updatedCategory || { ...category, topic_count: updatedCount });

      setNewTopic(initialTopicState);
      setIsDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-muted">{t('forum.loading')}</div>;
  if (!category) return <div className="p-10 text-center text-muted">{t('forum.noCategories')}</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-8">
      <div className="flex flex-col gap-3">
        <Link to={createPageUrl('Forum')} className="flex items-center gap-2 text-sm text-muted hover:text-primary">
          <ChevronLeft className="h-4 w-4" /> {t('forum.back')}
        </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary md:text-4xl">{category.nome_categoria}</h1>
            <p className="mt-2 max-w-3xl text-muted">{category.descricao}</p>
          </div>
          <Button className="self-start" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t('forum.newTopicCta')}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {formattedTopics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Link
              to={createPageUrl(`ForumTopicView?id=${topic.id}`)}
              className="block rounded-lg border border-border bg-surface p-5 shadow-e1 transition hover:border-brand"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex items-center justify-center">
                  {topic.creator.avatar_url ? (
                    <Avatar
                      src={topic.creator.avatar_url}
                      alt={topic.creator.full_name}
                      size={48}
                      className="border border-border bg-surface2"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface2 text-sm text-muted">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex-grow space-y-2">
                  <h2 className="text-lg font-semibold text-primary">{topic.titulo}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {topic.creator.full_name}
                    </span>
                    {topic.creator.track ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface2 px-2 py-1 font-medium text-[11px] text-brand">
                        {topic.creator.track}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {topic.formattedDate}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-6 text-sm text-muted">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-primary">{topic.reply_count || 0}</span>
                    <span className="text-xs uppercase tracking-wide">{t('forum.repliesLabel')}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-primary">{topic.visualizacoes || 0}</span>
                    <span className="text-xs uppercase tracking-wide">{t('forum.viewsLabel')}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {!formattedTopics.length && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-muted">
            {t('forum.noTopics')}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('forum.modalTitle')}</DialogTitle>
            <DialogDescription>{category.nome_categoria}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6 pt-0">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted" htmlFor="topic-title">
                {t('forum.topicTitleLabel')}
              </label>
              <Input
                id="topic-title"
                value={newTopic.title}
                onChange={(event) => setNewTopic((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted" htmlFor="topic-content">
                {t('forum.topicContentLabel')}
              </label>
              <Textarea
                id="topic-content"
                rows={5}
                value={newTopic.content}
                onChange={(event) => setNewTopic((prev) => ({ ...prev, content: event.target.value }))}
                placeholder={t('forum.replyPlaceholder')}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                {t('forum.cancel')}
              </Button>
              <Button onClick={handleCreateTopic} disabled={isSubmitting}>
                {t('forum.submitTopic')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
