import { createEntityStore } from './store';
import { notifications as initialNotifications } from './data';

const store = createEntityStore('ascenda_notifications', initialNotifications);

export const Notification = {
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
      read: false,
      ...payload,
      created_date: payload?.created_date ?? new Date().toISOString(),
    });
  },

  update(id, updates) {
    return store.update(id, updates);
  },

  remove(id) {
    return store.remove(id);
  }
};

