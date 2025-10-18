import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Hash,
  MessageSquare,
  Book,
  Users,
  GitBranch,
  Sparkles,
  Search,
  Plus,
  Flame,
} from 'lucide-react';
import { ForumCategory } from '@padrinho/entities/ForumCategory';
import { ForumTopic } from '@padrinho/entities/ForumTopic';
import { ForumReply } from '@padrinho/entities/ForumReply';
import { createPageUrl } from '@padrinho/utils';
import { Input } from '@padrinho/components/ui/input';
import { Button } from '@padrinho/components/ui/button';
import { Textarea } from '@padrinho/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@padrinho/components/ui/dialog';
import { useTranslation } from '@padrinho/i18n';
import { useForumAuthors } from '@padrinho/hooks/useForumAuthors';

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
  { id: 'all', labelKey: 'forum.filters.all' },
  { id: 'technical', labelKey: 'forum.filters.technical' },
  { id: 'career', labelKey: 'forum.filters.career' },
  { id: 'community', labelKey: 'forum.filters.community' },
  { id: 'culture', labelKey: 'forum.filters.culture' },
];

const initialTopicForm = { title: '', content: '', categoryId: '' };

export default function ForumPage() {
  const { t, language } = useTranslation();
  const { getAuthorProfile } = useForumAuthors();
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [replies, setReplies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [focus, setFocus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topicForm, setTopicForm] = useState(initialTopicForm);

  useEffect(() => {
    const loadForum = async () => {
      const [categoryData, topicData, repliesData] = await Promise.all([
        ForumCategory.list(),
        ForumTopic.list(),
        ForumReply.list('-created_date'),
      ]);
      setCategories(categoryData);
      setTopics(topicData);
      setReplies(repliesData);
      setIsLoading(false);
    };
    loadForum();
  }, []);

  const locale = language === 'pt' ? ptBR : undefined;

  const topicsById = useMemo(() => {
    return topics.reduce((acc, topic) => {
      acc[topic.id] = topic;
      return acc;
    }, {});
  }, [topics]);

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
      const matchesTerm =
        !term ||
        category.nome_categoria.toLowerCase().includes(term) ||
        category.descricao.toLowerCase().includes(term);
      const matchesFocus = focus === 'all' || categoryFocus[category.id] === focus;
      return matchesTerm && matchesFocus;
    });
  }, [categories, searchTerm, focus]);

  const trendingTopics = useMemo(() => {
    return topics
      .slice()
      .sort((a, b) => (b.reply_count || 0) - (a.reply_count || 0))
      .slice(0, 3)
      .map((topic) => {
        const author = getAuthorProfile(topic.id_usuario_criador);
        const relativeTime = topic.created_date
          ? formatDistanceToNow(new Date(topic.created_date), { addSuffix: true, locale })
          : null;
        return {
          ...topic,
          author,
          relativeTime,
        };
      });
  }, [topics, getAuthorProfile, locale]);

  const latestReplies = useMemo(() => {
    return replies
      .slice()
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 4)
      .map((reply) => {
        const author = getAuthorProfile(reply.id_usuario_criador);
        const topic = topicsById[reply.id_topico];
        const relativeTime = reply.created_date
          ? formatDistanceToNow(new Date(reply.created_date), { addSuffix: true, locale })
          : null;
        return {
          reply,
          author,
          topic,
          relativeTime,
        };
      });
  }, [replies, getAuthorProfile, topicsById, locale]);

  const forumStats = useMemo(() => {
    const totalTopics = topics.length;
    const totalReplies = replies.length;
    const activeInterns = new Set(
      replies
        .map((reply) => getAuthorProfile(reply.id_usuario_criador)?.displayName)
        .filter(Boolean),
    ).size;

    return {
      totalTopics,
      totalReplies,
      activeInterns,
    };
  }, [topics, replies, getAuthorProfile]);

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
    return <div className="p-10 text-center text-muted">{t('forum.loading')}</div>;
  }

  if (!categories.length) {
    return <div className="p-10 text-center text-muted">{t('forum.noCategories')}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-e2">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand">
              <Sparkles className="h-4 w-4" /> {t('forum.headerTagline')}
            </span>
            <h1 className="text-3xl font-bold text-primary md:text-4xl">{t('forum.headerTitle')}</h1>
            <p className="text-muted md:max-w-2xl">{t('forum.headerSubtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" className="text-primary">
              <Flame className="mr-2 h-4 w-4" />
              {t('forum.challengeCta')}
            </Button>
            <Button size="sm" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('forum.newTopicCta')}
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface2 p-4 shadow-e1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t('forum.stats.topics')}</p>
            <p className="mt-1 text-2xl font-bold text-primary">{forumStats.totalTopics}</p>
            <p className="text-xs text-muted">{t('forum.stats.topicsDescription')}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface2 p-4 shadow-e1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t('forum.stats.replies')}</p>
            <p className="mt-1 text-2xl font-bold text-primary">{forumStats.totalReplies}</p>
            <p className="text-xs text-muted">{t('forum.stats.repliesDescription')}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface2 p-4 shadow-e1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t('forum.stats.activeInterns')}</p>
            <p className="mt-1 text-2xl font-bold text-primary">{forumStats.activeInterns}</p>
            <p className="text-xs text-muted">{t('forum.stats.activeInternsDescription')}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-e1">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-10"
              placeholder={t('forum.searchPlaceholder')}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {focusFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={focus === filter.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFocus(filter.id)}
              >
                {t(filter.labelKey)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          {filteredCategories.map((category, index) => {
            const Icon = categoryIcons[category.nome_categoria] || MessageSquare;
            const topicCount = categoryTopicCounts[category.id] || 0;
            const recentTopic = latestTopicByCategory[category.id];

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={createPageUrl(`ForumTopics?category=${category.id}`)}
                  className="block rounded-xl border border-border bg-surface p-6 shadow-e1 transition-all hover:border-brand"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface2 text-brand">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-primary">{category.nome_categoria}</h2>
                        <p className="text-sm text-muted">{category.descricao}</p>
                        {recentTopic ? (
                          <p className="text-xs text-muted">
                            {t('forum.latestActivity')}{' '}
                            <span className="font-medium text-primary">{recentTopic.titulo}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex min-w-[140px] flex-col items-end gap-2 text-right">
                      <div>
                        <div className="text-lg font-semibold text-primary">{topicCount}</div>
                        <div className="text-xs uppercase tracking-wide text-muted">
                          {t('forum.topicsLabel')}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-brand">{t('forum.viewCategory')}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {!filteredCategories.length && (
            <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-muted">
              {t('forum.emptyState')}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-e1">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
              {t('forum.trendingTitle')}
            </h3>
            <div className="space-y-3">
              {trendingTopics.map((topic) => (
                <Link
                  key={topic.id}
                  to={createPageUrl(`ForumTopicView?id=${topic.id}`)}
                  className="block rounded-lg border border-border bg-surface2 p-3 transition hover:border-brand"
                >
                  <p className="text-sm font-semibold text-primary line-clamp-2">{topic.titulo}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted">
                    <span>
                      {topic.reply_count || 0} {t('forum.repliesLabel')}
                    </span>
                    <span>
                      {topic.visualizacoes || 0} {t('forum.viewsLabel')}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                    <span className="font-medium text-primary">
                      {topic.author?.displayName || t('forum.anonymous')}
                    </span>
                    {topic.relativeTime ? <span>{topic.relativeTime}</span> : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-e1 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              {t('forum.tipsTitle')}
            </h3>
            <p className="text-sm text-muted">• {t('forum.tipOne')}</p>
            <p className="text-sm text-muted">• {t('forum.tipTwo')}</p>
            <p className="text-sm text-muted">• {t('forum.tipThree')}</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-e1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {t('forum.latestRepliesTitle')}
                </h3>
                <p className="mt-1 text-sm text-muted">{t('forum.latestRepliesSubtitle')}</p>
              </div>
              <MessageSquare className="h-5 w-5 text-brand" />
            </div>
            <div className="mt-4 space-y-3">
              {latestReplies.length ? (
                latestReplies.map(({ reply, author, topic, relativeTime }) => (
                  <Link
                    key={reply.id}
                    to={createPageUrl(`ForumTopicView?id=${reply.id_topico}`)}
                    className="block rounded-lg border border-border bg-surface2 p-3 transition hover:border-brand"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-surface">
                        {author?.avatar ? (
                          <img src={author.avatar} alt={author.displayName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-muted">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted">
                          <span className="font-semibold text-primary">
                            {author?.displayName || t('forum.anonymous')}
                          </span>
                          {relativeTime ? <span>{relativeTime}</span> : null}
                        </div>
                        <p className="text-sm text-primary line-clamp-2">{reply.conteudo_resposta}</p>
                        {topic ? (
                          <p className="text-xs text-muted">
                            {t('forum.replyInTopic')}{' '}
                            <span className="font-medium text-primary">{topic.titulo}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-border bg-surface2 p-4 text-center text-xs text-muted">
                  {t('forum.latestRepliesEmpty')}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('forum.modalTitle')}</DialogTitle>
            <DialogDescription>{t('forum.modalDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6 pt-0">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted" htmlFor="forum-category">
                {t('forum.selectCategory')}
              </label>
              <select
                id="forum-category"
                value={topicForm.categoryId}
                onChange={(event) =>
                  setTopicForm((prev) => ({ ...prev, categoryId: event.target.value }))
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">{t('forum.categoryPlaceholder')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nome_categoria}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted" htmlFor="forum-title">
                {t('forum.topicTitleLabel')}
              </label>
              <Input
                id="forum-title"
                value={topicForm.title}
                onChange={(event) => setTopicForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted" htmlFor="forum-content">
                {t('forum.topicContentLabel')}
              </label>
              <Textarea
                id="forum-content"
                rows={5}
                value={topicForm.content}
                onChange={(event) => setTopicForm((prev) => ({ ...prev, content: event.target.value }))}
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
