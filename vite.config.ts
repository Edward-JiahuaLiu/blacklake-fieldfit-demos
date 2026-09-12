import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        quickReport: resolve(__dirname, 'quick-report/index.html'),
        collaborativeProgress: resolve(
          __dirname,
          'collaborative-progress/index.html',
        ),
      },
    },
  },
});
