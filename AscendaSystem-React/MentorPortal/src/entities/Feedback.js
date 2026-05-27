import { createEntityStore } from './store';
import { feedbackEntries as initialFeedback } from './data';

const store = createEntityStore('ascenda_feedback_entries', initialFeedback);

export const Feedback = {
  list(sort, limit) {
    return store.list(sort, limit);
  },

  filter(criteria, sort, limit) {
    return store.filter(criteria, sort, limit);
  },

  find(id) {
    return store.findById(id);
  },

  create(record) {
    return store.create(record);
  },

  update(id, updates) {
    return store.update(id, updates);
  },
};
