import { execFileSync } from 'node:child_process';
import path from 'node:path';

/**
 * Playwright global teardown — runs once after all tests finish.
 * Stops the E2E Postgres container so it doesn't linger between runs.
 *
 * Skipped in CI because the Postgres service container is managed by the runner.
 */
export default function globalTeardown(): void {
  if (process.env.CI) return;

  console.log('\n[e2e] Stopping E2E Postgres container…');
  execFileSync(
    'docker',
    ['compose', '-f', 'docker-compose.e2e.yml', 'down'],
    { cwd: path.resolve('.'), stdio: 'inherit' },
  );
  console.log('[e2e] Container stopped.\n');
}
