import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const sharedEnvDir = path.resolve(currentDir, '..');

function appBase(mode) {
  const env = loadEnv(mode, sharedEnvDir, '');
  return env.VITE_INTERN_BASE || (mode === 'production' ? '/intern/' : '/AscendaSystem-React/InternPortal/');
}

export default defineConfig(({ mode }) => ({
  envDir: sharedEnvDir,
  base: appBase(mode),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(currentDir, './src'),
      '@intern': path.resolve(currentDir, './src'),
      '@estagiario': path.resolve(currentDir, './src'),
    },
  },
}));
