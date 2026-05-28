import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const sharedEnvDir = path.resolve(currentDir, '..');

function appBase(mode) {
  const env = loadEnv(mode, sharedEnvDir, '');
  return env.VITE_MENTOR_BASE || (mode === 'production' ? '/mentor/' : '/AscendaSystem-React/MentorPortal/');
}

export default defineConfig(({ mode }) => ({
  envDir: sharedEnvDir,
  base: appBase(mode),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(currentDir, './src'),
      '@mentor': path.resolve(currentDir, './src'),
      '@padrinho': path.resolve(currentDir, './src')
    }
  }
}));
