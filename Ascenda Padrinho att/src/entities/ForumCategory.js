import { createEntityStore } from './store';
import { forumCategories as initialForumCategories } from './data';

const store = createEntityStore('ascenda_estagiario_forum_categories', initialForumCategories);

export const ForumCategory = {
  list(sort, limit) {
    return store.list(sort, limit);
  },

  get(id) {
    return store.findById(id);
  },

  update(id, updates) {
    return store.update(id, updates);
  },

  subscribe(handler) {
    return store.subscribe('change', handler);
  },
};
