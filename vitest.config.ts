import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Keep deterministic sequential execution.
    fileParallelism: false,
    // The suite is small, so a single worker keeps memory use predictable on
    // low-RAM machines while the emulator and dev server are running.
    maxWorkers: 1,
    minWorkers: 1,
  },
});
