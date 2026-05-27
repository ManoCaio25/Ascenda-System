
const subscribers = new Map();

export const eventBus = {
  emit(type, payload) {
    const handlers = subscribers.get(type) || [];
    const allHandlers = subscribers.get('*') || [];
    
    [...handlers, ...allHandlers].forEach(handler => {
      try {
        handler({ type, payload });
      } catch (error) {
        console.error('Event handler error:', error);
      }
    });
  },

  on(type, handler) {
    if (!subscribers.has(type)) {
      subscribers.set(type, []);
    }
    subscribers.get(type).push(handler);
    return () => eventBus.off(type, handler);
  },

  off(type, handler) {
    const handlers = subscribers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
      if (handlers.length === 0) {
        subscribers.delete(type);
      }
    }
  }
};

export const EventTypes = {
  COURSE_PUBLISHED: 'COURSE_PUBLISHED',
  COURSE_ASSIGNED: 'COURSE_ASSIGNED',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  VACATION_REQUESTED: 'VACATION_REQUESTED',
  VACATION_STATUS_CHANGED: 'VACATION_STATUS_CHANGED',
  INTERN_PAUSED: 'INTERN_PAUSED',
  INTERN_RESUMED: 'INTERN_RESUMED'
};
