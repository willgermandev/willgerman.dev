# SECURITY

Security baseline for this Vue 3 SPA template. A single-page app has a **different threat model** than a traditional server-rendered app — the bundle is public, every line of JS the browser runs is shipped to every user, and the only "server" is whatever static-asset host serves `dist/`.

This document is **prescriptive for a fresh template**: each section establishes the default posture a new project inherits, plus the items that must be wired before the first production deploy.

For the frontend stack see [FRONTEND.md](FRONTEND.md). For (currently absent) backend conventions when an API is added see [BACKEND.md](BACKEND.md). For project-wide code style see [CODING_STANDARDS.md](CODING_STANDARDS.md). For accessibility (overlaps with security in error UX and session timeouts) see [ACCESSIBILITY.md](ACCESSIBILITY.md).

Each item below is tagged:

- **IMPLEMENTED** — the control is active in this template today.
- **PARTIAL** — the scaffolding is present but configuration / wiring is incomplete.
- **NOT YET** — neither the dependency nor configuration exists.

Treat anything not marked **IMPLEMENTED** as a blocker for the first staging/production deploy.

---

## 1. SPA threat model

What's different about a Vue SPA compared to a server-rendered app:

- **The bundle is public.** Every line of JS in `dist/assets/*.js` is delivered to every visitor. Anything embedded in the bundle — env vars, comments, API URLs — is readable. Treat the bundle as a published document, not a private deployable.
- **Secrets cannot live in the frontend.** `VITE_*` env vars are baked into the bundle at build time. There is no way to ship a secret to authenticated users only.
- **XSS is the dominant risk.** Without an auto-escaping template engine (Django, Rails), the project's own discipline around `v-html`, third-party widget injection, and DOM manipulation is the only XSS defense.
- **Supply chain is the next-biggest risk.** A compromised npm dependency runs in the user's browser with full app permissions — exfiltrating tokens, modifying the DOM, injecting CSS keyloggers. Pin, audit, and scan.
- **CSP is the safety net** — when XSS *does* slip through, a strict CSP keeps the attacker from monetizing it.
- **CSRF is the backend's problem** (when one exists). The SPA's only role is to send credentials / tokens correctly.

---

## 2. Build & bundle hygiene

### 2.1 Production builds are clean

**Status: PARTIAL** (depends on what gets added).

`npm run build` produces `dist/` — what ships to the public. Audit it before deploy:

- **Source maps**: by default, Vite emits source maps in production. Decide deliberately — they help debugging in production, but they also expose the original source. For a closed-source product, set `build.sourcemap: false` in [vite.config.js](../vite.config.js); for OSS, leaving them on is fine.
- **`console.log`** statements compile through. Strip them (Vite's `esbuild.drop: ["console", "debugger"]` in [vite.config.js](../vite.config.js)) before production deploy.
- **Comments**: minification strips most; verify none of the few that survive contain TODOs / FIXMEs / employee names / internal URLs.
- **No tracked-but-generated files.** This template doesn't commit `dist/`; if a future setup does, it'd be a leak risk every time the build runs.

### 2.2 Subresource Integrity (SRI)

**Status: NOT YET** — applicable only when third-party scripts/styles are loaded from a CDN. For first-party Vite bundles hashed at build time, file integrity is already implied by the URL.

If any future asset is loaded from a third-party CDN (analytics, embedded widget, font), add `integrity="sha384-…" crossorigin="anonymous"` to the tag.

### 2.3 Environment variable hygiene

**Status: PARTIAL.** [.gitignore](../.gitignore) excludes `.env*` (verify), but the discipline below is project-level.

Rules:

- **Only `VITE_*` vars are exposed to the client bundle.** Everything else is dev-tooling only.
- **`VITE_*` vars are public.** API base URLs, public keys, feature flags — fine. Tokens, secrets, private keys — never.
- **`.env.example` is committed without values.** Document every `VITE_*` var with a one-line comment.
- **`.env`, `.env.local`, `.env.*.local`** stay gitignored — see [GIT.md §9](GIT.md).
- **Build-time vs. run-time.** `import.meta.env.VITE_*` is replaced at **build time** by Vite. A production build baked at 9am with `VITE_API_BASE_URL=https://api.example.com` will always call that URL; you cannot change it via runtime env. If the same bundle deploys to multiple environments, use a runtime-config endpoint instead (e.g. fetch `/config.json` from the host).

---

## 3. XSS prevention

### 3.1 Vue's default escaping

**Status: IMPLEMENTED.** Vue's template syntax (`{{ … }}`, `:attr="…"`) escapes by default. This is the project's primary XSS defense — don't bypass it.

### 3.2 `v-html` — the project's biggest XSS risk

**Status: PROJECT POLICY** — must be enforced in code review.

`v-html` renders raw HTML and **bypasses Vue's escaping**. Rules:

- **Never `v-html` user-controlled content.** Profile bios, comments, form input — even after a "sanitize" pass on the backend — never go through `v-html` directly. Render as text.
- **Trusted, statically-known HTML only.** Marketing copy authored by the team, server-rendered legal text, content from a trusted CMS where editorial controls exist.
- **When trusted-but-rich content must render** (a CMS body, a markdown render), sanitize at render time with **`DOMPurify`** (`npm install dompurify`):

    ```vue
    <script setup>
    import DOMPurify from "dompurify";
    const html = computed(() => DOMPurify.sanitize(props.rawHtml));
    </script>
    <template>
        <div v-html="html" />
    </template>
    ```

- **`DOMPurify` config defaults are safe.** Don't loosen them (`ADD_TAGS`, `ALLOW_DATA_ATTR`) without a specific reason and a comment explaining why.

Add an ESLint rule (`vue/no-v-html`) once ESLint is wired to fail any unconditional `v-html` and require a comment with justification.

### 3.3 Dynamic `:href` and `:src`

`javascript:` URLs in `<a :href="…">` execute as scripts when clicked. Vue does **not** strip these automatically.

Pattern:

```js
function safeHref(url) {
    try {
        const parsed = new URL(url, window.location.origin);
        return ["https:", "http:", "mailto:"].includes(parsed.protocol) ? url : "#";
    } catch {
        return "#";
    }
}
```

Same applies to `:src` on `<img>` (data URLs to track) and `<iframe>` (`javascript:` URLs).

### 3.4 Third-party widgets and embeds

Treat every embedded `<iframe>` (YouTube, Stripe Elements, Calendly) as a trust boundary:

- **`sandbox` attribute** on iframes you don't fully trust.
- **`allow` attribute** to restrict feature-policy access (camera, microphone, geolocation, etc.).
- **`referrerpolicy="no-referrer"`** on third-party content you don't want to leak the host page URL to.

### 3.5 DOM-based XSS

Direct DOM access (`document.write`, `innerHTML =`, `eval()`, `setTimeout(string, …)`, `setInterval(string, …)`) is **forbidden** in this project. Use Vue's reactivity instead. Add the ESLint rule `no-eval` and equivalents when ESLint lands.

---

## 4. Content Security Policy (CSP)

**Status: NOT YET.** No CSP header is configured.

CSP is set by the **hosting host's response headers**, not the SPA bundle. For each deployment target:

- **Vercel / Netlify / Cloudflare Pages** — declare via config file (`vercel.json` `headers`, `_headers`, `netlify.toml` `[[headers]]`).
- **S3 + CloudFront** — Lambda@Edge or response header policy.
- **Generic reverse proxy** — Nginx `add_header`, Caddy `header`, etc.

### Recommended starting policy (tune per project)

```
Content-Security-Policy:
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://api.example.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    object-src 'none';
```

Notes:

- **`'unsafe-inline'` on `style-src`** is required for Vue's `<style scoped>` — these inject as `<style>` tags at runtime. Document the tradeoff.
- **Avoid `'unsafe-inline'` on `script-src`.** If inline scripts ever sneak in (third-party widget, dev artifact), use a nonce (`'nonce-…'`) or hash (`'sha256-…'`) instead.
- **`connect-src`** must list every API origin the SPA hits. Forget one → silent broken feature in production.
- **`frame-ancestors 'none'`** is the modern replacement for `X-Frame-Options: DENY` and prevents clickjacking embeds.
- **Report violations** during rollout: `Content-Security-Policy-Report-Only` first (with `report-uri` / `report-to`) so you catch breakage without breaking users.

---

## 5. Authentication & token storage

**Status: NOT YET** — no auth wired (no backend in this template).

When auth lands, the SPA holds the credential that proves identity. **Where** matters:

| Storage location          | Survives refresh | XSS exposure                            | Use when                                       |
| ------------------------- | ---------------- | --------------------------------------- | ---------------------------------------------- |
| In-memory (Pinia ref)     | No               | Low — XSS lifts it but it dies on reload | Short-lived access tokens that refresh         |
| `sessionStorage`          | Yes (per tab)    | Medium — readable by any script           | Tokens scoped to a single tab session         |
| `localStorage`            | Yes              | **High** — readable by any script        | Avoid for tokens; OK for non-sensitive prefs   |
| `HttpOnly` cookie         | Yes              | None to JS                              | **Strongly preferred** for session tokens      |

### 5.1 Cookie sessions are the safer default

When the backend sets a session cookie:

- **`HttpOnly`** — JS can't read it; XSS can't lift it.
- **`Secure`** — only sent over HTTPS.
- **`SameSite=Lax`** (or `Strict` if no cross-site OAuth flows).
- The SPA sends `credentials: "include"` on every `fetch`; CORS on the backend must allow credentials.
- **CSRF protection becomes the backend's job.** The SPA forwards a CSRF token header on state-changing requests (e.g. `X-CSRF-Token`).

### 5.2 Bearer tokens

If using bearer tokens (REST APIs, mobile-shared backends):

- **Short-lived access tokens (~15min)** in memory; refresh from a long-lived refresh token in an `HttpOnly` cookie.
- **Never `localStorage`** for refresh tokens — an XSS gets persistent account takeover.
- Attach via the `useApi()` composable's headers, sourced from a Pinia auth store.

### 5.3 OAuth / OIDC

For social login (Google, GitHub, etc.), use the **authorization code flow with PKCE** — never the implicit flow (deprecated). Libraries that handle this correctly: `oidc-client-ts`, `@auth0/auth0-vue`. Roll your own only with a security review.

---

## 6. Dependency supply chain

The biggest non-XSS risk in a modern SPA. Every npm install pulls dozens of transitive packages that ship code to your users.

### 6.1 Lockfile committed

**Status: IMPLEMENTED.** [package-lock.json](../package-lock.json) is committed.

Run `npm ci` (not `npm install`) in CI for reproducible installs.

### 6.2 Dependency auditing

**Status: NOT YET.**

- **`npm audit`** on every PR; fail on HIGH / CRITICAL. (Beware false-positive noise — adopt judgment, not blind blocking.)
- **Dependabot** (free for public repos on GitHub) or **Renovate** to PR security updates automatically.
- **Snyk** / **Socket.dev** for richer analysis (malicious-package detection, license scanning).

### 6.3 SBOM

**Status: NOT YET.**

Generate a CycloneDX / SPDX SBOM on each build (`npm sbom --format=cyclonedx` is available in npm 10+) and store it with the release artifact for supply-chain traceability.

### 6.4 Selective dependencies

- **Prefer no dependency** over a trivial one (`is-odd`, `left-pad` style packages). Each dep is a trust delegation.
- **Audit before adding.** Open the package on npm: download count, last update, maintainer, dep tree depth. A single-maintainer package with 50k weekly downloads is a tempting hijack target.
- **Pin major versions** in `package.json` (`^` is fine for the template; pin to exact for high-stakes deps like the auth library).
- **Avoid `postinstall` scripts** from unknown packages — they run on every `npm install`. Disable globally via `npm config set ignore-scripts true` for high-trust environments, and audit any script that fails to run.

---

## 7. Transport security

Set at the **host**, not in the SPA. Every static host now offers automatic HTTPS / HSTS — use it.

### 7.1 HTTPS only

**Status: HOST RESPONSIBILITY.**

Required headers (set by the static host):

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

- **HSTS preload** is a one-way commitment — only enable `preload` once you're certain every subdomain serves HTTPS.
- **`X-Frame-Options: DENY`** is superseded by CSP's `frame-ancestors 'none'` (§4). Set both during transition.
- **`Permissions-Policy`** disables browser features your app doesn't need — defense in depth against malicious third-party scripts.

### 7.2 Cookie flags

**Status: BACKEND RESPONSIBILITY** (when auth lands).

When the backend sets cookies, see §5.1 for the required flags.

---

## 8. CORS and API integration

CORS is enforced by the browser, configured by the backend. The SPA's only role is to send the right requests.

### 8.1 What to require of the backend

- `Access-Control-Allow-Origin` lists this SPA's exact origin(s) — never `*` if credentials are included.
- `Access-Control-Allow-Credentials: true` if using cookies / `credentials: "include"`.
- `Access-Control-Allow-Methods` and `-Headers` restricted to what the API actually needs.
- Preflight (`OPTIONS`) responses cache for a sensible TTL (`Access-Control-Max-Age: 86400`).

### 8.2 What the SPA does

- `credentials: "include"` on `fetch` only when the API expects cookies.
- Don't send credentials to third-party APIs (analytics, maps, etc.).
- One `useApi()` composable (see [BACKEND.md §3](BACKEND.md)) so the CORS posture is centralized.

---

## 9. Forms and user input

### 9.1 Server-side validation is the source of truth

**Status: PROJECT POLICY.**

Client-side validation (via `validator`, see [FRONTEND.md §7](FRONTEND.md)) is **UX**, not **security**. An attacker bypasses it trivially. Every constraint that matters is re-checked server-side.

### 9.2 File uploads

Not wired in this template. When added:

- **Validate content type server-side**; never trust the browser-provided MIME.
- **Cap file size** at the upload boundary (Vite dev proxy, the production backend, and any CDN in between).
- **Don't echo uploaded HTML back unsanitized** — that's a stored XSS in waiting.
- **Strip EXIF / metadata** from images before serving them publicly.
- **Serve user uploads from a separate origin** (subdomain or CDN bucket) so the browser's same-origin policy isolates them from the app's session cookies.

### 9.3 Outgoing links

For user-authored content with links to arbitrary URLs (comment systems, profile bios), add `rel="noopener noreferrer nofollow"`:

- `noopener` — prevents the linked page from accessing `window.opener`.
- `noreferrer` — strips the referrer so you don't leak internal URLs.
- `nofollow` — tells search engines not to weight the link (defends against SEO spam).

---

## 10. Logging, errors, and reporting

### 10.1 Don't log sensitive data to the console

**Status: PROJECT POLICY.**

`console.log` survives into production unless explicitly stripped (§2.1). Don't `console.log` tokens, PII, request bodies of auth endpoints, or anything in `import.meta.env`. Strip with esbuild's `drop` config.

### 10.2 Error reporting (Sentry, Bugsnag, etc.)

**Status: NOT YET.**

When wired:

- **PII scrubbing**: configure the SDK to strip emails, tokens, IPs from breadcrumbs and request bodies before send.
- **Source maps**: upload to the reporting service so stack traces are useful, but don't ship them publicly (§2.1).
- **Sample rate**: 100% errors, lower (1–10%) on performance traces to control cost without losing signal.

### 10.3 Don't leak internal URLs

Error messages shown to users must not include internal hostnames, stack traces, or query strings. Catch at the API client boundary; render a normalized message.

---

## 11. Static analysis and CI

**Status: NOT YET** — no `.github/workflows/` exists.

Wire as soon as the first project ships:

- **Lint**: ESLint with `eslint-plugin-vue`. Add `eslint-plugin-security` for JS-level anti-patterns.
- **Format**: Prettier check (`prettier --check src/`) fails on drift.
- **Test**: `npm run test:unit -- --run` for one-shot CI runs.
- **Build**: `npm run build` must succeed.
- **Audit**: `npm audit --audit-level=high` (tune the level to noise tolerance).
- **Secret scan**: `gitleaks` or GitHub's built-in secret scanning on every push.
- **Container scan** (if Dockerizing the static host): Trivy / Grype.

Pin Node version in CI (`actions/setup-node@v4` with the version from [package.json](../package.json) `engines.node`).

---

## 12. Pre-deploy checklist

Run this before promoting a build to staging or production. Every item must pass.

### 12.1 Application

- [x] Vue's default escaping is intact; no `v-html` of user content (§3). ✅ **PROJECT POLICY**
- [ ] Production build strips `console.*` / `debugger` (§2.1).
- [ ] Source maps decision is made and configured (§2.1).
- [ ] No secrets in `VITE_*` env vars (§2.3).
- [ ] `.env*` files are gitignored; only `.env.example` is tracked (§2.3).
- [ ] `DOMPurify` (or equivalent) wraps any `v-html` of trusted-but-rich content (§3.2).
- [ ] No `javascript:` URLs in dynamic `:href` / `:src` (§3.3).
- [ ] CSP header is set at the host with `default-src 'self'` and a documented allowlist (§4).
- [ ] Auth tokens are in `HttpOnly` cookies (preferred) or in-memory; never in `localStorage` (§5).

### 12.2 Supply chain

- [ ] `npm ci` (not `npm install`) used in CI (§6.1).
- [ ] `npm audit` clean on HIGH/CRITICAL (§6.2).
- [ ] Dependabot / Renovate enabled (§6.2).
- [ ] No `postinstall` script from an untrusted package (§6.4).
- [ ] SBOM produced and stored with the release (§6.3).

### 12.3 Transport

- [ ] HTTPS only; HSTS header set at the host (§7.1).
- [ ] `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` headers set (§7.1).
- [ ] Cookies (if any) carry `HttpOnly`, `Secure`, `SameSite=Lax` (§7.2).

### 12.4 API integration

- [ ] CORS on the backend lists this SPA's origin explicitly (§8.1).
- [ ] One `useApi()` composable owns base URL, auth header, error handling (§8.2 + [BACKEND.md §3](BACKEND.md)).

### 12.5 Operations

- [ ] No PII in `console.log` or error-reporter breadcrumbs (§10.1, §10.2).
- [ ] Error reporter source-map upload doesn't expose internals (§10.2).
- [ ] CI runs lint, format, test, build, audit, secret-scan on every PR (§11).

---

## 13. References

- [OWASP Top 10 — A03:2021 Injection](https://owasp.org/Top10/A03_2021-Injection/) (XSS)
- [OWASP Top 10 — A07:2021 Identification and Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/)
- [OWASP Top 10 — A08:2021 Software and Data Integrity Failures](https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/) (supply chain)
- [MDN — Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Vue.js — Security](https://vuejs.org/guide/best-practices/security.html)
- [Vite — env vars and build modes](https://vite.dev/guide/env-and-mode.html)
