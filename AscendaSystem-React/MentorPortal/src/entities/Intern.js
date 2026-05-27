import { createEntityStore } from './store';
import { interns as initialInterns } from './data';

const store = createEntityStore('ascenda_interns', initialInterns);

export const Intern = {
  list(sort, limit) {
    return store.list(sort, limit);
  },

  filter(criteria, sort, limit) {
    return store.filter(criteria, sort, limit);
  },

  find(id) {
    return store.findById(id);
  },

  async update(id, updates) {
    const result = await store.update(id, updates);
    return result;
  }
};

