import type { APIRequestContext } from '@playwright/test';

export const API_URL = 'http://localhost:8000';
export const APP_URL = 'http://localhost:3000';

/**
 * Performs a full Sanctum SPA login via the API request context.
 * Useful in tests that need to set up a second user session or verify
 * auth state without going through the UI.
 *
 * The request context automatically stores the returned session cookie
 * and XSRF token for subsequent API calls made via the same context.
 */
export async function loginViaApi(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<void> {
  // Fetch CSRF cookie — stores XSRF-TOKEN in the request context's cookie jar.
  await request.get(`${API_URL}/sanctum/csrf-cookie`, {
    headers: { Origin: APP_URL, Referer: `${APP_URL}/` },
  });

  const storage = await request.storageState();
  const xsrfToken = decodeURIComponent(
    storage.cookies.find(c => c.name === 'XSRF-TOKEN')?.value ?? '',
  );

  const res = await request.post(`${API_URL}/api/auth/login`, {
    headers: {
      'X-XSRF-TOKEN': xsrfToken,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Origin: APP_URL,
      Referer: `${APP_URL}/`,
    },
    data: { email, password },
  });

  if (!res.ok()) {
    throw new Error(`[loginViaApi] Login failed: ${res.status()} ${await res.text()}`);
  }
}

/**
 * Returns today's date formatted as YYYY-MM-DD (value expected by <input type="date">).
 */
export function today(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Returns a future date offset by `days` from today, formatted as YYYY-MM-DD.
 */
export function futureDate(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().split('T')[0];
}
