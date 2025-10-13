import { toast } from '../../services/notifyService.js';

export const createAuthSlice = (set, get) => ({
  async login({ email, password, role }) {
    const users = get().users;
    const user = users.find((item) => item.email === email && item.password === password && item.role === role);
    if (!user) {
      throw new Error('Credenciais inválidas para o perfil selecionado.');
    }
    set((state) => ({ auth: { ...state.auth, user }, session: user.slug }));
    await get().persist();
    toast(`Bem-vindo, ${user.name.split(' ')[0]}!`, 'success');
    return user;
  },
  logout() {
    const user = get().auth.user;
    if (user) {
      toast('Sessão encerrada com sucesso.', 'info');
    }
    set((state) => ({ auth: { ...state.auth, user: null }, session: null }));
    get().persist();
    return true;
  }
});