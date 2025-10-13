export const createUsersSlice = (set, get) => ({
  getPadrinho() {
    return get().users.find((user) => user.role === 'padrinho');
  },
  getEstagiarios() {
    return get().users.filter((user) => user.role === 'estagiario');
  },
  findUserBySlug(slug) {
    return get().users.find((user) => user.slug === slug);
  }
});