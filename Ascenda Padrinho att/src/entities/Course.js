import { createEntityStore } from './store';
import { courses as initialCourses } from './data';

const store = createEntityStore('ascenda_courses', initialCourses);

export const Course = {
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
    const now = new Date().toISOString();
    return store.create({
      published: true,
      ...payload,
      created_date: payload?.created_date ?? now,
    });
  },

  update(id, updates) {
    return store.update(id, updates);
  },

  remove(id) {
    return store.remove(id);
  },
};

