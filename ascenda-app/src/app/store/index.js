import { useEffect } from 'react';
import { create } from 'zustand';
import { createAuthSlice } from './slices/auth.slice.js';
import { createUsersSlice } from './slices/users.slice.js';
import { createQuizzesSlice } from './slices/quizzes.slice.js';
import { createVideosSlice } from './slices/videos.slice.js';
import { createVacationSlice } from './slices/vacation.slice.js';
import { createForumSlice } from './slices/forum.slice.js';
import { createNotificationsSlice } from './slices/notifications.slice.js';
import { createIndexedDbAdapter } from '../services/storage/db.js';
import { createLocalAdapter } from '../services/storage/local.js';

export const useStore = create((set, get) => ({
  hydrated: false,
  adapter: null,
  users: [],
  quizLibrary: [],
  quizAssignments: [],
  activities: [],
  videos: [],
  videoProgress: [],
  vacationRequests: [],
  forumTopics: [],
  notifications: [],
  session: null,
  auth: {
    user: null
  },
  async hydrate() {
    if (get().hydrated) return;
    let adapter;
    try {
      adapter = await createIndexedDbAdapter();
    } catch (error) {
      adapter = createLocalAdapter();
    }
    const data = await adapter.loadDataset();
    set({
      adapter,
      hydrated: true,
      users: data.users,
      quizLibrary: data.quizLibrary,
      quizAssignments: data.quizAssignments,
      activities: data.activities,
      videos: data.videos,
      videoProgress: data.videoProgress,
      vacationRequests: data.vacationRequests,
      forumTopics: data.forumTopics,
      session: data.session ?? null
    });
    if (data.session) {
      const sessionUser = data.users.find((user) => user.slug === data.session);
      if (sessionUser) {
        set((state) => ({ auth: { ...state.auth, user: sessionUser } }));
      }
    }
  },
  async persist() {
    const adapter = get().adapter;
    if (!adapter || !adapter.persistDataset) return;
    const dataset = {
      users: get().users,
      quizLibrary: get().quizLibrary,
      quizAssignments: get().quizAssignments,
      activities: get().activities,
      videos: get().videos,
      videoProgress: get().videoProgress,
      vacationRequests: get().vacationRequests,
      forumTopics: get().forumTopics,
      notifications: get().notifications,
      session: get().session
    };
    await adapter.persistDataset(dataset);
  },
  ...createAuthSlice(set, get),
  ...createUsersSlice(set, get),
  ...createQuizzesSlice(set, get),
  ...createVideosSlice(set, get),
  ...createVacationSlice(set, get),
  ...createForumSlice(set, get),
  ...createNotificationsSlice(set, get)
}));

export function StoreProvider({ children }) {
  const hydrate = useStore((state) => state.hydrate);
  const hydrated = useStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrate, hydrated]);

  return children;
}


