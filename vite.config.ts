import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiPort = process.env.TIMECARD_API_PORT || '3000';
const clientPort = Number(process.env.TIMECARD_CLIENT_PORT || '5173');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: clientPort,
    proxy: {
      '/api': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
    },
  },
});
