import { create } from 'zustand';

export const useLoginStore = create((set) => ({
  mode: 'estagiario',
  setMode: (mode) => set({ mode })
}));
