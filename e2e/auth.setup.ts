import { expect, test as setup } from '@playwright/test';
import path from 'node:path';

/**
 * Where Playwright will persist the authenticated browser storage state
 * (session cookies + XSRF token) so that every test in the `authenticated`
 * project starts pre-logged-in without repeating the login flow.
 */
const AUTH_FILE = path.join('e2e', '.auth', 'user.json');

const API_URL = 'http://localhost:8000';
const APP_URL = 'http://localhost:3000';

/**
 * Auth setup — runs once per test run, before authenticated specs.
 *
 * Flow:
 *  1. Fetch /sanctum/csrf-cookie  →  backend sets XSRF-TOKEN cookie.
 *  2. Extract XSRF-TOKEN value from the request context's cookie jar.
 *  3. POST /api/auth/login with the token in the X-XSRF-TOKEN header.
 *  4. Persist all cookies to e2e/.auth/user.json.
 *
 * The saved storage state is automatically injected into every browser
 * context in the `authenticated` project via playwright.config.ts.
 */
setup('create authenticated session for dev user', async ({ request }) => {
  // Step 1 — Acquire CSRF cookie.
  // The backend reads Referer/Origin to decide whether to allow stateful auth.
  await request.get(`${API_URL}/sanctum/csrf-cookie`, {
    headers: {
      Origin: APP_URL,
      Referer: `${APP_URL}/`,
    },
  });

  // Step 2 — Extract the XSRF-TOKEN value set by the above response.
  const storageState = await request.storageState();
  const xsrfCookie = storageState.cookies.find(c => c.name === 'XSRF-TOKEN');
  const xsrfToken = decodeURIComponent(xsrfCookie?.value ?? '');

  if (!xsrfToken) {
    throw new Error(
      '[auth.setup] XSRF-TOKEN cookie not found. ' +
        'Ensure the Laravel server is running with --env=testing.',
    );
  }

  // Step 3 — Login as the seeded dev user.
  const loginResponse = await request.post(`${API_URL}/api/auth/login`, {
    headers: {
      'X-XSRF-TOKEN': xsrfToken,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Origin: APP_URL,
      Referer: `${APP_URL}/`,
    },
    data: {
      email: 'dev@furlogs.test',
      password: 'password',
    },
  });

  expect(
    loginResponse.ok(),
    `Login failed (${loginResponse.status()}): ${await loginResponse.text()}`,
  ).toBeTruthy();

  // Step 4 — Persist cookies so that authenticated projects can reuse this session.
  await request.storageState({ path: AUTH_FILE });
});
