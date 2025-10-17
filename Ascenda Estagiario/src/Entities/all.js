import { createEntityStore } from './store.js';
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

export const User = {
  async me() {
    const [current] = await userStore.list();
    if (!current) {
      throw new Error('User not found');
    }
    return current;
  },
  async list() {
    return userStore.list();
  },
  async update(id, updates) {
    return userStore.update(id, updates);
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
