import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      // Add aliases
      '@': path.resolve(__dirname, './src'),
      // Ensure redux toolkit is correctly recognized
      '@reduxjs/toolkit': path.resolve(__dirname, 'node_modules/@reduxjs/toolkit')
    }
  },
  build: {
    rollupOptions: {
      external: [], // Define external packages if necessary
      output: {
        // Adjust chunking behavior
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@reduxjs/toolkit'],
  }
});
