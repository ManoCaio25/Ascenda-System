import { createEntityStore } from './store.js';
import { getCurrentIntern } from '../services/sessionService.js';
import {
  users,
  tasks,
  learningPaths,
  contents,
  forumCategories,
  forumTopics,
  forumReplies,
  calendarEvents,
  activities,
  achievements,
  shopItems,
} from './data.js';

const userStore = createEntityStore('ascenda_estagiario_users', users);
const taskStore = createEntityStore('ascenda_estagiario_tasks', tasks);
const learningPathStore = createEntityStore('ascenda_estagiario_learning_paths', learningPaths);
const contentStore = createEntityStore('ascenda_estagiario_contents', contents);
const forumCategoryStore = createEntityStore('ascenda_estagiario_forum_categories', forumCategories);
const forumTopicStore = createEntityStore('ascenda_estagiario_forum_topics', forumTopics);
const forumReplyStore = createEntityStore('ascenda_estagiario_forum_replies', forumReplies);
const calendarStore = createEntityStore('ascenda_estagiario_calendar_events', calendarEvents);
const activityStore = createEntityStore('ascenda_estagiario_activities', activities);
const achievementStore = createEntityStore('ascenda_estagiario_achievements', achievements);
const shopItemStore = createEntityStore('ascenda_estagiario_shop_items', shopItems);

const AUTH_ACCOUNTS_KEY = 'ascenda_auth_accounts';
const CURRENT_USER_KEY = 'ascenda_current_user_id';
const MENTOR_INTERNS_KEY = 'ascenda_interns';

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.warn(`Failed to read ${key}`, error);
    return fallback;
  }
}

function resolveCurrentInternUser() {
  const currentUserId = typeof window !== 'undefined'
    ? window.localStorage.getItem(CURRENT_USER_KEY)
    : null;

  if (!currentUserId) return null;

  const accounts = readJson(AUTH_ACCOUNTS_KEY, []);
  const account = accounts.find((item) => String(item.id) === String(currentUserId));
  if (!account || account.role !== 'intern') return null;

  const interns = readJson(MENTOR_INTERNS_KEY, []);
  const intern = interns.find(
    (item) =>
      String(item.user_id || '') === String(account.id) ||
      String(item.email || '').toLowerCase() === String(account.email || '').toLowerCase(),
  );

  return {
    id: intern?.id || account.intern_id || account.id,
    user_id: account.id,
    full_name: intern?.full_name || account.full_name,
    email: intern?.email || account.email,
    avatar_url: intern?.avatar_url || account.avatar_url || '',
    area_atuacao: intern?.track || account.track || 'General Track',
    pontos_gamificacao: intern?.points ?? 0,
    equipped_tag: intern?.equipped_tag || 'New Intern',
    mentor_name: intern?.mentor_name || account.mentor_name,
    mentor_email: intern?.mentor_email,
    substitute_mentor_name: intern?.substitute_mentor_name || account.substitute_mentor_name,
    substitute_mentor_email: intern?.substitute_mentor_email,
  };
}

function toPortalUser(intern) {
  if (!intern) return null;
  return {
    id: intern.id,
    user_id: intern.user_id,
    full_name: intern.full_name,
    email: intern.email,
    avatar_url: intern.avatar_url || '',
    area_atuacao: intern.track || intern.area_atuacao || 'General Track',
    pontos_gamificacao: intern.points ?? intern.pontos_gamificacao ?? 0,
    equipped_tag: intern.equipped_tag || 'New Intern',
    mentor_name: intern.mentor_name,
    mentor_email: intern.mentor_email,
    substitute_mentor_name: intern.substitute_mentor_name,
    substitute_mentor_email: intern.substitute_mentor_email,
  };
}

async function getLocalUser() {
  const sessionUser = resolveCurrentInternUser();
  if (sessionUser) {
    return sessionUser;
  }

  const [current] = await userStore.list();
  if (!current) {
    throw new Error('User not found');
  }
  return current;
}

export const User = {
  async me() {
    const intern = await getCurrentIntern(getLocalUser);
    return toPortalUser(intern) || intern;
  },
  async list() {
    return userStore.list();
  },
  async create(record) {
    return userStore.create(record);
  },
  async update(id, updates) {
    return userStore.update(id, updates);
  },
  subscribe(handler) {
    const unsubscribe = userStore.subscribe('change', handler);
    return typeof unsubscribe === 'function' ? unsubscribe : () => {};
  },
  async logout() {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('ascenda_estagiario_users');
      } catch (error) {
        console.warn('Failed to clear estagiario user storage on logout', error);
      }
    }
    return true;
  },
};

export const Task = {
  async list(sort, limit) {
    return taskStore.list(sort, limit);
  },
  async update(id, updates) {
    return taskStore.update(id, updates);
  },
};

export const LearningPath = {
  async list(sort, limit) {
    return learningPathStore.list(sort, limit);
  },
  async get(id) {
    return learningPathStore.findById(id);
  },
};

export const Content = {
  async list(sort, limit) {
    return contentStore.list(sort, limit);
  },
  async filter(criteria, sort, limit) {
    return contentStore.filter(criteria, sort, limit);
  },
};

export const ForumCategory = {
  async list(sort, limit) {
    return forumCategoryStore.list(sort, limit);
  },
  async get(id) {
    return forumCategoryStore.findById(id);
  },
  async update(id, updates) {
    return forumCategoryStore.update(id, updates);
  },
};

export const ForumTopic = {
  async list(sort, limit) {
    return forumTopicStore.list(sort, limit);
  },
  async filter(criteria, sort, limit) {
    return forumTopicStore.filter(criteria, sort, limit);
  },
  async get(id) {
    return forumTopicStore.findById(id);
  },
  async create(record) {
    return forumTopicStore.create(record);
  },
  async update(id, updates) {
    return forumTopicStore.update(id, updates);
  },
};

export const ForumReply = {
  async list(sort, limit) {
    return forumReplyStore.list(sort, limit);
  },
  async filter(criteria, sort, limit) {
    return forumReplyStore.filter(criteria, sort, limit);
  },
  async create(record) {
    return forumReplyStore.create(record);
  },
};

export const CalendarEvent = {
  async list(sort, limit) {
    return calendarStore.list(sort, limit);
  },
  async create(payload) {
    return calendarStore.create(payload);
  },
};

export const Activity = {
  async list(sort, limit) {
    return activityStore.list(sort, limit);
  },
  async update(id, updates) {
    return activityStore.update(id, updates);
  },
  async addResponse(id, response) {
    const current = await activityStore.findById(id);
    if (!current) return null;
    const newResponse = {
      id: response?.id ?? `resp-${Date.now()}`,
      created_date: new Date().toISOString(),
      ...response,
    };
    const respostas = [...(current.respostas || []), newResponse];
    return activityStore.update(id, { respostas });
  },
};

export const Achievement = {
  async list(sort, limit) {
    return achievementStore.list(sort, limit);
  },
};

export const ShopItem = {
  async list(sort, limit) {
    return shopItemStore.list(sort, limit);
  },
};
