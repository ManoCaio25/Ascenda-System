import { createEntityStore } from './store';
import { interns as initialInterns } from './data';
import { filterInterns, listInterns, updateIntern } from '../services/internService';

const store = createEntityStore('ascenda_interns', initialInterns);

export const Intern = {
  list(sort, limit) {
    return listInterns({
      sort,
      limit,
      fallback: () => store.list(sort, limit),
    });
  },

  filter(criteria, sort, limit) {
    return filterInterns({
      criteria,
      sort,
      limit,
      fallback: () => store.filter(criteria, sort, limit),
    });
  },

  find(id) {
    return store.findById(id);
  },

  async update(id, updates) {
    return updateIntern(id, updates, () => store.update(id, updates));
  }
};

