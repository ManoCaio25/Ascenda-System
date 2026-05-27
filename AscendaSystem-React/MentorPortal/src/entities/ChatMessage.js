import { createEntityStore } from './store';
import { chatMessages as initialMessages } from './data';

const store = createEntityStore('ascenda_chat_messages', initialMessages);

export const ChatMessage = {
  list(sort, limit) {
    return store.list(sort, limit);
  },

  filter(criteria, sort, limit) {
    return store.filter(criteria, sort, limit);
  },

  find(id) {
    return store.findById(id);
  },

  async create(payload) {
    return store.create({
      read: payload?.read ?? false,
      created_date: payload?.created_date ?? new Date().toISOString(),
      ...payload,
    });
  },

  update(id, updates) {
    return store.update(id, updates);
  }
};

