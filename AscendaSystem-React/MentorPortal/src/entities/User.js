import { users as initialUsers } from './data';
import { getCurrentSession, logoutSession } from '../services/sessionService';

async function getLocalUser() {
  const [defaultUser] = initialUsers;
  if (!defaultUser) {
    throw new Error('No local mentor user configured.');
  }
  return { ...defaultUser, role: defaultUser.role || 'mentor' };
}

export const User = {
  async me() {
    const session = await getCurrentSession(getLocalUser);
    return session?.profile ? { ...session.profile, role: session.profile.role || 'mentor' } : session;
  },

  async logout() {
    await logoutSession();
  }
};
