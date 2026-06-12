# BACKEND

**This template has no backend.** It is a Vue 3 single-page application built and served as static files — there is no Node server, no database, no auth backend in this repo.

This document records that fact deliberately so future contributors don't go hunting for an `api/` directory that doesn't exist, and lays out the **default patterns** to follow when a backend (or backend integration) is eventually added.

For the frontend stack see [FRONTEND.md](FRONTEND.md). For project-wide code style see [CODING_STANDARDS.md](CODING_STANDARDS.md). For visual design tokens see [DESIGN.md](DESIGN.md).

---

## 1. Current state

| Concern              | State                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| Server               | **None.** Vite serves `src/` in dev; `npm run build` emits static files to `dist/`.                    |
| Database             | **None.**                                                                                              |
| Auth                 | **None.**                                                                                              |
| HTTP client          | **None wired.** No `fetch` wrapper, no `axios` / `ofetch` dependency.                                  |
| API routes / handlers | **None.**                                                                                              |
| Background jobs      | **None.**                                                                                              |

This template is an SPA shell — it's appropriate for static sites, marketing pages, dashboards that consume a separate API, or as the starting point for a Vue frontend in a polyrepo where the backend lives somewhere else.

If the project needs server-rendered pages, server-side data fetching with HTTP cache hints, or middleware close to the routes, **migrate to Nuxt** rather than bolting a server onto Vite — Nuxt is what the Vue ecosystem expects for SSR.

---

## 2. When a backend (or API integration) is added

Three plausible directions; pick deliberately and document the choice here once made.

### 2.1 Separate backend service, this repo stays SPA-only

The most common path. The backend is a separate repository (any stack — Node / Python / Go / Rust). This SPA calls it over HTTPS.

What lands in this repo:

- **HTTP client wrapper.** Wrap `fetch` (or `ofetch`) in a composable like `useApi()` so the base URL, auth header, and error handling live in one place. Don't sprinkle raw `fetch` across components.
- **API base URL via env var.** `VITE_API_BASE_URL` in `.env.example`. Document it. Default to a sensible value for local dev (`http://localhost:8000`, etc.).
- **CORS posture.** The backend must allow this SPA's origin(s) in `Access-Control-Allow-Origin`. Document the expected list (dev, staging, prod) in the backend repo's README.
- **Auth handoff.** Decide: cookie-based session (requires `credentials: "include"` on every fetch + correct CORS), or bearer token (stored where — memory, sessionStorage, localStorage? Each has a tradeoff; see [SECURITY.md §3](SECURITY.md)).
- **Error normalization.** Map backend error shapes to a normalized `{ code, message }` so views don't branch on backend-specific status codes.

### 2.2 Vite middleware (dev-only convenience)

Vite supports custom middleware via the `configureServer` hook. Useful for **dev-time stubs** (returning fixture JSON for an endpoint the real backend doesn't expose yet) — never for production.

When the same endpoint exists in dev (middleware) and prod (real backend), keep request/response shapes byte-identical or you'll ship bugs that only surface in production.

### 2.3 Migrate to Nuxt for SSR / SSG / hybrid

If the product needs server-rendered pages (SEO-critical content, personalized first paint, edge rendering), evaluate Nuxt rather than gluing an Express server onto Vite. Nuxt gives you:

- File-based routing + automatic `<RouterLink>` integration.
- Server routes (`server/api/`) for backend logic colocated with the frontend.
- SSR / SSG / hybrid rendering out of the box.
- A `useFetch` composable with built-in server / client caching.

The migration is non-trivial — file layout, routing, build commands all change. **Migrate before scale, not after**, because retrofitting SSR is harder than starting with it.

---

## 3. Default patterns when an API is wired

These are **defaults for new projects**, not descriptions of existing code. Adopt them at the point of integration; document deviations.

### 3.0 Where API code lives

The template pre-creates [src/services/](../src/services/) as the home for non-reactive API clients, external SDK wrappers, and business logic that does not return Vue refs. It's currently empty (git will not track the directory until the first file lands — see [CODING_STANDARDS.md §3](CODING_STANDARDS.md)).

The split:

- **`src/services/`** — `apiClient.js` (the raw `fetch` wrapper), `stripeClient.js`, `analyticsService.js`. Plain modules; return Promises or values; no `ref` / `computed`.
- **`src/composables/`** (not yet created — add when first composable lands) — `useApi.js`, `useProducts.js`. Vue-aware; return reactive state; orchestrate calls to services.
- **`src/utilities/`** — pure stateless helpers (`formatPrice.js`, `validators.js`). No I/O.

See [FRONTEND.md §10](FRONTEND.md) for the full decision matrix.

### 3.1 `apiClient` service and `useApi()` composable

The service owns the transport; the composable owns the Vue-reactive surface.

```js
// src/services/apiClient.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export async function request(path, options = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });
    if (!response.ok) {
        throw new ApiError(response.status, await response.text());
    }
    return response.status === 204 ? null : response.json();
}
```

```js
// src/composables/useApi.js
import { ref } from "vue";
import { request } from "@/services/apiClient";

export function useApi() {
    const isLoading = ref(false);
    const error = ref(null);

    async function call(path, options) {
        isLoading.value = true;
        error.value = null;
        try {
            return await request(path, options);
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            isLoading.value = false;
        }
    }
    return { call, isLoading, error };
}
```

Rules:

- **One client per app.** Don't `new` it; export functions from the service module.
- **Errors throw.** Don't return `{ data, error }` tuples from services — Vue's `try`/`catch` handles flow control fine, and the composable wraps the throw in reactive `error` state for templates that want it.
- **No retry magic by default.** Retries belong at the call site (the user clicks "try again") unless the endpoint is idempotent and the project explicitly opts in.

### 3.2 Auth token handling

If using bearer tokens:

- Store in **memory** for short-lived tokens that refresh; in **`sessionStorage`** if they must survive a refresh; in **`localStorage`** only after considering the XSS exposure (an XSS vuln lifts the token). See [SECURITY.md §3](SECURITY.md).
- **Never** put tokens in `VITE_*` env vars — those are baked into the bundle.
- Attach via the `useApi()` composable's headers, read from a Pinia auth store.

If using cookie sessions:

- The backend sets `HttpOnly; Secure; SameSite=Lax` (or `Strict`) cookies.
- `credentials: "include"` on every `fetch`; CORS must allow credentials.
- CSRF protection becomes the backend's job; the SPA forwards a CSRF token header on state-changing requests.

### 3.3 Data fetching in views

The minimal pattern (no extra library):

```vue
<script setup>
import { ref, onMounted } from "vue";
import { useApi } from "@/composables/useApi";

const { request } = useApi();
const products = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
    try {
        products.value = await request("/products");
    } catch (err) {
        error.value = err;
    } finally {
        loading.value = false;
    }
});
</script>
```

When this pattern repeats across views (it will), promote to a `useResource(path)` composable, or adopt **VueQuery** (`@tanstack/vue-query`) for caching, retries, optimistic updates, and request deduplication. VueQuery is the default if data fetching grows complex.

### 3.4 Mocking in tests

[Vitest](../vitest.config.js) runs in `jsdom` — `fetch` is available but there's no real backend. Stub at the **service boundary** (preferred — the composable's reactive wrapper still exercises in the test), not at `global.fetch`:

```js
import { vi } from "vitest";
import * as apiClient from "@/services/apiClient";

vi.spyOn(apiClient, "request").mockResolvedValue([{ id: 1, name: "Mock" }]);
```

For tests that exercise only the view (and not the data fetch), you can stub the composable boundary instead:

```js
import * as useApiModule from "@/composables/useApi";

vi.spyOn(useApiModule, "useApi").mockReturnValue({
    call: vi.fn().mockResolvedValue([{ id: 1, name: "Mock" }]),
    isLoading: ref(false),
    error: ref(null),
});
```

If MSW (`msw`) is adopted for higher-fidelity mocking (network-level rather than module-boundary), document the setup here.

---

## 4. Deployment

Because the build output is static files, deployment is whatever static-host platform fits:

- **Vercel** — drops a `vercel.json` into the repo; SPA fallback is one line.
- **Netlify** — `netlify.toml` with a `[[redirects]]` rule for the SPA fallback.
- **GitHub Pages** — set `base` in [vite.config.js](../vite.config.js) to the project subpath; CI runs `npm run build` and pushes `dist/` to the `gh-pages` branch.
- **Cloudflare Pages / S3 + CloudFront / Bunny** — any static-asset host works.

### SPA fallback

For routes that aren't index (`/products/abc-123`), the host must return `index.html` so Vue Router can resolve client-side. Without it, a refresh on a non-root route 404s.

Platform-specific syntax differs; document the chosen host's config here once a deploy lands.

### Base path

[src/router/index.js](../src/router/index.js) uses `createWebHistory(import.meta.env.BASE_URL)` — set `base` in [vite.config.js](../vite.config.js) when deploying to a subpath. Default is `/`.

---

## 5. Conventions cheat-sheet

Quick reference — keep this short until a backend lands.

- This template has **no backend**. If you're looking for an `api/` directory, it doesn't exist.
- When a backend is added: an `apiClient` service in [src/services/](../src/services/) owns the `fetch` wrapper; a `useApi()` composable in `src/composables/` (create when needed) wraps it for reactive views; base URL via `VITE_API_BASE_URL`; errors throw.
- [src/services/](../src/services/) is pre-created and empty — `.gitkeep` it if you want the structure to land on day-one clones.
- Vite middleware is fine for dev stubs but **never** for production logic.
- If SSR is needed, migrate to Nuxt; don't bolt a Node server onto Vite.
- Static deployment requires an SPA fallback rule on the host so non-root routes don't 404 on refresh.
- Tokens never go in `VITE_*` env vars (those are public).
- Update this doc the moment the first API call is wired — current state in §1 should never lie.
