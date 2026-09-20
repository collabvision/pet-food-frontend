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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api/v1';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

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
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        const body = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            body?.message || 'Refresh token is invalid'
          );
        }

        const token = body?.data?.accessToken;

        if (!token) {
          throw new Error('No access token returned');
        }

        accessToken = token;

        return token;
      })
      .catch((error) => {
        accessToken = null;
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function request(
  path,
  {
    method = 'GET',
    body,
    headers = {},
    auth = true,
    isForm = false,
    skipRefresh = false,
  } = {}
) {
  const url = `${API_URL}${path}`;

  const doFetch = async () => {
    const finalHeaders = {
      ...headers,
    };

    if (!isForm) {
      finalHeaders['Content-Type'] = 'application/json';
    }

    if (auth && accessToken) {
      finalHeaders['Authorization'] =
        `Bearer ${accessToken}`;
    }

    console.log(
      `[API] ${method} ${url}`,
      {
        auth,
        body: body ?? null,
      }
    );

    return fetch(url, {
      method,
      headers: finalHeaders,
      credentials: 'include',
      body:
        body === undefined
          ? undefined
          : isForm
            ? body
            : JSON.stringify(body),
    });
  };

  let res = await doFetch();

  /*
   * If access token expired:
   *
   * 401
   * ↓
   * refresh using HttpOnly cookie
   * ↓
   * retry original request once
   */
  if (
    res.status === 401 &&
    auth &&
    !skipRefresh &&
    path !== '/auth/refresh'
  ) {
    try {
      await refreshAccessToken();

      res = await doFetch();
    } catch {
      accessToken = null;
      onUnauthorized();

      throw new ApiError(
        'Your session has expired. Please log in again.',
        401
      );
    }
  }

  const contentType =
    res.headers.get('content-type') || '';

  const payload =
    contentType.includes('application/json')
      ? await res.json().catch(() => null)
      : null;

  if (!res.ok) {
    if (res.status === 401 && auth) {
      onUnauthorized();
    }

    const message =
      payload?.message ||
      genericMessageFor(res.status);

    console.error(
      `[API] ${method} ${url} → ${res.status}`,
      payload
    );

    throw new ApiError(
      message,
      res.status,
      payload?.details
    );
  }

  console.log(
    `[API] ${method} ${url} → ${res.status}`,
    payload
  );

  return payload;
}

function genericMessageFor(status) {
  if (status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  if (status >= 500) {
    return 'Something went wrong on our end. Please try again shortly.';
  }

  if (status === 404) {
    return 'We could not find what you were looking for.';
  }

  if (status === 403) {
    return "You don't have permission to do that.";
  }

  return 'Something went wrong. Please check your input and try again.';
}

export const api = {
  get: (path, opts) =>
    request(path, {
      ...opts,
      method: 'GET',
    }),

  post: (path, body, opts) =>
    request(path, {
      ...opts,
      method: 'POST',
      body,
    }),

  patch: (path, body, opts) =>
    request(path, {
      ...opts,
      method: 'PATCH',
      body,
    }),

  delete: (path, opts) =>
    request(path, {
      ...opts,
      method: 'DELETE',
    }),

  postForm: (path, formData, opts) =>
    request(path, {
      ...opts,
      method: 'POST',
      body: formData,
      isForm: true,
    }),
};

export { API_URL };
