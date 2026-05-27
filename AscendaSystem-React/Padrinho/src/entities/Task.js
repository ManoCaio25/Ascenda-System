import { createEntityStore } from './store';
import { tasks as initialTasks } from './data';

const store = createEntityStore('ascenda_tasks', initialTasks);

export const Task = {
  list(sort, limit) {
    return store.list(sort, limit);
  },

  filter(criteria, sort, limit) {
    return store.filter(criteria, sort, limit);
  },

  find(id) {
    return store.findById(id);
  },

  update(id, updates) {
    return store.update(id, updates);
  }
};

