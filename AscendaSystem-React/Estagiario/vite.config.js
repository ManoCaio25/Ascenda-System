import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  base: '/AscendaSystem-React/Estagiario/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@estagiario': path.resolve(__dirname, './src'),
    },
  },
});
