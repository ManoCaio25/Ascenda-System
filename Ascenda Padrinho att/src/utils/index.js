export const PAGE_URLS = {
  Dashboard: '/',
  Interns: '/interns',
  ActivityGenerator: '/activity-generator',
  ContentManagement: '/content',
  VacationRequests: '/vacation-requests',
  Reports: '/reports',
  Forum: '/forum',
  ForumTopics: '/forum/topics',
  ForumTopicView: '/forum/topic',
};

export function createPageUrl(pageName) {
  return PAGE_URLS[pageName] ?? '/';
}

export function cn(...values) {
  return values.filter(Boolean).join(' ');
}

