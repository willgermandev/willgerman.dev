A settings page that pairs a left-side navigational sidebar with a right-side glassmorphic content panel. The actual settings each tab will eventually expose are deliberately deferred — this round establishes only the shell, the route, and the tab-switching plumbing. The view lives in the routed-view layer (`src/views/SettingsView.vue`) and is reached from the home menu's "Settings" button. Branch: `feature/feature-plans` (this plan is one of several authored on the project-wide planning branch; the implementation will ship on a follow-up `feature/settings-view` branch). Related plans on the same project: `menu-sidebar` (owns the `<MenuSidebar>` component this view composes), the home-view plan (owns the "Settings" entry point), and the project-level "design tokens & glass surface" plan (owns the shared `.glass-surface` utility this view consumes).

## Holistic overview

**Problem.** The portfolio's home view is modeled on a video-game main menu: a vertical stack of buttons (Projects, Settings, About, …). "Settings" is one of those buttons, but the destination doesn't exist yet — clicking it lands on the empty scaffolded `SettingsView.vue` because no route is wired. Visitors who want to adjust display preferences, motion, font size, etc. have nowhere to go, and the visual identity of the settings surface (sidebar + glassmorphic panel, modeled on the prosettings.net reference) hasn't been built. This plan builds the shell so future settings can drop in without re-deciding layout.

**Approach.** Replace the empty `src/views/SettingsView.vue` body with a two-region layout: a left-side `<aside>` containing a composed `<MenuSidebar>` (component owned by the sibling `menu-sidebar` plan) whose items are the tab list, and a right-side `<main>` containing a glassmorphic `<section>` panel whose content swaps based on the active tab. State is local to the view — a `ref` holding the active tab id, plus a static array describing the tabs and their placeholder content. Each tab renders a Barlow Condensed heading and a "Coming soon" paragraph; no real settings ship in this round. The route registers as `name: "settings"`, path `/settings`, lazy-loaded, in `src/router/index.js`. A back affordance (a `<RouterLink>` to the home route) keeps the user from getting stuck on the dead-end page.

**Constraints.**
- **Tailwind v4 only.** Layout is composed from utilities; the glassmorphic surface comes from a shared `.glass-surface` class declared centrally (project-level concern; see "Flagged for human review"). No `tailwind.config.js`; tokens live in `@theme` inside [src/styles/app.css](../../src/styles/app.css).
- **WCAG 2.1 AA.** Exactly one `<main>` per route ([docs/ACCESSIBILITY.md §1.1 — 1.3.1](../ACCESSIBILITY.md)); skip-link target is the `<main>`; landmarks must be discoverable (`<aside>` for the sidebar, `<main>` for the content); the tab pattern uses ARIA tab semantics (`role="tablist"` / `role="tab"` / `role="tabpanel"` with `aria-selected`, `aria-controls`, and roving tabindex) — implemented on the `MenuSidebar` side; this view supplies the `aria-controls` target ids and the focusable panel.
- **Responsive collapse.** On `lg+` the sidebar is a fixed-width column and the content panel fills the remainder. At `md` and below the layout stacks vertically (sidebar on top, content below). Final breakpoints flagged.
- **Glass surface graceful degradation.** `backdrop-filter` is widely supported but not universal. The shared `.glass-surface` utility must provide a fallback background that remains AA-contrast against the content (see project-level glass-surface plan).
- **No animations** in this round. Tab switching is an instantaneous swap.
- **Vue 3 `<script setup>` only**, setup-style Pinia (not used in this round), Prettier per [docs/CODING_STANDARDS.md §9](../CODING_STANDARDS.md) (4-space, double quotes, 100 col, semicolons, `singleAttributePerLine: true`).

**Out of scope (explicit).**
- **Real settings UI.** Display preferences, font size, motion controls, theme controls — out of scope. Each tab ships with `Coming soon` placeholder copy.
- **Persistence.** No Pinia store, no `localStorage`, no `pinia-plugin-persistedstate`. State is local component state.
- **The `<MenuSidebar>` component itself** — owned by the `menu-sidebar` plan. This view consumes its API.
- **The shared `.glass-surface` declaration** — owned by the project-level "design tokens & glass surface" plan. This view consumes the utility.
- **Animations / transitions** between tabs.
- **Mobile menu / hamburger behavior** for the sidebar — cross-cutting with `menu-sidebar`.
- **Skip-link** — owned by the `App.vue` shell (cross-cutting; see [docs/ACCESSIBILITY.md §4.3](../ACCESSIBILITY.md)).

## Generated code

### Phase 0 prerequisite — SFC baseline

`src/views/SettingsView.vue` already exists in the scaffold but contains only the empty baseline (verified at plan time):

```vue
<script setup></script>

<template></template>

<style scoped>
    @reference "#app.css";
</style>
```

The empty file is the [docs/CODING_STANDARDS.md §5](../CODING_STANDARDS.md) baseline. Phase 0 below confirms the file is at this baseline before Phase 1 layout work begins; no creation step is required if the existing file matches.

### Presentation — `src/views/SettingsView.vue`

The view composes `<MenuSidebar>` (consumed from `@/components/MenuSidebar.vue` — owned by `menu-sidebar`) on the left and a glassmorphic `<section>` on the right. Tab definitions are a static array; active selection is a local `ref`.

```vue
<script setup>
    import { computed, ref } from "vue";

    import MenuSidebar from "@/components/MenuSidebar.vue";

    const tabs = [
        {
            id: "general",
            label: "General",
            heading: "General",
            description: "Coming soon.",
        },
        {
            id: "display",
            label: "Display",
            heading: "Display",
            description: "Coming soon.",
        },
        {
            id: "accessibility",
            label: "Accessibility",
            heading: "Accessibility",
            description: "Coming soon.",
        },
    ];

    const activeTabId = ref(tabs[0].id);

    const activeTab = computed(() =>
        tabs.find((tab) => tab.id === activeTabId.value),
    );

    function panelIdFor(tabId) {
        return `settings-panel-${tabId}`;
    }

    function tabIdFor(tabId) {
        return `settings-tab-${tabId}`;
    }
</script>

<template>
    <div class="settings-view flex min-h-screen flex-col gap-6 p-6 lg:flex-row lg:gap-8 lg:p-10">
        <aside
            class="settings-view__sidebar w-full lg:w-64 lg:shrink-0"
            aria-label="Settings navigation"
        >
            <RouterLink
                :to="{ name: 'home' }"
                class="settings-view__back mb-6 inline-flex items-center gap-2 text-sm"
            >
                Back
            </RouterLink>
            <MenuSidebar
                :items="tabs"
                :active-id="activeTabId"
                :tab-id-for="tabIdFor"
                :panel-id-for="panelIdFor"
                @select="(id) => (activeTabId = id)"
            />
        </aside>
        <main class="settings-view__main flex-1">
            <section
                v-for="tab in tabs"
                :id="panelIdFor(tab.id)"
                :key="tab.id"
                role="tabpanel"
                :aria-labelledby="tabIdFor(tab.id)"
                :hidden="tab.id !== activeTabId"
                tabindex="0"
                class="glass-surface p-8 lg:p-12"
            >
                <h2 class="settings-view__heading font-heading-condensed text-3xl">
                    {{ tab.heading }}
                </h2>
                <p class="mt-4 text-base">
                    {{ tab.description }}
                </p>
            </section>
        </main>
    </div>
</template>

<style scoped>
    @reference "#app.css";

    .settings-view__heading {
        /* font-heading-condensed token is declared centrally in @theme; see project-level
           "design tokens & glass surface" plan. If the token is renamed, update here. */
    }
</style>
```

**Notes on the `<MenuSidebar>` prop contract assumed above** (flagged — the `menu-sidebar` plan owns the final shape):

| Prop / event | Type | Purpose |
| --- | --- | --- |
| `items` | `Array<{ id: string, label: string }>` | Tabs to render |
| `activeId` | `string` | Currently selected tab id |
| `tabIdFor` | `(id: string) => string` | Returns the DOM id for the tab control (so `aria-controls` on the tab and `aria-labelledby` on the panel agree) |
| `panelIdFor` | `(id: string) => string` | Returns the DOM id for the panel the tab controls |
| `@select` | `(id: string) => void` | Emitted when the user activates a tab |

If `menu-sidebar` lands a different prop shape, this view is the only consumer to update.

### Public surface — `src/router/index.js`

Add one named, lazy-loaded route. The home route (`name: "home"`) is assumed to exist by the time this view ships — referenced from the back link. If it doesn't yet, flag.

```js
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // …other routes…
        {
            path: "/settings",
            name: "settings",
            component: () => import("@/views/SettingsView.vue"),
            meta: { title: "Settings" },
        },
    ],
});

export default router;
```

The `meta.title` is consumed by the SPA route-announcer pattern in [docs/ACCESSIBILITY.md §4.1](../ACCESSIBILITY.md) once that plumbing lands at the project level.

### Data model

_N/A — feature has no persistent state. Tab state is local to the component._

### Business logic

_N/A — only local presentation state and a tab-id lookup helper._

### Configuration

_N/A — no env vars, no feature flags._

### Integration

_N/A — no external services._

## Phased implementation plan

### Phase 0 — Establish missing primitives

The shell consumes two primitives that don't exist yet in the codebase. **This view's plan does not create them** — they're owned by sibling plans — but the work cannot begin until each lands. Phase 0 here is a gating check, not an authoring step.

1. **Confirm `@/components/MenuSidebar.vue` exists** and exposes (or accepts a superset of) the prop / event contract documented in "Generated code → Presentation". Owner: `menu-sidebar` plan.
    - _Verify:_ `import MenuSidebar from "@/components/MenuSidebar.vue"` resolves under `npm run dev` without an unresolved-module error.
2. **Confirm the shared `.glass-surface` utility (or equivalent class) is declared** in [src/styles/app.css](../../src/styles/app.css) (or imported from there), with a `backdrop-filter`-free fallback. Owner: project-level "design tokens & glass surface" plan.
    - _Verify:_ a throwaway `<div class="glass-surface">` rendered in the dev server shows the translucent surface (or fallback) without browser warnings.
3. **Confirm the `font-heading-condensed` token (or whatever the final token name is) is declared in `@theme`** for Barlow Condensed. Owner: project-level design plan.
    - _Verify:_ inspecting an `h2.font-heading-condensed` in DevTools resolves `font-family` to the Barlow Condensed stack.
4. **Confirm a home route named `home` exists** in `src/router/index.js`. Owner: home-view plan.
    - _Verify:_ `router.resolve({ name: "home" }).href === "/"`.

**Exit criterion:** all four imports / utilities / tokens / routes referenced by this view's "Generated code" resolve at dev-server startup.

### Phase 1 — Feature build-out

The settings shell is functional end-to-end: visitors can navigate to `/settings`, see the sidebar + glass panel, switch tabs, and click "Back" to return home.

1. **Confirm `src/views/SettingsView.vue` is at the SFC baseline.** It already exists (verified at plan time); if it has drifted, reset to the baseline from [docs/CODING_STANDARDS.md §5](../CODING_STANDARDS.md).
    - _Verify:_ `git diff src/views/SettingsView.vue` shows only whitespace differences against the baseline before authoring.
2. **Implement the `<script setup>` block** per "Generated code → Presentation": `tabs` array, `activeTabId` ref, `activeTab` computed, `panelIdFor` / `tabIdFor` helpers. Import `MenuSidebar` via the `@/` alias.
    - _Verify:_ `npm run dev` boots without errors; in the Vue devtools, `SettingsView` shows `activeTabId === "general"`.
3. **Implement the `<template>` block**: the two-column layout, the `<aside>` containing the back `RouterLink` + `<MenuSidebar>`, the `<main>` containing the `v-for`-rendered `<section role="tabpanel">` panels.
    - _Verify:_ at `lg+` the sidebar sits left, panel right; at `md` and below they stack vertically (Chrome DevTools device toolbar).
4. **Register the route** in [src/router/index.js](../../src/router/index.js) per "Generated code → Public surface". Lazy-loaded, name `settings`, path `/settings`, `meta: { title: "Settings" }`.
    - _Verify:_ navigating to `http://localhost:5173/settings` renders the view; `router.resolve({ name: "settings" }).href === "/settings"`.
5. **Wire the tab-select event**: clicking a `MenuSidebar` item updates `activeTabId`; the corresponding `<section>` is the only one without `[hidden]`.
    - _Verify:_ click each of General / Display / Accessibility; the heading and copy in the panel swap; only one panel is visible at a time in the DOM.
6. **Wire the back affordance**: the `<RouterLink :to="{ name: 'home' }">` returns the user to `/`.
    - _Verify:_ from `/settings`, clicking "Back" navigates to `/` and unmounts the view (Vue devtools).

**Exit criterion:** the view renders without console errors on the dev server, tab switching works, and the back link navigates home.

### Phase 2 — Unit and integration tests

A Vitest spec covering the view's observable behavior. Tests use `mount` + `createTestingPinia` (no stores used here, but the convention is consistent) + an in-memory router per [docs/CODING_STANDARDS.md §8](../CODING_STANDARDS.md).

1. **Create `src/__tests__/SettingsView.spec.js`** with the `describe("SettingsView")` block at top level.
    - _Verify:_ `npx vitest run src/__tests__/SettingsView.spec.js` discovers the file.
2. **Test: renders the three default tabs**. Stub `<MenuSidebar>` with a test-double that exposes the `items` prop on the DOM; assert three items appear.
    - _Verify:_ test passes.
3. **Test: changes the visible panel when `MenuSidebar` emits `select`**. Trigger `@select` with `"display"`; assert the "Display" panel is the only one without the `hidden` attribute.
    - _Verify:_ test passes; toggling to `"accessibility"` flips visibility correctly.
4. **Test: every panel has `role="tabpanel"` and an `aria-labelledby` matching its tab's id**.
    - _Verify:_ test passes.
5. **Test: the back link points at `{ name: "home" }`**. Use the in-memory router; assert the `RouterLink`'s resolved `href` is `/`.
    - _Verify:_ test passes; if the `home` route is missing the test surfaces it as a router warning (which is the intent).

**Exit criterion:** all five tests pass; `npm run test:unit` (one-shot via `npx vitest run`) is green.

### Phase 3 — Security and risk audit

This view has no user input, no network calls, no auth, no external integrations. The audit is short and explicit.

1. **No user input.** Tab labels and copy are static strings in the component source; no interpolation of user-supplied content.
    - _Verify:_ `grep -n "v-html\|innerHTML" src/views/SettingsView.vue` returns no matches.
2. **No external links.** The view contains exactly one navigational link (`<RouterLink>` to `home`); no `target="_blank"`, no `rel` attribute concerns.
    - _Verify:_ `grep -n "target=" src/views/SettingsView.vue` returns no matches.
3. **No new third-party dependency.** The view consumes only Vue, vue-router, and the project's own `@/components/MenuSidebar.vue` and `@/styles/app.css`.
    - _Verify:_ `git diff package.json` after Phase 1 shows no dependency change.
4. **Out of scope:** CSP review, secret handling, rate limiting — none apply to a static placeholder view. Revisit when real settings (especially anything that posts to a backend) land.

**Exit criterion:** the four checks above pass.

### Phase 4 — Accessibility audit

Run automated and manual checks per [docs/ACCESSIBILITY.md §3](../ACCESSIBILITY.md). The view is the target; the canonical pairings (NVDA + Firefox, VoiceOver + Safari) are the floor.

1. **Automated scan with axe-core.** Run an `@axe-core/playwright` or `vue-axe-next` sweep against `/settings` and assert zero violations under the WCAG 2.1 AA rule set. If axe-core isn't wired yet, fall back to the axe DevTools browser extension on the dev server.
    - _Verify:_ zero violations.
2. **Landmark hierarchy.** Exactly one `<main>`, one `<aside>`. The `<aside>` has an accessible name (`aria-label="Settings navigation"`). Confirm via the browser's accessibility tree.
    - _Verify:_ Chrome DevTools → Elements → Accessibility shows `main` and `complementary` (the `<aside>` role) as siblings under the document root.
3. **Tab pattern semantics.** Each `<section role="tabpanel">` has an `aria-labelledby` pointing at its tab control; `[hidden]` is on every non-active panel. The active tab control (in `<MenuSidebar>`) has `aria-selected="true"` and `aria-controls` pointing at its panel.
    - _Verify:_ NVDA's elements list shows the tab panels; VoiceOver announces the active panel's heading on activation.
4. **Keyboard navigation.** Tab order is: back link → tab list (roving tabindex within) → active panel content. `Enter` / `Space` on a tab activates it; `Arrow` keys move within the tablist (owned by `MenuSidebar`).
    - _Verify:_ keyboard-only walkthrough per [docs/ACCESSIBILITY.md §3.3](../ACCESSIBILITY.md).
5. **Focus visible.** The back link and every tab control have a visible focus ring (rely on browser default or a `focus-visible:ring-*` utility — flagged for the design plan).
    - _Verify:_ tabbing through each control shows a clear ring on both light and dark backgrounds.
6. **Contrast.** The "Coming soon" copy and the tab heading must meet 4.5:1 (or 3:1 for large text) against the glass-surface fallback background. Tinted-glass contrast is checked at the token level — flag.
    - _Verify:_ WebAIM contrast checker against the resolved background color for both the `backdrop-filter`-on path and the fallback.
7. **Reduced motion.** No animation is introduced in this round; nothing to gate. Confirm by inspection.
    - _Verify:_ `grep -n "transition\|animate" src/views/SettingsView.vue` returns no matches.

**Exit criterion:** axe-core clean, landmark hierarchy correct, tab pattern semantics correct under at least one screen-reader walkthrough.

### Phase 5 — Search-engine-optimization audit

The site is a portfolio; the settings page is a utility view and not a primary SEO surface.

1. **Page title via route meta.** The route declares `meta: { title: "Settings" }`. Once the project-level route-announcer / `document.title` updater lands ([docs/ACCESSIBILITY.md §4.1](../ACCESSIBILITY.md)), the title resolves to `"Settings — willgerman.dev"` or equivalent.
    - _Verify:_ navigating to `/settings` updates `document.title` (after the announcer lands).
2. **Robots policy.** The settings view should not be indexed — it has no content of search value and may eventually expose user-visible preferences not meant for crawler retention. Add a `<meta name="robots" content="noindex">` via a `vue-meta` / `@vueuse/head` adapter when one is adopted; flag.
3. **Sitemap.** `/settings` should not appear in `public/sitemap.xml`. Note in the project's sitemap-generation plan when sitemap work begins.
    - _Verify:_ once a sitemap exists, `/settings` is absent.
4. **Canonical URL / structured data.** N/A — not content.

**Exit criterion:** title resolves correctly when the announcer lands; `noindex` and sitemap exclusion are tracked in flagged items.

## Success conditions

- Navigating to `/settings` renders an `<aside>` (containing `<MenuSidebar>`) on the left and a glassmorphic `<main>` panel on the right at viewport widths `≥ lg` (1024px); at `md` and below (`< 1024px`) the layout collapses to a vertical stack with the sidebar above the content.
- Activating a tab in `<MenuSidebar>` swaps the visible `<section role="tabpanel">` — exactly one panel lacks the `hidden` attribute at any time — without a full page reload (Vue devtools shows the view stays mounted).
- The view passes axe-core (or equivalent) for landmark hierarchy: exactly one `<main>`, exactly one `<aside>` with an accessible name, every focusable element has an accessible name, and the active tab is announced by NVDA + Firefox **and** VoiceOver + Safari.
- A keyboard-only user can land on `/settings` (e.g. via the home menu), reach the back link with `Tab`, the tab list next, the active panel after, activate any tab with `Enter`, and return to `/` via the back link — without any mouse interaction.
- `npm run test:unit` (one-shot) and the Phase 2 spec are green.

## Flagged for human review

_All items resolved 2026-06-14. Decisions below are binding for the implementing PR. Code snippets in "Generated code" above need to be updated to reflect items marked **[code change]**._

- **Default tab set. [Resolved: General, Display, Accessibility.]** Ship the three labels with ids `general`, `display`, `accessibility`. Each tab body renders a single `<p>Coming soon.</p>` under the tab's heading.

- **Back-to-home affordance. [Resolved: chevron icon in top-left of content panel.] [code change]** Render a back affordance in the top-left of the content panel (NOT in the sidebar). Implementation:
  - Use an inline SVG chevron-left (no icon library — project has none yet, adding one is out of scope). Recommended SVG: 24×24, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, with path `M15 18l-6-6 6-6`. Wrap in `<RouterLink :to="{ name: 'home' }" aria-label="Back to main menu">`.
  - Visible focus ring per [docs/ACCESSIBILITY.md](../ACCESSIBILITY.md).
  - Tap target ≥44×44px (WCAG 2.5.5).
  - **Cross-cutting flag for `_index.md`:** an icon system is not yet established. When the second SVG icon need lands, open a follow-up `feature/icon-system` plan (recommend either inline SVGs in a dedicated `src/components/icons/` directory or a tree-shakeable library like `lucide-vue-next`). This single chevron does not justify the system yet.

- **Responsive collapse breakpoint. [Resolved: `lg` (1024px).]** Sidebar visible on `lg+`; hamburger drawer (owned by `menu-sidebar`) takes over below `lg`. Better tablet-portrait experience than the `md` alternative.

- **Mobile sidebar behavior. [Resolved at sibling plan: hamburger + overlay drawer.]** Per the resolved `menu-sidebar` plan and `_index.md` cross-cutting update, the drawer machinery (focus trap, Escape close, backdrop click, body scroll lock) lives inside `MenuSidebar` itself. This view consumes it transparently. The hamburger trigger is rendered by `MenuSidebar` at the top-left of the content panel area when below the `lg` breakpoint — coordinate with the chevron back affordance position so the two controls don't overlap (recommend chevron `top-4 left-4`, hamburger `top-4 left-14` when both are visible — or hide the chevron behind the hamburger and surface it via the drawer's own header).

- **`<MenuSidebar>` prop contract. [Resolved at sibling plan.]** Consume the API the resolved `menu-sidebar` plan ships: `tabs` (array of `{ id, label, to? }`), `v-model:activeTab` (id of the active tab). The earlier draft's `tabIdFor` / `panelIdFor` / `@select` shape is replaced by the simpler `v-model:activeTab` per the sibling plan's resolution. Update the call site in "Generated code → Presentation" accordingly.

- **Shared `.glass-surface` utility. [Resolved at sibling plan: declared in app.css `@layer utilities`, owned by `menu-button` Phase 0.]** Consume `@apply glass-surface` (or the equivalent class) in the content-panel's scoped style. Name is `.glass-surface`; no further coordination needed.

- **Font token name for Barlow Condensed. [Resolved at typography-foundation: `--font-condensed`.]** Tailwind utility class is `font-condensed`. Update the template's references to use this name.

- **`name: "home"` for the home route. [Resolved at main-menu-view: confirmed `home`.]** Back-affordance link uses `{ name: "home" }`. No revision needed.

- **Glass-surface contrast under `backdrop-filter` fallback. [Resolved at sibling plan: handled by `menu-button` (utility owner).]** The fallback color (`bg-white/20` solid) is verified by `menu-button`'s accessibility audit. This view inherits the verified contrast.

- **Skip-link target / per-view `<main>` placement. [Resolved at project level: per-view `<main>`; App shell pass deferred.]** This view's `<main>` element declares `id="main-content"` (so the future skip link in App.vue can target it via `href="#main-content"` when the `accessibility-shell` feature lands). App.vue does NOT wrap `<RouterView>` in a `<main>` — each route owns its own. The current `App.vue` shell stays untouched by this PR.

- **`noindex` for `/settings`. [Resolved at project level: defer with head-management plan.]** This view emits nothing in `<head>`. Track in a future `feature/seo-head-management` plan that owns the head adapter (likely `@unhead/vue` or a small in-house composable) and applies `<meta name="robots" content="noindex">` to `/settings` at the route-meta level.

- **Reference image fidelity. [Resolved: ship best-guess draft.]** Implement to the plan as drafted (`lg:w-64` sidebar, generous content padding, no dividers between sidebar items). Iterate during PR review after a side-by-side with the reference image. Acceptable to land a follow-up `feature/settings-visual-polish` PR if the gap is meaningful.

- **Reference-image proportions for sidebar width. [Resolved: `lg:w-64` (16rem / 256px).]** Adjust during PR-review side-by-side with the reference image; non-blocking for first land.
