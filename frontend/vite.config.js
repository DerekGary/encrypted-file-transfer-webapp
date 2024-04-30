// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    rollupOptions: {
      external: ['libsodium-wrappers'],
      output: {
        globals: {
          'libsodium-wrappers': 'sodium',
        },
      },
    },
  },
});