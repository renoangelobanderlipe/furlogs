import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

/**
 * Base URL for the Next.js frontend.
 * In CI the app is served with `next start` after a production build.
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',

  /** Run tests sequentially — shared DB state cannot be parallelised safely. */
  fullyParallel: false,
  workers: 1,

  /** Fail the build on CI if test.only is accidentally committed. */
  forbidOnly: !!process.env.CI,

  /** Retry failed tests once in CI only. */
  retries: process.env.CI ? 1 : 0,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
  },

  expect: {
    timeout: 15_000,
  },

  /**
   * Global setup runs once before any project or webServer.
   * It resets the E2E database and seeds baseline data.
   */
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',

  projects: [
    /**
     * 1. Auth setup — creates a saved browser storage state (cookies) for the
     *    seeded dev user.  All authenticated projects depend on this.
     */
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },

    /**
     * 2. Authenticated tests — every spec except auth/ flows.
     *    Playwright injects the saved session cookies automatically.
     */
    {
      name: 'authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['auth-setup'],
      testIgnore: ['**/auth/**', '**/auth.setup.ts', '**/smoke.spec.ts'],
    },

    /**
     * 3. Unauthenticated tests — login, register, smoke.
     *    No storageState so these always start without a session.
     */
    {
      name: 'unauthenticated',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['auth-setup'],
      testMatch: ['**/auth/**/*.spec.ts', '**/smoke.spec.ts'],
    },
  ],

  webServer: [
    /**
     * Next.js frontend.
     * - Local dev: reuse an already-running `bun run dev:web` server.
     * - CI: run `next start` against the production build (built in workflow).
     */
    {
      command: process.env.CI
        ? 'bun run --cwd apps/web start'
        : 'bun run dev:web',
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },

    /**
     * Laravel API server running in the `testing` environment.
     * Uses apps/server/.env.testing (DB: furlogs_e2e).
     *
     * NOTE: reuseExistingServer uses a TCP port check (not HTTP) so any process
     * already bound to 8000 will be reused.  Make sure that server is running
     * with --env=testing; otherwise tests will hit the wrong database.
     * Stop `bun dev` before running E2E tests if you see DB-related failures.
     */
    {
      command:
        'php artisan serve --env=testing --host=127.0.0.1 --port=8000',
      port: 8000,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      cwd: path.resolve('apps/server'),
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
