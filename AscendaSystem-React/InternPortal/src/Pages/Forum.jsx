import React, { useEffect, useMemo, useState } from 'react';
import { ForumCategory, ForumTopic } from '@estagiario/Entities/all';
import { motion } from 'framer-motion';
import {
  Hash,
  MessageSquare,
  Book,
  Users,
  GitBranch,
  Sparkles,
  Flame,
  Search,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@estagiario/utils';
import { Input } from '@estagiario/Components/ui/input';
import { Button } from '@estagiario/Components/ui/button';
import { Textarea } from '@estagiario/Components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@estagiario/Components/ui/dialog';
import { useI18n } from '@estagiario/Components/utils/i18n';

const categoryIcons = {
  'Technical Questions': Hash,
  'Career Development': Users,
  'Project Showcase': GitBranch,
  'General Discussion': MessageSquare,
  'Resources & Tools': Book,
};

const categoryFocus = {
  'cat-1': 'technical',
  'cat-2': 'career',
  'cat-3': 'community',
  'cat-4': 'culture',
};

const focusFilters = [
  { id: 'all', labelKey: 'filterAll' },
  { id: 'technical', labelKey: 'filterTechnical' },
  { id: 'career', labelKey: 'filterCareer' },
  { id: 'community', labelKey: 'filterCommunity' },
  { id: 'culture', labelKey: 'filterCulture' },
];

const initialTopicForm = { title: '', content: '', categoryId: '' };

export default function ForumPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [focus, setFocus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topicForm, setTopicForm] = useState(initialTopicForm);

  useEffect(() => {
    const loadForum = async () => {
      const [categoryData, topicData] = await Promise.all([
        ForumCategory.list(),
        ForumTopic.list(),
      ]);
      setCategories(categoryData);
      setTopics(topicData);
      setIsLoading(false);
    };
    loadForum();
  }, []);

  const categoryTopicCounts = useMemo(() => {
    return topics.reduce((acc, topic) => {
      acc[topic.id_categoria_forum] = (acc[topic.id_categoria_forum] || 0) + 1;
      return acc;
    }, {});
  }, [topics]);

  const latestTopicByCategory = useMemo(() => {
    return topics.reduce((acc, topic) => {
      const current = acc[topic.id_categoria_forum];
      if (!current || new Date(topic.created_date) > new Date(current.created_date)) {
        acc[topic.id_categoria_forum] = topic;
      }
      return acc;
    }, {});
  }, [topics]);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return categories.filter((category) => {
      const matchesTerm = !term
        || category.nome_categoria.toLowerCase().includes(term)
        || category.descricao.toLowerCase().includes(term);
      const matchesFocus = focus === 'all' || categoryFocus[category.id] === focus;
      return matchesTerm && matchesFocus;
    });
  }, [categories, searchTerm, focus]);

  const trendingTopics = useMemo(
    () => topics.slice().sort((a, b) => (b.reply_count || 0) - (a.reply_count || 0)).slice(0, 3),
    [topics],
  );

  const handleCreateTopic = async () => {
    if (!topicForm.title.trim() || !topicForm.content.trim() || !topicForm.categoryId) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id_categoria_forum: topicForm.categoryId,
        titulo: topicForm.title.trim(),
        conteudo_topico: topicForm.content.trim(),
        id_usuario_criador: 'user_1',
        reply_count: 0,
        visualizacoes: 1,
      };

      const created = await ForumTopic.create(payload);
      setTopics((prev) => [created, ...prev]);

      const category = categories.find((item) => item.id === topicForm.categoryId);
      if (category) {
        const updatedCount = (category.topic_count || 0) + 1;
        const updatedCategory = await ForumCategory.update(category.id, { topic_count: updatedCount });
        setCategories((prev) =>
          prev.map((item) =>
            item.id === category.id
              ? updatedCategory || { ...item, topic_count: updatedCount }
              : item,
          ),
        );
      }
      setTopicForm(initialTopicForm);
      setIsDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10 text-text-secondary">{t('loading')}</div>;
  }

  if (!categories.length) {
    return <div className="text-center p-10 text-text-secondary">{t('forumNoCategoriesLoaded')}</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto text-text-primary space-y-8">
      <div className="cosmic-card rounded-2xl p-6 border border-purple-500/30 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-purple-300">
            <Sparkles className="w-4 h-4" /> {t('forumWelcome')}
          </span>
          <h1 className="text-3xl font-bold text-text-primary">{t('forumTitle')}</h1>
          <p className="text-text-secondary max-w-2xl">{t('forumSubtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="text-text-primary border-purple-500/40">
            <Flame className="w-4 h-4 mr-2" /> {t('forumChallenges')}
          </Button>
          <Button variant="gradient" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> {t('forumNewTopicCta')}
          </Button>
        </div>
      </div>

      <div className="cosmic-card rounded-2xl p-5 border border-purple-500/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-10"
              placeholder={t('searchForumPlaceholder')}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {focusFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={focus === filter.id ? 'gradient' : 'outline'}
                size="sm"
                onClick={() => setFocus(filter.id)}
              >
                {t(filter.labelKey)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
        <div className="space-y-4">
          {filteredCategories.map((category, index) => {
            const Icon = categoryIcons[category.nome_categoria] || MessageSquare;
            const topicCount = categoryTopicCounts[category.id] || 0;
            const recentTopic = latestTopicByCategory[category.id];

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={createPageUrl(`ForumTopics?category=${category.id}`)}
                  className="block cosmic-card rounded-xl p-6 hover:border-purple-500 transition-all duration-300 border border-purple-500/20"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="font-semibold text-xl text-text-primary">{category.nome_categoria}</h2>
                        <p className="text-sm text-text-secondary">{category.descricao}</p>
                        {recentTopic ? (
                          <p className="text-xs text-text-secondary/80">
                            {t('forumLatestActivity')}: <span className="text-purple-300">{recentTopic.titulo}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-[140px]">
                      <div className="text-right">
                        <div className="font-bold text-lg text-text-primary">{topicCount}</div>
                        <div className="text-sm text-text-secondary">{t('topicsLabel')}</div>
                      </div>
                      <Button variant="outline" size="sm">
                        {t('viewCategory')}
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {!filteredCategories.length && (
            <div className="cosmic-card rounded-xl p-8 text-center border border-dashed border-purple-500/40">
              <p className="text-text-secondary">{t('forumEmptyState')}</p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="cosmic-card rounded-xl p-5 border border-purple-500/30">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-200 mb-4">
              {t('trendingTopics')}
            </h3>
            <div className="space-y-3">
              {trendingTopics.map((topic) => (
                <Link
                  key={topic.id}
                  to={createPageUrl(`ForumTopicView?id=${topic.id}`)}
                  className="block rounded-lg border border-purple-500/20 bg-purple-500/10 p-3 hover:border-purple-500 transition-colors"
                >
                  <p className="text-sm font-semibold text-text-primary line-clamp-2">{topic.titulo}</p>
                  <div className="flex items-center justify-between text-xs text-purple-200 mt-2">
                    <span>{topic.reply_count} {t('forumRepliesLabel')}</span>
                    <span>{topic.visualizacoes} {t('forumViewsLabel')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="cosmic-card rounded-xl p-5 border border-purple-500/30 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-200">
              {t('forumTipsTitle')}
            </h3>
            <p className="text-sm text-text-secondary">• {t('forumTipOne')}</p>
            <p className="text-sm text-text-secondary">• {t('forumTipTwo')}</p>
            <p className="text-sm text-text-secondary">• {t('forumTipThree')}</p>
          </div>
        </aside>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="cosmic-card text-text-primary border-purple-700/50 max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('forumNewTopic')}</DialogTitle>
            <DialogDescription className="text-text-secondary">
              {t('forumSubtitle')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary" htmlFor="forum-category">
                {t('forumSelectCategory')}
              </label>
              <select
                id="forum-category"
                value={topicForm.categoryId}
                onChange={(event) => setTopicForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                className="w-full rounded-md border border-default bg-[var(--sidebar-bg)] px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">{t('forumCategoryPlaceholder')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nome_categoria}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary" htmlFor="forum-title">
                {t('forumTopicTitle')}
              </label>
              <Input
                id="forum-title"
                value={topicForm.title}
                onChange={(event) => setTopicForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary" htmlFor="forum-content">
                {t('forumTopicContent')}
              </label>
              <Textarea
                id="forum-content"
                rows={5}
                value={topicForm.content}
                onChange={(event) => setTopicForm((prev) => ({ ...prev, content: event.target.value }))}
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
