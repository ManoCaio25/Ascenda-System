import { users as initialUsers } from './data';

const STORAGE_KEY = 'ascenda_current_user_id';
const AUTH_ACCOUNTS_KEY = 'ascenda_auth_accounts';

const getDefaultUser = () => initialUsers[0];

const readAccounts = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(AUTH_ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Unable to read auth accounts', error);
    return [];
  }
};

const normalizeMentor = (account) => ({
  id: account.id,
  full_name: account.full_name,
  email: account.email,
  avatar_url: account.avatar_url,
  role: account.role === 'mentor' ? 'mentor' : account.role,
  title: account.title,
});

export const User = {
  async me() {
    const defaultUser = getDefaultUser();
    try {
      const storedId = typeof window !== 'undefined'
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
      if (storedId) {
        const account = readAccounts().find((user) => String(user.id) === storedId);
        if (account?.role === 'mentor') {
          return normalizeMentor(account);
        }

        const match = initialUsers.find((user) => String(user.id) === storedId);
        if (match) {
          return { ...match, role: 'mentor' };
        }
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, String(defaultUser.id));
      }
    } catch (error) {
      console.warn('Unable to access storage for user information', error);
    }
    return { ...defaultUser, role: 'mentor' };
  },

  async logout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
};

