export const createNotificationsSlice = (set, get) => ({
  registerToastListener() {
    if (typeof window === 'undefined') return;
    const handler = (event) => {
      set((state) => ({ notifications: [...state.notifications, event.detail] }));
      window.setTimeout(() => {
        get().dismissNotification(event.detail.id);
      }, 4000);
    };
    window.addEventListener('ascenda:toast', handler);
    return () => window.removeEventListener('ascenda:toast', handler);
  },
  dismissNotification(id) {
    set((state) => ({ notifications: state.notifications.filter((item) => item.id !== id) }));
  }
});
