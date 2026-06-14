# willgerman-portfolio

A personal portfolio SPA at willgerman.dev. Built on Vue 3 + Vite + Tailwind v4 (no `tailwind.config.js` — tokens live in `@theme` inside [src/styles/app.css](../../src/styles/app.css)). The first round delivers a game-menu-style home screen (centered title/subtitle + vertical button stack), a settings view with sidebar + glassmorphic content panel, a responsive project list grid (1/2/3/4 columns by breakpoint, 8 cards total), and a scaffolded project detail view. Self-hosted Barlow + Barlow Condensed fonts; dark base (black background, white text default).

Branch: `docs/feature-plans` (this planning round) → individual features will ship on `feature/<feature-slug>` branches downstream.
Created: 2026-06-14
Decisions resolved: 2026-06-14
Status: ready-to-implement

## Feature plans

| #   | Feature                  | Scope                                                                                                                            | Plan                                                 |
| --- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1   | `typography-foundation`  | Self-host Barlow / Barlow Condensed; declare first `@theme` tokens (`--font-sans`, `--font-condensed`, `--color-*`); body defaults. | [typography-foundation.md](typography-foundation.md) |
| 2   | `menu-button`            | Reusable `MenuButton.vue` — uppercase text, white border, glassmorphic surface, dual `<button>`/`<RouterLink>` modes.             | [menu-button.md](menu-button.md)                     |
| 3   | `main-menu-view`         | Build `HomeView.vue` as the main menu (title/subtitle + Start/Settings/Quit buttons); register `home` route at `/`.               | [main-menu-view.md](main-menu-view.md)               |
| 4   | `menu-sidebar`           | Reusable `MenuSidebar.vue` — aside / sidebar of navigational tabs with `v-model:activeTab`.                                       | [menu-sidebar.md](menu-sidebar.md)                   |
| 5   | `settings-view`          | Create `SettingsView.vue` (does not yet exist) — sidebar + glassmorphic content panel; register `settings` route at `/settings`.  | [settings-view.md](settings-view.md)                 |
| 6   | `project-card`           | Reusable `ProjectCard.vue` — 5/7 aspect-ratio card; whole-card RouterLink to `/projects/:slug`.                                   | [project-card.md](project-card.md)                   |
| 7   | `project-list-view`      | Wire `ProjectListView.vue` with a 1/sm:2/md:3/lg:4 grid of exactly 8 ProjectCards; register `project-list` route at `/projects`.  | [project-list-view.md](project-list-view.md)         |
| 8   | `project-detail-view`    | Scaffold `ProjectDetailView.vue` (title / subtitle / short description); register `project-detail` route at `/projects/:slug`.   | [project-detail-view.md](project-detail-view.md)     |

## Cross-cutting concerns

### Design tokens & shared glassmorphic surface

[src/styles/app.css](../../src/styles/app.css) currently has no `@theme` block. Three features collectively need it populated: `typography-foundation` declares the font tokens (`--font-sans`, `--font-condensed`) and base color tokens (`--color-background`, `--color-foreground`); `menu-button` and `settings-view` both consume a **shared `.glass-surface` utility** (translucent white background + `backdrop-filter: blur(...)` + 1px white border + graceful fallback). Multiple feature plans flagged the same gap — there is no good per-feature owner for the glass utility itself.

- **Approach:** `typography-foundation` (the first feature to land) opens the `@theme` block and declares only the tokens it owns. `menu-button` (the first consumer of the glass surface) declares the shared `.glass-surface` utility as part of its Phase 0, in [src/styles/app.css](../../src/styles/app.css) under `@layer utilities`, so `settings-view` can reuse it without redeclaring. The utility documents its fallback (solid `rgba(255,255,255,0.06)` for browsers without `backdrop-filter`).
- **Sign-off needed:**
  - **Glass surface utility lives in `app.css` (not in `MenuButton.vue`'s scoped styles)** — owner: @willgermandev — default if no response: declare it in `app.css` as planned.
  - **Border color token (`--color-border-default`) vs. raw `white`** — owner: @willgermandev — default if no response: raw `white` for now; promote to a token when a second border treatment lands.

### Route table coordination

[src/router/index.js](../../src/router/index.js) currently exports `routes: []`. Four feature plans each register exactly one route:

| Route name       | Path              | View                  | Plan                |
| ---------------- | ----------------- | --------------------- | ------------------- |
| `home`           | `/`               | HomeView.vue          | main-menu-view      |
| `settings`       | `/settings`       | SettingsView.vue      | settings-view       |
| `project-list`   | `/projects`       | ProjectListView.vue   | project-list-view   |
| `project-detail` | `/projects/:slug` | ProjectDetailView.vue | project-detail-view |

- **Approach:** Each feature plan adds its own route in its Phase, lazy-loaded via dynamic `import()` per [docs/CODING_STANDARDS.md §7](../CODING_STANDARDS.md). The first feature to land (per build order: `main-menu-view`) edits the empty `routes` array; subsequent features append. Whoever lands first should also declare a `404` / catch-all fallback so a typo'd URL doesn't render an empty `App.vue` — recommend a simple `redirect: { name: "home" }` for now.
- **Sign-off needed:**
  - **404 / catch-all behaviour** — owner: @willgermandev — default if no response: redirect unknown routes to `home`.
  - **Whether to add an `App.vue` shell pass (skip-link, `<RouterView>`, route announcer)** before any view ships — owner: @willgermandev — default if no response: defer; ship the views first and revisit when the second view lands.

### SettingsView.vue file does not exist

[src/views/](../../src/views/) currently contains `HomeView.vue`, `ProjectListView.vue`, `ProjectDetailView.vue`, and `StyleGuideView.vue`. `SettingsView.vue` is referenced by `main-menu-view` (the Settings button navigates to it) but does not yet exist.

- **Approach:** `settings-view` is responsible for creating the file from the SFC baseline in [docs/CODING_STANDARDS.md §5](../CODING_STANDARDS.md). The build order below schedules `settings-view` to land before any user could realistically click the Settings button — but `main-menu-view` could theoretically land first if `settings-view`'s route registration is staged alongside it. Recommend landing `main-menu-view` first with a known-broken Settings link, then `settings-view` immediately after.
- **Sign-off needed:** None — the file creation is owned cleanly by `settings-view`.

### `window.close()` behaviour for the Quit button

`main-menu-view`'s Quit button calls `window.close()`. Modern browsers (Chrome / Safari / Firefox) refuse to close tabs the user opened directly (i.e. anything not opened via `window.open` from a script). The brief explicitly does not want to close the entire window.

- **Approach:** Per `main-menu-view`'s plan, the click handler calls `window.close()` and falls back to `console.info("Tab close blocked by browser; please close this tab manually.")`. No alert / modal / disabled state — the button still looks active, but on most browsers it is effectively a no-op for organic visitors.
- **Sign-off needed:**
  - **Should the Quit button instead navigate to `about:blank` or a "Thanks for visiting" route as a fallback?** — owner: @willgermandev — default if no response: stick with `window.close()` + `console.info`. Document the limitation in the README when one lands.

### Shared placeholder project records

`project-list-view` and `project-detail-view` both need the same array of 8 placeholder project records (slug, title, subtitle, optional thumbnail). Both feature plans flagged this duplication.

- **Approach:** Both features ship with their own local copy on first land (no premature abstraction). When the **second** consumer lands, extract to `src/data/projects.js` (or `src/services/projects.js` if any non-trivial behaviour creeps in — per [docs/FRONTEND.md §10](../FRONTEND.md)'s services-vs-utilities split). Build order below schedules `project-detail-view` before `project-list-view` so the extraction can happen as part of `project-list-view`'s phasing.
- **Sign-off needed:**
  - **`src/data/projects.js` vs. `src/services/projects.js`** — owner: @willgermandev — default if no response: `src/data/projects.js` while the records are pure literals; promote to `services/` only when load-from-network or transformation logic appears.

### Page landmark / `<main>` placement

Multiple plans (`settings-view`, `project-list-view`, `project-detail-view`) each render their own `<main>` landmark. Doing so per-view risks two `<main>` elements on the page if `App.vue` also wraps `<RouterView>` in a `<main>`.

- **Approach:** Each view declares its own `<main>` (cleaner per-view ownership; `App.vue` stays a thin shell). Audit `App.vue` to confirm it does not introduce a second `<main>`. This is consistent with the route-announcer pattern described in [docs/ACCESSIBILITY.md §4.1](../ACCESSIBILITY.md), which lives in `App.vue` *outside* any `<main>`.
- **Sign-off needed:**
  - **Per-view `<main>` vs. App.vue-owned `<main>`** — owner: @willgermandev — default if no response: per-view, as planned.

### Route-change focus management / route announcer / axe-core CI

Three a11y / DX concerns surfaced across multiple plans that do not belong to any single view: SPA route-change focus management (move focus to `<main>` or `<h1>` on navigation), an accessible route-change announcer (`role="status"` live region), and axe-core integration in CI for regression coverage.

- **Approach:** Defer all three to a separate **`accessibility-shell`** feature plan in a later round, once at least two routes are live. Document this in the README when one lands. Build order does not block on it.
- **Sign-off needed:** None at this stage — flag for the next planning round.

## Suggested build order

Each feature is small enough to land in a single PR. The order minimizes downstream rework by landing every "consumed" primitive before its consumer.

1. **`typography-foundation`** — no dependencies; declares the first `@theme` tokens every downstream feature reads. Unblocks: **all 7 remaining features**.
2. **`menu-button`** — depends only on `typography-foundation`'s font tokens. Also declares the shared `.glass-surface` utility (per the cross-cutting concern above). Unblocks: `main-menu-view`, `settings-view`.
3. **`menu-sidebar`** — depends only on `typography-foundation` and (optionally) the shared glass utility from `menu-button`. Can land in parallel with `menu-button`. Unblocks: `settings-view`.
4. **`project-card`** — depends only on `typography-foundation` and assumes the `/projects/:slug` URL pattern (consumed, not registered). Can land in parallel with `menu-button` and `menu-sidebar`. Unblocks: `project-list-view`.
5. **`main-menu-view`** — depends on `menu-button` (consumer) and edits the empty `routes` array. Lands the first wired URL (`/`). The Settings link will be broken until `settings-view` lands — acceptable per the SettingsView cross-cutting note. Unblocks: nothing structurally, but turns the SPA into a live site.
6. **`settings-view`** — depends on `menu-sidebar` (consumer) and creates `SettingsView.vue`. Lands second URL (`/settings`). Unblocks: nothing further.
7. **`project-detail-view`** — registers `/projects/:slug` and ships its own copy of the placeholder records. Lands before `project-list-view` so the cards have a real navigation target. Unblocks: clean extraction during `project-list-view`.
8. **`project-list-view`** — depends on `project-card` (consumer); registers `/projects`; **performs the shared project-records extraction** to `src/data/projects.js` per the cross-cutting concern. Unblocks: a fully wired SPA where every menu button reaches a real view.

After all 8 ship, the next planning round should cover the `accessibility-shell` concern (route-change focus, announcer, axe-core CI) and real project content.

## Open at project level

_All items below resolved 2026-06-14. The list is retained as a decision log so the implementing PRs reference back to it._

Items that affect more than one feature:

- **Glass surface utility location** — **resolved 2026-06-14: declared in [src/styles/app.css](../../src/styles/app.css) under `@layer utilities`, owned by `menu-button`'s Phase 0.** Includes a `@supports not (backdrop-filter: blur(8px))` fallback using `bg-white/20` solid.
- **Semantic border token (`--color-border-default`)** — **resolved 2026-06-14: defer; use raw `white` (Tailwind `border-white`).** Promote to a `--color-border-default` semantic alias only when a second border treatment with a different intent lands.
- **404 / catch-all route behaviour** — **resolved 2026-06-14: redirect to `home`, owned by `main-menu-view` (first feature to edit `routes`).** Catch-all entry: `{ path: '/:pathMatch(.*)*', redirect: { name: 'home' } }`.
- **`App.vue` shell pass timing (skip-link / `<RouterView>` / route announcer)** — **resolved 2026-06-14: defer to a separate `accessibility-shell` feature plan.** Each routed view declares its own `<main id="main-content">`; App.vue stays a thin shell. The future `accessibility-shell` plan adds the skip link, route-change focus management, accessible route announcer, and axe-core CI integration.
- **Quit button fallback (when `window.close()` is refused)** — **resolved 2026-06-14: `console.info` only.** `try/catch` wrap, fall back to `console.info("Tab close blocked by browser; please close this tab manually.")`. No user prompt, no navigation, no banner. Document the limitation in the README when one lands.
- **Shared project records location (`src/data/` vs. `src/services/`)** — **resolved 2026-06-14: `src/data/projects.js`.** Pure ES-module export of an array of `{ slug, title, subtitle?, thumbnail?, thumbnailAlt?, description }` records. Created by `project-list-view`'s PR (the second consumer, per build order). Promote to `src/services/` only when load-from-network or transformation logic appears.
- **Page landmark ownership (per-view `<main>` vs. App.vue-owned)** — **resolved 2026-06-14: per-view `<main>`.** Each routed view declares its own `<main id="main-content">`. App.vue does NOT wrap `<RouterView>` in a `<main>`. The future `accessibility-shell` plan audits and confirms exactly one `<main>` per route.
- **Real branding copy for title / subtitle / project records** — **resolved 2026-06-14: defer copy entirely on both `main-menu-view` and `project-list-view`.** Both views ship with `[Title placeholder — TBD]` / `[Heading placeholder — TBD]` strings marked by an inline `<!-- TBD content -->` HTML comment. Project records keep `Project One`…`Project Eight`. A pre-launch content sweep replaces all placeholders.
- **Mobile behaviour for `MenuSidebar` inside `SettingsView` (overlay vs. stacked vs. drawer)** — **resolved 2026-06-14: hamburger + overlay drawer.** Below `md`, the sidebar collapses to a hamburger trigger that opens an overlay drawer with focus trap, Escape-to-close, backdrop-click-to-close, and body-scroll-lock. Owned by the `menu-sidebar` component; `settings-view` consumes the resolved behaviour.
- **Settings tab list (recommended: General / Display / Accessibility)** — **resolved 2026-06-14: General / Display / Accessibility with "Coming soon" placeholder bodies.**
- **`prosettings.net` reference image refinement** — **resolved 2026-06-14: ship best-guess draft; iterate during PR review side-by-side with the reference image.** Non-blocking; may spawn a follow-up `feature/settings-visual-polish` PR if the gap is meaningful.

- **Icon system (NEW, surfaced by `settings-view`'s chevron back affordance)** — **resolved 2026-06-14: inline SVG for the single chevron, no system yet.** Open a follow-up `feature/icon-system` plan when the second SVG icon need lands. Recommended approaches at that point: inline SVGs under `src/components/icons/`, or a tree-shakeable library like `lucide-vue-next`.
- **Browser support matrix (drives `woff2`-only vs. `woff`+`woff2` and `backdrop-filter` fallback expectations)** — **resolved 2026-06-14: modern evergreen browsers only.** Ship `woff2` only (`typography-foundation`). `backdrop-filter` fallback is the `bg-white/20` solid via `@supports not (...)` in the `.glass-surface` utility (`menu-button` Phase 0).
