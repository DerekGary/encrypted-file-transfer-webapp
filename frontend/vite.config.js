import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuring the server's default port
export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [react()]
});
