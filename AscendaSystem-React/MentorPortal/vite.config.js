import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/AscendaSystem-React/MentorPortal/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@mentor': path.resolve(__dirname, './src'),
      '@padrinho': path.resolve(__dirname, './src')
    }
  }
});
