import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use 'node' environment for backend testing
    environment: 'node',

    // Test file patterns
    include: ['src/**/*.test.js', 'src/**/*.spec.js'],

    // Global test timeout
    testTimeout: 10_000,

    // Hooks timeout
    hookTimeout: 15_000,

    // Run tests in sequence for integration tests (shared DB)
    // Unit tests are parallelized by default
    pool: 'forks',

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.js'],
      exclude: ['src/**/*.test.js', 'src/**/*.spec.js', 'src/server.js'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
});
