import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Only used when VITE_RANKINGS_URL points at /api/rankings; the
        // default build reads the committed rankings.json instead.
        proxy: {
          '/api': env.API_ORIGIN || 'http://localhost:3001',
        },
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
