import { createEntityStore } from './store.js';
import { getCurrentIntern, logoutSession } from '../services/sessionService.js';
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
const activityResponseStore = createEntityStore('ascenda_estagiario_activity_responses', []);
const achievementStore = createEntityStore('ascenda_estagiario_achievements', achievements);
const shopItemStore = createEntityStore('ascenda_estagiario_shop_items', shopItems);

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
    await logoutSession();
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

function toActivityResponse(response = {}) {
  return {
    id: response.id,
    created_date: response.created_date || response.submitted_at || response.created_at || new Date().toISOString(),
    autor: response.autor || response.author_name || response.intern_name || 'Estagiario',
    conteudo: response.conteudo || response.content || '',
    links: response.links || [],
    tipo: response.tipo || 'intern',
  };
}

function mergeActivityResponses(activity, responses = []) {
  const localResponses = (activity.respostas || []).map(toActivityResponse);
  const remoteResponses = responses
    .filter((response) => String(response.id_atividade || response.activity_id) === String(activity.id))
    .map(toActivityResponse);
  const byId = new Map();

  [...localResponses, ...remoteResponses].forEach((response) => {
    byId.set(String(response.id), response);
  });

  const respostas = Array.from(byId.values()).sort((a, b) => {
    return new Date(a.created_date).getTime() - new Date(b.created_date).getTime();
  });

  return {
    ...activity,
    respostas,
  };
}

export const Activity = {
  async list(sort, limit) {
    const activityItems = await activityStore.list(sort, limit);
    const responses = await activityResponseStore.list('-created_date').catch(() => []);
    return activityItems.map((activity) => mergeActivityResponses(activity, responses));
  },
  async update(id, updates) {
    return activityStore.update(id, updates);
  },
  async addResponse(id, response) {
    const current = await activityStore.findById(id);
    if (!current) return null;
    const created = await activityResponseStore.create({
      activity_id: id,
      intern_id: response?.intern_id,
      content: response?.conteudo,
      links: response?.links || [],
    });
    const newResponse = toActivityResponse({
      ...created,
      autor: response?.autor,
      conteudo: created.conteudo || created.content || response?.conteudo,
      tipo: response?.tipo || 'intern',
    });
    const respostas = [...(current.respostas || []), newResponse];
    let nextActivity = current;
    if (current.status === 'open') {
      nextActivity = await activityStore.update(id, { status: 'in_progress' }).catch((error) => {
        console.warn('Unable to update activity status after response.', error);
        return current;
      });
    }
    return { ...nextActivity, respostas };
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
