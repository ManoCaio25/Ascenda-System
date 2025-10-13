import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/app/components', import.meta.url)),
      '@routes': fileURLToPath(new URL('./src/app/routes', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/app/store', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/app/services', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/app/assets', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/app/styles', import.meta.url))
    }
  }
});

