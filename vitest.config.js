import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/server/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/server/**/*.js'],
      thresholds: {
        statements: 70,
        functions:  70,
        lines:      70,
        branches:   50
      }
    }
  }
});
