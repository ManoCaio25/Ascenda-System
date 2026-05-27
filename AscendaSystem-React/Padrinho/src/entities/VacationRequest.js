import { createEntityStore } from './store';
import { vacationRequests as initialRequests } from './data';

const store = createEntityStore('ascenda_vacation_requests', initialRequests);

export const VacationRequest = {
  list(sort, limit) {
    return store.list(sort, limit);
  },

  filter(criteria, sort, limit) {
    return store.filter(criteria, sort, limit);
  },

  find(id) {
    return store.findById(id);
  },

  create(payload) {
    return store.create(payload);
  },

  update(id, updates) {
    return store.update(id, updates);
  }
};

