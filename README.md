# FurNest — Next.js Frontend (PWA)

Next.js 14 (App Router) frontend for the FurNest MERN e-commerce backend. Ships as an installable PWA and includes the **Home** page, **Products** listing page (filters, sort, pagination), and the full **auth flow** (register, verify email, login, forgot/reset password), all wired to the Express API described in the master prompt / API docs you provided.

## Getting started

```bash
npm install
cp .env.example .env.local   # then edit NEXT_PUBLIC_API_URL if needed
npm run dev                  # http://localhost:3000
```

Build for production:

```bash
npm run build
npm start
```

## Project layout

```
app/
  layout.js              Root layout: fonts, AuthProvider, header/footer, PWA meta
  page.js                Home page (Server Component, fetches categories + featured products)
  products/page.js       Products listing (Server Component, reads ?filters from the URL)
  login/page.js           }
  register/page.js        }
  verify-email/page.js    }  Client Components, all call the real API through lib/auth-context.js
  forgot-password/page.js }
  reset-password/page.js  }
components/               UI building blocks (header, footer, product card, filters, auth widgets)
lib/
  api.js                  Secure fetch client (in-memory access token, cookie-based refresh)
  auth-context.js         React auth context/provider consumed by every page
  validation.js           zod schemas mirroring backend validation (client-side UX only)
  products.js             Server-side fetchers for the public /products, /categories endpoints
middleware.js             Edge middleware: redirects signed-in users away from auth pages
public/manifest.json      PWA manifest
public/sw.js              Service worker (caches the app shell only — never /api/*)
```

## Backend cookie contract (required for auth to work)

This frontend assumes the backend follows the JWT access/refresh pattern from the master prompt, with **one addition**: the refresh token must be delivered as an httpOnly cookie, not in the JSON response body. Concretely, `POST /auth/login`, `POST /auth/register` (post-verification, if it auto-logs in) and `POST /auth/refresh` should:

- Set a cookie (default name `refreshToken`, configurable via `REFRESH_COOKIE_NAME`) with:
  - `httpOnly: true`
  - `secure: true` in production
  - `sameSite: 'lax'` (or `'strict'` if you don't need cross-site redirects into login)
  - `path: '/api/v1/auth'` (or `/`, if `/auth/logout` needs to clear it)
- Return the **access token only** in the JSON body: `{ "data": { "accessToken": "...", "user": {...} } }`
- `POST /auth/logout` should clear that cookie.
- CORS must allow the frontend origin with `credentials: true` (`Access-Control-Allow-Credentials: true`, and an explicit `Access-Control-Allow-Origin`, not `*`).

If your backend instead returns the refresh token in the JSON body, **do not store it in localStorage** — that reopens the XSS risk this design avoids. Either add the cookie behavior above, or tell me and I'll adapt the client to a different rotation strategy (e.g. refresh token kept only in a dedicated, `Secure` cookie you set from an API route).

## Security decisions baked into this frontend

- **Access token**: kept only in memory (`lib/api.js` module state), never in `localStorage`/`sessionStorage`. A page refresh silently re-derives it from the httpOnly refresh cookie (`AuthProvider`'s bootstrap effect).
- **Refresh token**: never touched by JavaScript; the browser sends it automatically via `credentials: 'include'`.
- **Single-flight refresh**: concurrent 401s coalesce into one `/auth/refresh` call, retried once — no infinite refresh loops.
- **Content-Security-Policy** and other security headers (`next.config.js`) restrict script/style/connect sources, disable framing, and only allow API calls to `NEXT_PUBLIC_API_URL`'s origin plus Cloudinary for images.
- **No enumeration on forgot-password**: the UI shows the same generic message whether or not the email is registered, regardless of the backend's specific response — only genuine rate-limit errors are surfaced differently.
- **Client-side validation (`lib/validation.js`)** mirrors backend rules for fast feedback but is explicitly documented as *not* a security boundary — the backend must re-validate everything, per the master prompt's rules on trusting the client.
- **Service worker** only caches the static app shell (`public/sw.js`); it explicitly bypasses `/api/*` so nothing auth- or order-related is ever cached or served stale/offline.
- **Autocomplete attributes** (`email`, `current-password`, `new-password`, `one-time-code`) are set correctly so password managers behave and browsers don't mis-fill sensitive fields.
- **Generic error copy**: `lib/api.js` maps 4xx/5xx statuses to safe, non-leaky messages when the backend doesn't provide one; stack traces are never rendered.
- Security headers, HSTS, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff` are set for every response via `next.config.js`.

## API integration notes

- `lib/products.js` calls the **public** `GET /products` and `GET /categories` endpoints server-side (Server Components), so there's zero client-side exposure of API internals and the page still renders (with clearly-labeled fallback content) if the backend is unreachable — useful while you build modules incrementally per the master prompt's workflow.
- The products page reads filters from the URL (`?petType=`, `?brand=`, `?minPrice=`, `?maxPrice=`, `?type=`, `?special=`, `?minRating=`, `?sort=`, `?page=`) so filters are shareable/bookmarkable and the heavy lifting (actual filtering/sorting/pagination) happens on the backend, not by trusting anything computed in the browser.
- Auth pages call `lib/auth-context.js`, which wraps `POST /auth/register`, `/verify-email`, `/resend-verification`, `/login`, `/forgot-password`, `/reset-password`, `/logout`, and `/refresh` + `GET /auth/me` exactly as documented.

## PWA

- `public/manifest.json` + `app/layout.js` metadata make the app installable.
- `public/sw.js` is registered from `components/ServiceWorkerRegister.js` after `load`, so it never competes with first paint, and fails silently if unsupported.
- **Add real icons** at `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-192.png`, `icon-maskable-512.png` before shipping — placeholders are referenced in the manifest but not included here.
- `public/offline.html` is the fallback shown for a failed navigation while offline.

## What's not included yet

This delivers the two requested pages plus the full auth flow. Cart, checkout, orders, prescriptions, and admin screens aren't built yet — `lib/api.js` and `lib/auth-context.js` are written so those can reuse the same secure client (e.g. `api.get('/cart')`, `api.post('/orders', payload)`) without any new plumbing.
