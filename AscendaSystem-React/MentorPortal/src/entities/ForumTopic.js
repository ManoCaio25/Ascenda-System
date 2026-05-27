import { createEntityStore } from './store';
import { forumTopics as initialForumTopics } from './data';

const store = createEntityStore('ascenda_estagiario_forum_topics', initialForumTopics);

export const ForumTopic = {
  list(sort, limit) {
    return store.list(sort, limit);
  },

  filter(criteria, sort, limit) {
    return store.filter(criteria, sort, limit);
  },

  get(id) {
    return store.findById(id);
  },

  create(record) {
    return store.create(record);
  },

  update(id, updates) {
    return store.update(id, updates);
  },

  subscribe(handler) {
    return store.subscribe('change', handler);
  },
};
