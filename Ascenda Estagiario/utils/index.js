const PAGE_URLS = {
  Dashboard: '/',
  LearningPath: '/learning-path',
  Tasks: '/tasks',
  Forum: '/forum',
  ForumTopics: '/forum/topics',
  ForumTopicView: '/forum/topic',
  Calendar: '/calendar',
  KnowledgeBase: '/knowledge-base',
  Profile: '/profile',
  Settings: '/settings',
};

export { PAGE_URLS };

export function createPageUrl(pageQuery) {
  if (!pageQuery) return PAGE_URLS.Dashboard;
  const [pageName, query] = pageQuery.split('?');
  const base = PAGE_URLS[pageName] ?? PAGE_URLS.Dashboard;
  return query ? `${base}?${query}` : base;
}
