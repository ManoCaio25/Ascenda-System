import { toast, notifySound } from '../../services/notifyService.js';

export const createForumSlice = (set, get) => ({
  getTopics() {
    return [...get().forumTopics].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  addTopic({ title, body, slug }) {
    const topic = {
      id: `topic-${Date.now()}`,
      title,
      body,
      slug,
      comments: [],
      createdAt: new Date().toISOString()
    };
    set((state) => ({ forumTopics: [topic, ...state.forumTopics] }));
    toast('Tópico criado com sucesso.', 'success');
    notifySound();
    get().persist();
    return topic;
  },
  addComment(topicId, { message, author }) {
    set((state) => ({
      forumTopics: state.forumTopics.map((topic) => {
        if (topic.id !== topicId) return topic;
        const comment = {
          id: `comment-${Date.now()}`,
          message,
          author,
          createdAt: new Date().toISOString()
        };
        return { ...topic, comments: [...topic.comments, comment] };
      })
    }));
    toast('Comentário adicionado.', 'info');
    get().persist();
  }
});