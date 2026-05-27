import { users as initialUsers } from './data';

const STORAGE_KEY = 'ascenda_current_user_id';

const getDefaultUser = () => initialUsers[0];

export const User = {
  async me() {
    const defaultUser = getDefaultUser();
    try {
      const storedId = typeof window !== 'undefined'
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
      if (storedId) {
        const match = initialUsers.find((user) => String(user.id) === storedId);
        if (match) {
          return { ...match };
        }
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, String(defaultUser.id));
      }
    } catch (error) {
      console.warn('Unable to access storage for user information', error);
    }
    return { ...defaultUser };
  },

  async logout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
};

