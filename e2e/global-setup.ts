import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Playwright global setup — runs once before any project or webServer starts.
 *
 * Steps:
 *  1. Ensure e2e/.auth/ exists for storage-state files.
 *  2. Start (or reuse) the E2E Postgres container via Docker Compose.
 *     `--wait` blocks until the postgres healthcheck passes.
 *  3. Generate an APP_KEY for the testing environment.
 *  4. Drop and recreate all tables in furlogs_e2e, then seed baseline data.
 */
export default function globalSetup(): void {
  const root = path.resolve('.');
  const serverDir = path.resolve('apps/server');
  const opts = { cwd: serverDir, stdio: 'inherit' as const };

  // 1. Guarantee the auth-state directory exists.
  mkdirSync('e2e/.auth', { recursive: true });

  // 2. Start Postgres container and wait for it to be healthy.
  console.log('\n[e2e] Starting E2E Postgres container…');
  execFileSync(
    'docker',
    ['compose', '-f', 'docker-compose.e2e.yml', 'up', '-d', '--wait'],
    { cwd: root, stdio: 'inherit' },
  );
  console.log('[e2e] Postgres ready.');

  // 3. Generate APP_KEY for the testing env.
  console.log('[e2e] Generating testing APP_KEY…');
  execFileSync('php', ['artisan', 'key:generate', '--env=testing', '--force', '--no-ansi'], opts);

  // 4. Reset and seed the E2E database.
  console.log('[e2e] Running migrate:fresh --seed on furlogs_e2e…');
  execFileSync(
    'php',
    ['artisan', 'migrate:fresh', '--seed', '--env=testing', '--force', '--no-ansi'],
    opts,
  );

  console.log('[e2e] Database ready.\n');
}
