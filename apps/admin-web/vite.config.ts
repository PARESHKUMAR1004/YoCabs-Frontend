/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // In development the console talks to the local API through the dev server, so no CORS setup is needed.
  const apiTarget = env.YOCABS_API_URL ?? 'http://localhost:8080';

  return {
    plugins: [react()],
    server: { port: 5173, proxy: { '/api': { target: apiTarget, changeOrigin: true } } },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
    },
  };
});
