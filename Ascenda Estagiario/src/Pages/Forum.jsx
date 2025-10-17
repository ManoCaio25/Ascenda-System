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
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@estagiario/utils';
import { Input } from '@estagiario/Components/ui/input';
import { Button } from '@estagiario/Components/ui/button';
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

export default function ForumPage() {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [focus, setFocus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useI18n();

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
    () => topics.slice().sort((a, b) => b.reply_count - a.reply_count).slice(0, 3),
    [topics],
  );

  if (isLoading) {
    return <div className="text-white text-center p-10">{t('loading')}</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto text-white space-y-8">
      <div className="cosmic-card rounded-2xl p-6 border border-purple-500/30 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-purple-300">
            <Sparkles className="w-4 h-4" /> {t('forumWelcome')}
          </span>
          <h1 className="text-3xl font-bold">{t('forumTitle')}</h1>
          <p className="text-slate-300 max-w-2xl">{t('forumSubtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm">
            <Flame className="w-4 h-4 mr-2" /> {t('forumChallenges')}
          </Button>
          <Button variant="gradient">
            <Plus className="w-4 h-4 mr-2" /> {t('startNewTopic')}
          </Button>
        </div>
      </div>

      <div className="cosmic-card rounded-2xl p-5 border border-purple-500/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-10 bg-slate-900/70"
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
            const trending = topics.filter((topic) => topic.id_categoria_forum === category.id);
            const recentReply = trending.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

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
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-xl text-white mb-1">{category.nome_categoria}</h2>
                        <p className="text-sm text-slate-400">{category.descricao}</p>
                        {recentReply ? (
                          <p className="text-xs text-slate-500 mt-3">
                            {t('latestTopic')}: <span className="text-purple-200">{recentReply.titulo}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-[120px]">
                      <div className="text-right">
                        <div className="font-bold text-lg">{category.topic_count}</div>
                        <div className="text-sm text-slate-500">{t('topicsLabel')}</div>
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
              <p className="text-slate-400">{t('forumEmptyState')}</p>
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
                  <p className="text-sm font-semibold text-white line-clamp-2">{topic.titulo}</p>
                  <div className="flex items-center justify-between text-xs text-purple-200 mt-2">
                    <span>{topic.reply_count} {t('replies')}</span>
                    <span>{topic.visualizacoes} {t('views')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="cosmic-card rounded-xl p-5 border border-slate-700/60">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300 mb-3">
              {t('forumTipsTitle')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>{t('forumTipOne')}</li>
              <li>{t('forumTipTwo')}</li>
              <li>{t('forumTipThree')}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
