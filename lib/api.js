/**
 * Secure API client for the FurNest backend.
 *
 * Security model (read before changing):
 * 1. The JWT ACCESS token lives only in JS memory (see auth-context.js). It is
 *    NEVER written to localStorage/sessionStorage, so a successful XSS can't
 *    trivially steal a long-lived credential by reading storage.
 * 2. The JWT REFRESH token is never seen by JavaScript at all. The backend
 *    must set it as an httpOnly, Secure, SameSite=Lax (or Strict) cookie on
 *    /auth/login and /auth/refresh. This client always sends
 *    `credentials: 'include'` so that cookie rides along automatically.
 * 3. On a 401 from a protected call, we attempt exactly one silent refresh
 *    (POST /auth/refresh) and retry the original request once. If the
 *    refresh also fails, we clear in-memory state and surface the 401 so the
 *    UI can redirect to /login. This avoids infinite refresh loops.
 * 4. All error messages shown to users are generic/backend-provided; we never
 *    print stack traces or raw fetch errors.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Set by AuthProvider so this module can read/update the in-memory token
// without importing React here (keeps this file framework-agnostic/testable).
let accessToken = null;
let onUnauthorized = () => {};

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

let refreshPromise = null;

async function refreshAccessToken() {
  // Coalesce concurrent refresh attempts into a single network call.
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('refresh-failed');
        const body = await res.json();
        const token = body?.data?.accessToken;
        if (!token) throw new Error('refresh-failed');
        accessToken = token;
        return token;
      })
      .catch((err) => {
        accessToken = null;
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * Core request helper.
 * @param {string} path e.g. '/products'
 * @param {object} options fetch-style options plus { auth: boolean, skipRefresh: boolean }
 */
async function request(path, { method = 'GET', body, headers = {}, auth = true, isForm = false, skipRefresh = false } = {}) {
  const url = `${API_URL}${path}`;

  const doFetch = async () => {
    const finalHeaders = { ...headers };
    if (!isForm) finalHeaders['Content-Type'] = 'application/json';
    if (auth && accessToken) finalHeaders['Authorization'] = `Bearer ${accessToken}`;

    // 🔍 API Call Logger — visible in browser DevTools Console
    console.log(`%c[API] ${method} ${url}`, 'color: #3B82F6; font-weight: bold;', {
      auth,
      body: body ?? null,
    });

    return fetch(url, {
      method,
      headers: finalHeaders,
      credentials: 'include', // send the httpOnly refresh cookie
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  };

  let res = await doFetch();

  // One silent refresh-and-retry on auth failure, never a loop.
  if (res.status === 401 && auth && !skipRefresh) {
    try {
      await refreshAccessToken();
      res = await doFetch();
    } catch {
      onUnauthorized();
      throw new ApiError('Your session has expired. Please log in again.', 401);
    }
  }

  const contentType = res.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    if (res.status === 401 && auth) onUnauthorized();
    const message = payload?.message || genericMessageFor(res.status);
    console.error(`%c[API] ❌ ${method} ${url} → ${res.status}`, 'color: #EF4444; font-weight: bold;', payload);
    throw new ApiError(message, res.status, payload?.details);
  }

  console.log(`%c[API] ✅ ${method} ${url} → ${res.status}`, 'color: #10B981; font-weight: bold;', payload);
  return payload;
}

function genericMessageFor(status) {
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (status >= 500) return 'Something went wrong on our end. Please try again shortly.';
  if (status === 404) return 'We could not find what you were looking for.';
  if (status === 403) return "You don't have permission to do that.";
  return 'Something went wrong. Please check your input and try again.';
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
  postForm: (path, formData, opts) => request(path, { ...opts, method: 'POST', body: formData, isForm: true }),
};

export { API_URL };
