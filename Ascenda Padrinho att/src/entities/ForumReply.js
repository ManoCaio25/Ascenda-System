import { createEntityStore } from './store';
import { forumReplies as initialForumReplies } from './data';

const store = createEntityStore('ascenda_estagiario_forum_replies', initialForumReplies);

export const ForumReply = {
  list(sort, limit) {
    return store.list(sort, limit);
  },

  filter(criteria, sort, limit) {
    return store.filter(criteria, sort, limit);
  },

  create(record) {
    return store.create(record);
  },

  subscribe(handler) {
    return store.subscribe('change', handler);
  },
};
