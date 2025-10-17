import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@estagiario/utils';
import { ForumTopic, ForumCategory } from '@estagiario/Entities/all';
import { motion } from 'framer-motion';
import { User, Calendar, ChevronLeft, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useI18n } from '@estagiario/Components/utils/i18n';
import { Button } from '@estagiario/Components/ui/button';
import { Textarea } from '@estagiario/Components/ui/textarea';
import { Input } from '@estagiario/Components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@estagiario/Components/ui/dialog';

const mockUsers = {
  user_1: { full_name: 'Galileo', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face' },
  user_2: { full_name: 'Newton', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
  user_3: { full_name: 'Curie', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face' },
};

const initialTopicState = { title: '', content: '' };

export default function ForumTopicsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryId = searchParams.get('category');
  const { t, language } = useI18n();

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
        ForumTopic.filter({ id_categoria_forum: categoryId }, '-created_date')
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
      const creator = mockUsers[topic.id_usuario_criador] || { full_name: 'Anonymous', avatar_url: '' };
      return {
        ...topic,
        creator,
        formattedDate: format(new Date(topic.created_date), language === 'pt' ? 'dd/MM/yyyy' : 'MMM d, yyyy', { locale }),
      };
    });
  }, [topics, language, locale]);

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

  if (isLoading) return <div className="text-center p-10 text-text-secondary">{t('loading')}</div>;
  if (!category) return <div className="text-center p-10 text-text-secondary">{t('forumNoCategoriesLoaded')}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto text-text-primary space-y-8">
      <div className="flex flex-col gap-3">
        <Link to={createPageUrl('Forum')} className="flex items-center gap-2 text-text-secondary hover:text-purple-400">
          <ChevronLeft className="w-4 h-4" /> {t('forumBack')}
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">{category.nome_categoria}</h1>
            <p className="text-text-secondary mt-2 max-w-3xl">{category.descricao}</p>
          </div>
          <Button className="self-start" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> {t('forumNewTopicCta')}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {formattedTopics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Link to={createPageUrl(`ForumTopicView?id=${topic.id}`)} className="block cosmic-card rounded-lg p-5 hover:border-purple-500 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <img src={topic.creator.avatar_url} alt={topic.creator.full_name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-grow space-y-2">
                  <h2 className="font-semibold text-lg text-text-primary">{topic.titulo}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary/80">
                    <span className="inline-flex items-center gap-1"><User className="w-3 h-3" />{topic.creator.full_name}</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{topic.formattedDate}</span>
                  </div>
                </div>
                <div className="flex gap-6 text-sm text-text-secondary justify-end">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-text-primary">{topic.reply_count || 0}</span>
                    <span className="text-xs">{t('forumRepliesLabel')}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-text-primary">{topic.visualizacoes}</span>
                    <span className="text-xs">{t('forumViewsLabel')}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {!formattedTopics.length && (
          <div className="cosmic-card rounded-xl p-8 text-center border border-dashed border-purple-500/40">
            <p className="text-text-secondary">{t('forumNoTopics')}</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="cosmic-card text-text-primary border-purple-700/50 max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('forumNewTopic')}</DialogTitle>
            <DialogDescription className="text-text-secondary">
              {category.nome_categoria}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary" htmlFor="topic-title">
                {t('forumTopicTitle')}
              </label>
              <Input
                id="topic-title"
                value={newTopic.title}
                onChange={(event) => setNewTopic((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary" htmlFor="topic-content">
                {t('forumTopicContent')}
              </label>
              <Textarea
                id="topic-content"
                rows={5}
                value={newTopic.content}
                onChange={(event) => setNewTopic((prev) => ({ ...prev, content: event.target.value }))}
                placeholder={t('forumReplyPlaceholder')}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                {t('forumCancel')}
              </Button>
              <Button onClick={handleCreateTopic} disabled={isSubmitting}>
                {t('forumCreateTopicCta')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
