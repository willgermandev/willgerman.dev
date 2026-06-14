The main menu view is the SPA's primary entry point — a game-menu-style home screen with a centered title/subtitle pair and a vertical stack of three action buttons (Start, Settings, Quit). It lives in [src/views/HomeView.vue](../../src/views/HomeView.vue) (already scaffolded as an empty baseline) and registers as the `home` route at path `/` in [src/router/index.js](../../src/router/index.js). Ships on branch `feature/main-menu-view`. Sibling plans this one collaborates with: `typography-foundation` (owns `@theme` font tokens and font-face declarations), `menu-button` (owns the `<MenuButton>` component this view consumes), `settings-view` (owns the `/settings` destination), and the project's umbrella route-table coordination (this plan only registers `home`).

## Holistic overview

**Problem or opportunity.** [src/router/index.js](../../src/router/index.js) currently ships with `routes: []`, so every URL renders the empty [src/App.vue](../../src/App.vue) shell. Four scaffolded views exist under [src/views/](../../src/views/) but none are wired. [HomeView.vue](../../src/views/HomeView.vue) is the canonical baseline-template stub (`<script setup>` + empty `<template>` + `@reference "#app.css"`). The portfolio's identity — a game-menu-style landing — does not yet exist anywhere in code. Until `/` resolves to a real view, the site has no first impression.

**Approach.** Author the body of [HomeView.vue](../../src/views/HomeView.vue) to render two stacked blocks inside a centered, viewport-aware container: (1) a heading block with `<h1>` (Barlow Condensed Black, balanced wrap via `text-balance`) and a subtitle `<p>` (Barlow Light, balanced wrap); (2) a vertical button stack of three `<MenuButton>` instances — `Start` → `{ name: "project-list" }`, `Settings` → `{ name: "settings" }`, `Quit` → a click handler that attempts `window.close()` and logs an info-level fallback. Register the route in [src/router/index.js](../../src/router/index.js) with `name: "home"`, `path: "/"`, lazy-loaded via dynamic `import()`. The `<MenuButton>` component itself is **out of scope** — assumed to exist with the API documented in §Generated code; the assumption is flagged.

**Constraints.** WCAG 2.1 AA per [docs/ACCESSIBILITY.md §1](../ACCESSIBILITY.md): exactly one `<h1>` on the route, visible focus indicators on the three buttons, logical Tab order, ≥4.5:1 text contrast against the dark base, ≥3:1 non-text contrast for the focus ring. Tailwind v4 via `@theme` in [src/styles/app.css](../../src/styles/app.css) — **no `tailwind.config.js`** ([docs/DESIGN.md §1](../DESIGN.md)). Self-host fonts only ([docs/SECURITY.md §1](../SECURITY.md), [docs/DESIGN.md §3](../DESIGN.md)); no Google Fonts at runtime. `<script setup>` only ([docs/CODING_STANDARDS.md §5](../CODING_STANDARDS.md)). Prettier rules per [.prettierrc.json](../../.prettierrc.json): 4-space indent, double quotes, `singleAttributePerLine: true`. `window.close()` is refused by modern browsers on tabs not opened via `window.open` — the Quit handler must degrade gracefully. `text-balance` has broad current support (Chromium 114+, Safari 17.5+, Firefox 121+); a non-balanced wrap is the acceptable fallback in older browsers.

**Out of scope (explicit).**

- **The `<MenuButton>` component itself.** Owned by the sibling `menu-button` feature plan. This plan consumes its API and flags the assumed shape.
- **The `MenuSidebar` and `SettingsView`** target of the Settings button. Owned by `settings-view`. This plan only navigates to `{ name: "settings" }`.
- **`ProjectListView` and `ProjectDetailView`.** Owned by their respective feature plans. This plan only navigates to `{ name: "project-list" }`.
- **`ProjectCard`** component. Out of scope for this view entirely.
- **Animations / page transitions.** No entrance animation, no button hover transitions beyond what `<MenuButton>` already ships with. Motion design is a deliberate non-goal in this round.
- **Real branding copy.** Title and subtitle ship with recommended placeholder copy ("WILLGERMAN.DEV" / "A portfolio of recent work.") that the user can edit later; this plan does not block on final wording.
- **`@theme` font-token declarations.** Owned by `typography-foundation`. This plan **consumes** `font-condensed` and `font-sans` utilities; their declaration is a hard dependency surfaced in Phase 0.
- **Glassmorphic surface tokens.** Project-level concern; not used by this view.
- **`document.title` / route-change announcement plumbing** ([ACCESSIBILITY.md §4.1](../ACCESSIBILITY.md)). Owned by the route-table coordination plan, not this one — this plan ships a `meta.title` value so that plumbing has something to read when it lands.
- **Persisted state, Pinia store, composable.** The view is pure presentation + navigation; no state survives the route.

## Generated code

### Presentation — [src/views/HomeView.vue](../../src/views/HomeView.vue)

Replace the empty baseline with:

```vue
<script setup>
import MenuButton from "@/components/MenuButton.vue";

function handleQuit() {
    try {
        window.close();
    } catch {
        // window.close() throws in some environments; fall through to the info hint below.
    }
    // Browsers refuse window.close() on tabs not opened by window.open. Log a hint
    // for development; do not prompt or navigate the user.
    console.info("Tab close blocked by browser; please close this tab manually.");
}
</script>

<template>
    <section class="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-white">
        <header class="mb-12 flex flex-col items-center text-center">
            <h1 class="font-condensed text-balance text-6xl font-black tracking-wide sm:text-7xl lg:text-8xl">
                WILLGERMAN.DEV
            </h1>
            <p class="font-sans text-balance mt-4 text-lg font-light text-white/80 sm:text-xl">
                A portfolio of recent work.
            </p>
        </header>

        <nav
            class="flex w-11/12 flex-col gap-4 sm:w-1/2 md:w-1/3 lg:w-1/4"
            aria-label="Main menu"
        >
            <MenuButton
                label="START"
                :to="{ name: 'project-list' }"
            />
            <MenuButton
                label="SETTINGS"
                :to="{ name: 'settings' }"
            />
            <MenuButton
                label="QUIT"
                @click="handleQuit"
            />
        </nav>
    </section>
</template>

<style scoped>
    @reference "#app.css";
</style>
```

Notes on the shape:

- **`<h1>` is the single page heading** for this route — satisfies WCAG 2.4.6 (Headings and Labels) and 1.3.1 (Info and Relationships) per [ACCESSIBILITY.md §1.1](../ACCESSIBILITY.md).
- **`<section>` wrapper** is the layout primitive. The page's `<main>` landmark is provided by [App.vue](../../src/App.vue) (when the route-table coordination plan wires it); this view does not declare its own `<main>`.
- **`<nav aria-label="Main menu">`** groups the three action buttons under a discoverable landmark for screen-reader users (WCAG 2.4.1 — Bypass Blocks; landmarks list navigation).
- **Container width ladder**: `w-11/12 sm:w-1/2 md:w-1/3 lg:w-1/4` — wide on mobile, progressively narrower as the viewport grows. This produces a clean game-menu silhouette on large displays while leaving room for long button labels on phones. (See "Flagged for human review" — recommend the exact ladder; alternatives flagged.)
- **`text-balance`** on both title and subtitle for balanced wrap when copy hits two lines. Modern-evergreen support; non-balanced wrap is the graceful fallback.
- **Class ordering** follows the convention in [docs/FRONTEND.md §4](../FRONTEND.md): layout (`flex`, `gap-*`, `p-*`) → typography/color (`text-*`, `bg-*`, `font-*`) → state (none here yet).
- **`singleAttributePerLine`** ([.prettierrc.json](../../.prettierrc.json)) — each attribute on its own line, as already shown above. Do not collapse in review.
- **Assumed `<MenuButton>` API** — when `:to` is bound, the button renders an internal navigation control (likely `<RouterLink>` underneath) to that named route. When `@click` is bound without `:to`, the button renders a plain `<button type="button">`. `label` is the visible text. Flagged for cross-feature review with the `menu-button` plan.

### Routing — [src/router/index.js](../../src/router/index.js)

Add the `home` route. The full file becomes:

```js
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: () => import("@/views/HomeView.vue"),
            meta: { title: "Main menu" },
        },
    ],
});

export default router;
```

Notes:

- **Lazy `import()`** per [docs/CODING_STANDARDS.md §7](../CODING_STANDARDS.md). The home view is small enough that eager-loading would also be defensible (it ships on the initial bundle anyway), but lazy is the documented default and keeps the rule simple.
- **`name: "home"`** is kebab-case (single word, but the convention applies).
- **`meta.title`** is `"Main menu"` — consumed by the route-change document-title / SR-announcer wiring documented in [ACCESSIBILITY.md §4.1](../ACCESSIBILITY.md). That wiring is owned by the route-table coordination plan, not this one. Shipping `meta.title` here means the announcer has correct copy from day one.
- **`requiresAuth`** intentionally omitted — there is no auth in this project (a project-wide non-goal).

### Verification — [src/\_\_tests\_\_/HomeView.spec.js](../../src/__tests__/HomeView.spec.js)

New test file. The existing [App.spec.js](../../src/__tests__/App.spec.js) is the layout reference (mount via `@vue/test-utils`, `describe` block matches the subject):

```js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";

import HomeView from "@/views/HomeView.vue";

function mountWithRouter() {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: "/", name: "home", component: HomeView },
            { path: "/projects", name: "project-list", component: { template: "<div />" } },
            { path: "/settings", name: "settings", component: { template: "<div />" } },
        ],
    });
    return mount(HomeView, {
        global: {
            plugins: [router],
            stubs: {
                // Stub MenuButton to a button that surfaces label + emits click + exposes `to`.
                MenuButton: {
                    props: ["label", "to"],
                    template:
                        '<button type="button" :data-to="to ? JSON.stringify(to) : null" @click="$emit(\'click\')">{{ label }}</button>',
                },
            },
        },
    });
}

describe("HomeView", () => {
    it("renders the title, subtitle, and three menu buttons in order", () => {
        const wrapper = mountWithRouter();
        expect(wrapper.find("h1").text()).toBe("WILLGERMAN.DEV");
        expect(wrapper.find("p").text()).toBe("A portfolio of recent work.");

        const buttons = wrapper.findAll("button");
        expect(buttons).toHaveLength(3);
        expect(buttons[0].text()).toBe("START");
        expect(buttons[1].text()).toBe("SETTINGS");
        expect(buttons[2].text()).toBe("QUIT");
    });

    it("wires Start and Settings to their named routes", () => {
        const wrapper = mountWithRouter();
        const buttons = wrapper.findAll("button");
        expect(JSON.parse(buttons[0].attributes("data-to"))).toEqual({ name: "project-list" });
        expect(JSON.parse(buttons[1].attributes("data-to"))).toEqual({ name: "settings" });
        expect(buttons[2].attributes("data-to")).toBeNull();
    });

    describe("Quit", () => {
        let originalClose;
        let infoSpy;

        beforeEach(() => {
            originalClose = window.close;
            infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
        });

        afterEach(() => {
            window.close = originalClose;
            infoSpy.mockRestore();
        });

        it("calls window.close() and logs the documented hint when the browser refuses", async () => {
            const closeSpy = vi.fn();
            window.close = closeSpy;

            const wrapper = mountWithRouter();
            await wrapper.findAll("button")[2].trigger("click");

            expect(closeSpy).toHaveBeenCalledTimes(1);
            expect(infoSpy).toHaveBeenCalledWith(
                "Tab close blocked by browser; please close this tab manually.",
            );
        });

        it("logs the documented hint even if window.close() throws", async () => {
            window.close = () => {
                throw new Error("blocked");
            };

            const wrapper = mountWithRouter();
            await wrapper.findAll("button")[2].trigger("click");

            expect(infoSpy).toHaveBeenCalledWith(
                "Tab close blocked by browser; please close this tab manually.",
            );
        });
    });
});
```

The `App.spec.js` test currently asserts on the placeholder `"You did it!"` string in [App.vue](../../src/App.vue). [App.vue](../../src/App.vue) is **not** in scope for this plan, so that test is left alone — but the route-table coordination plan that replaces [App.vue](../../src/App.vue)'s body with a `<RouterView>` will need to update [App.spec.js](../../src/__tests__/App.spec.js) accordingly. Flagged.

## Phased implementation plan

### Phase 0 — Dependency on `typography-foundation`

`docs/DESIGN.md §3` prescribes self-hosted Barlow + Barlow Condensed with `@theme` font tokens (`--font-condensed`, `--font-sans`) and corresponding `@font-face` declarations in [src/styles/app.css](../../src/styles/app.css). [src/styles/app.css](../../src/styles/app.css) currently has neither — it ships with only `@import "tailwindcss"` + `@plugin "@tailwindcss/typography"`. **The Tailwind utilities `font-condensed`, `font-sans`, `font-black`, and `font-light` used in [HomeView.vue](../../src/views/HomeView.vue) only render the intended typefaces once `typography-foundation` lands.**

This plan does **not** declare those tokens — that's owned by the `typography-foundation` plan, per the project-level fan-out. Without it:

- `font-condensed` resolves to nothing → the browser falls back to the user-agent default; the headline reads in the system sans rather than Barlow Condensed.
- `font-sans` resolves to Tailwind v4's default sans stack — readable but off-brand.
- `font-black` / `font-light` still apply as numeric weights (900 / 300), but synthesis on a fallback face looks uneven.

**Exit criterion:** `typography-foundation` is merged (or at minimum its `@theme` block is in [src/styles/app.css](../../src/styles/app.css)) before this plan's Phase 1 begins. If it's not, this plan's `Verify:` lines for visual fidelity in Phase 1 will fail — flag and revisit.

### Phase 1 — Feature build-out

End-of-phase invariant: a fresh `npm run dev` renders [HomeView.vue](../../src/views/HomeView.vue) at `/`, with the title, subtitle, and three buttons displayed; clicking Start, Settings, Quit produces the documented behaviors.

1. **Register the `home` route** in [src/router/index.js](../../src/router/index.js) per §Generated code.
   - _Verify:_ `npm run dev` → navigate to `http://localhost:5173/` → the route resolves (no longer renders the empty `App.vue` placeholder); browser devtools route panel shows `name: "home"`.
2. **Author [src/views/HomeView.vue](../../src/views/HomeView.vue)** per §Generated code — the heading block, the nav with three `<MenuButton>` instances, the `handleQuit` handler. Do **not** create [src/components/MenuButton.vue](../../src/components/MenuButton.vue) — the `menu-button` plan owns that. Until it lands, `import MenuButton from "@/components/MenuButton.vue"` will fail at dev-server time.
   - _Verify (after `menu-button` is merged):_ visual inspection at `/` shows the title in the heavy condensed face, the subtitle in the light sans face, three uppercase buttons stacked vertically with a consistent gap, on a black background.
   - _Verify (interactively):_ clicking START navigates to `/projects`; clicking SETTINGS navigates to `/settings`; clicking QUIT calls `window.close()` and logs the documented `console.info` hint when the browser refuses.
3. **Run `npm run format`** to apply Prettier (4-space indent, double quotes, `singleAttributePerLine: true`).
   - _Verify:_ `npx prettier --check src/views/HomeView.vue src/router/index.js` exits 0.

Exit criteria for Phase 1:

- [HomeView.vue](../../src/views/HomeView.vue) renders without console errors when `menu-button` is present.
- The three buttons produce the documented click outcomes.
- The home route is registered with `name: "home"` and lazy-loaded.

### Phase 2 — Unit and integration tests

End-of-phase invariant: the test suite contains [HomeView.spec.js](../../src/__tests__/HomeView.spec.js) with the assertions from §Generated code, and `npm run test:unit -- --run` passes.

1. **Create [src/\_\_tests\_\_/HomeView.spec.js](../../src/__tests__/HomeView.spec.js)** per §Generated code. The `<MenuButton>` component is stubbed in the test so the suite is independent of the `menu-button` feature's progress.
   - _Verify:_ `npx vitest run src/__tests__/HomeView.spec.js` passes.
2. **Confirm route table is exercised** by the integration test (the test mounts with a memory-history router containing `home`, `project-list`, `settings`).
   - _Verify:_ the test asserts the `data-to` payload for Start and Settings matches `{ name: "project-list" }` and `{ name: "settings" }`.
3. **Confirm Quit behavior is tested** end-to-end via the `window.close` and `console.info` spies — both the "browser swallowed it silently" and "browser threw" paths.
   - _Verify:_ both Quit-specific tests pass.

Exit criteria for Phase 2:

- `npm run test:unit -- --run` exits 0 with the new spec included.
- No console errors during the test run (Vitest will surface them).

### Phase 3 — Security and risk audit

The view has **no user-controlled input** and makes **no network calls**, so the SPA XSS surface ([docs/SECURITY.md §3](../SECURITY.md)) is minimal. The items below cover the small surface that does exist.

1. **No `v-html`.** Confirm by inspection — the view renders only static text and the `<MenuButton>` slot/prop API.
   - _Verify:_ `grep -n "v-html" src/views/HomeView.vue` produces no output.
2. **No dynamic `:href` / `:src`.** Confirm by inspection — the buttons take a static `{ name }` object as their `:to` prop.
   - _Verify:_ `grep -nE "v-bind:href|v-bind:src|:href=|:src=" src/views/HomeView.vue` produces no output.
3. **No third-party CDN assets.** Confirm fonts are consumed via the `@theme` tokens from `typography-foundation` (self-hosted woff2 in `src/assets/fonts/`), per [docs/SECURITY.md §1](../SECURITY.md) and [docs/DESIGN.md §3](../DESIGN.md).
   - _Verify:_ this view does not introduce any external font URL; the dependency is on `typography-foundation`'s self-hosted declaration.
4. **`window.close()` is not a credential leak.** It does not transmit any data and cannot be coerced into one. The `console.info` hint contains no PII.
   - _Verify:_ inspection — the log string is the literal documented in this plan.
5. **No `console.log`** left behind. The documented `console.info` for Quit is intentional, project policy ([docs/SECURITY.md §10.1](../SECURITY.md)) prohibits sensitive data in console output. The string is benign.
   - _Verify:_ `grep -n "console\." src/views/HomeView.vue` returns exactly one line, matching the documented `console.info` call.

Exit criteria for Phase 3: all five `Verify:` checks pass; no findings escalate to "blocker" or "follow-up branch."

### Phase 4 — Accessibility audit

Target standard: WCAG 2.1 AA + Section 508 per [docs/ACCESSIBILITY.md](../ACCESSIBILITY.md). The view's surface is small, and most of the heavy-lifting accessibility work for the page (focus styles on the buttons, ARIA on the buttons themselves) is owned by `<MenuButton>`. This phase audits what this view contributes.

1. **Single `<h1>` per route, no skipped levels.** This view ships a single `<h1>` and no subordinate headings. The subtitle is a `<p>`, not an `<h2>` — correct, since it's a tagline, not a section heading.
   - _Verify:_ axe DevTools on `/` reports zero heading-related violations; screen-reader headings list (NVDA `H`, VoiceOver `VO+U`) shows exactly one entry.
2. **Tab order is logical.** No `<a>` or `<button>` precedes the three menu buttons; Tab visits START → SETTINGS → QUIT in DOM order. The title and subtitle are not focusable (they're plain text, not links).
   - _Verify:_ keyboard-only walkthrough ([ACCESSIBILITY.md §3.3](../ACCESSIBILITY.md)) from a freshly-loaded `/` — Tab enters the first button, Tab visits the second, Tab visits the third. Shift+Tab walks backwards in the reverse order.
3. **Focus indicator is visible** on each button. Provided by `<MenuButton>`'s own styling — this plan asserts only that nothing in this view overrides or hides it (no `outline-none` on the `<nav>`, no `*:focus { outline: none }` in the scoped style).
   - _Verify:_ visual inspection — Tab to each button on both light and dark surrounding surfaces (the view itself is dark, but the focus ring must still meet ≥3:1 against black per WCAG 1.4.11).
4. **Color contrast** — title (`text-white` on `bg-black`) is 21:1, far above 4.5:1. Subtitle (`text-white/80` on `bg-black`) computes as ~16.8:1 — also passes. Button contrast is owned by `<MenuButton>`.
   - _Verify:_ axe DevTools reports no contrast violations for the title or subtitle.
5. **`text-balance` does not break layout** under WCAG 1.4.10 (Reflow). At 320 CSS pixels (the WCAG-required floor), the title and subtitle must remain readable without horizontal scroll.
   - _Verify:_ DevTools device emulation → 320 px wide → title wraps to multiple lines, no horizontal scroll, no clipped text. If `text-balance` is unsupported (older browser), the wrap is uneven but still legible — acceptable fallback.
6. **`<nav aria-label="Main menu">`** distinguishes this from any other future `<nav>` on the page (e.g. a future top-bar).
   - _Verify:_ screen-reader landmarks list shows "Main menu, navigation" as an entry.
7. **`<html lang="en">`** is already set in [index.html](../../index.html) — this view inherits it. No additional `lang` attributes required.
   - _Verify:_ inspection of [index.html](../../index.html).
8. **Section 508 §502.3 / WCAG 4.1.2** — the three `<MenuButton>` instances each expose a programmatic role (button or link, depending on whether `:to` is bound), name (the `label` prop), and state (focused / not focused). Confirmation depends on `<MenuButton>`'s implementation; flagged in cross-cutting interactions.

Exit criteria for Phase 4: items 1–7 verified; item 8 flagged for confirmation against the `menu-button` plan.

### Phase 5 — Search-engine-optimization audit

The site is a personal portfolio — `/` is the primary indexable entry point.

1. **`document.title` reflects the route.** Set by the route-table coordination plan via `router.afterEach`. This plan ships `meta.title: "Main menu"` so the coordination plan has accurate copy.
   - _Verify:_ once the coordination plan lands, the browser tab shows `Main menu — willgerman.dev` (or whatever the project-level title format is) on `/`.
2. **`<h1>` is meaningful** ("WILLGERMAN.DEV" + a descriptive subtitle). The literal string is a name; the subtitle carries the topical signal.
   - _Verify:_ Lighthouse SEO audit on `/` reports a passing heading hierarchy.
3. **`/` is included in [public/sitemap.xml](../../public/sitemap.xml)** before the first production deploy. Currently empty — [FRONTEND.md §11](../FRONTEND.md) flags this as a deploy blocker. This plan is the first user-visible route to land, so this plan can either populate `sitemap.xml` minimally or defer to the project-level deploy plan.
   - _Verify:_ `cat public/sitemap.xml` contains a `<loc>` entry for `/` (or the absolute equivalent). Flagged: who owns sitemap maintenance.
4. **Canonical URL.** Not yet configured — the project lacks a `<link rel="canonical">` strategy. For a single-route SPA this is low-stakes; for a portfolio with `/projects/:slug` deep links it becomes relevant. Out of scope for this view; flagged at project level.
5. **Meta description.** [index.html](../../index.html) currently lacks `<meta name="description">`. Adding it is project-shell work, not this view's concern — flagged.
6. **`robots.txt`** is empty — parses as "allow all", which is acceptable for a portfolio. [FRONTEND.md §11](../FRONTEND.md) notes this. No action required for `home` to be indexable.

Exit criteria for Phase 5: items 1, 2, 6 verified; items 3, 4, 5 explicitly deferred to project-level coordination with named flags.

## Success conditions

- **Navigating to `/` in a freshly built dev server renders the documented layout.** A centered title in Barlow Condensed Black, a centered subtitle in Barlow Light beneath it (both with `text-balance` wrap), and three uppercase `<MenuButton>` instances labeled START, SETTINGS, QUIT stacked vertically with a consistent gap, all on a black background. Verified manually and by Phase 2's test assertions on title, subtitle, and button labels.
- **Each menu button produces the documented behavior.** START routes to `{ name: "project-list" }`, SETTINGS routes to `{ name: "settings" }`, QUIT invokes `window.close()` and emits the literal `console.info("Tab close blocked by browser; please close this tab manually.")` when the browser refuses or throws. Verified by Phase 2's `HomeView.spec.js`.
- **Keyboard navigation order is Tab → START → SETTINGS → QUIT, each with a visible focus ring.** No focusable element precedes the buttons (the title and subtitle are plain text). The focus indicator on each button meets WCAG 1.4.11 (≥3:1 against the black background). Verified by Phase 4's keyboard-only walkthrough.
- **The `home` route is registered with `name: "home"` at path `/`, lazy-loaded.** Verifiable by inspection of [src/router/index.js](../../src/router/index.js) and by `npm run build` succeeding without warning (lazy chunks are emitted as separate `dist/assets/HomeView-*.js`).

## Flagged for human review

_All items resolved 2026-06-14. Decisions below are binding for the implementing PR._

- **Container-width ladder. [Resolved: `w-11/12 sm:w-1/2 md:w-1/3 lg:w-1/4`.]** Ship the ladder as written. Game-menu silhouette on large displays; phones get a wide-but-margined stack.

- **Placeholder copy. [Resolved: defer copy entirely.] [code change]** Ship with placeholder strings clearly marked as TBD:
  - Title: `"[Title placeholder — TBD]"`
  - Subtitle: `"[Subtitle placeholder — TBD]"`

  A content sweep before public launch replaces both. Add a `<!-- TBD content -->` comment above the heading block in [HomeView.vue](../../src/views/HomeView.vue) so the placeholder is grep-able. Update the success conditions in this plan: visual verification now passes when the placeholders render in Barlow Condensed Black / Barlow Light respectively — the exact wording is not gated.

- **Assumed `<MenuButton>` API shape. [Resolved: confirmed by `menu-button` plan.]** Per the resolved `menu-button` plan: `<MenuButton :label :to />` for navigation (renders `<RouterLink>` with link semantics), `<MenuButton :label @click />` for actions (renders `<button type="button">` with `defineEmits(['click'])`). This plan's assumption holds — no revision needed.

- **`window.close()` behavior. [Resolved at project level: ship as written.]** Per `_index.md`, the Quit handler attempts `window.close()` inside a `try/catch` and falls back to `console.info("Tab close blocked by browser; please close this tab manually.")`. No user prompt, no navigation, no banner. Document the limitation in the README when one lands.

- **Sitemap maintenance ownership. [Resolved at project level: deferred to the deploy plan.]** This plan ships nothing for [public/sitemap.xml](../../public/sitemap.xml). The future deploy / project-shell plan populates it with all four routes when it lands. Cross-reference this resolution in the PR description so reviewers don't expect a sitemap update here.

- **`<meta name="description">` and `<link rel="canonical">`. [Resolved at project level: deferred to the SEO / deploy plan.]** This view emits nothing in `<head>` directly. Ship `meta.title: "Main menu"` in the route definition so the future route-change announcer plumbing has correct copy to read; everything else `<head>`-related is the SEO plan's responsibility.

- **Coordination with the route-table plan. [Resolved at project level: deferred until 2nd route lands.]** Per `_index.md`, the `App.vue` shell pass (skip-link, `<RouterView>` wiring, route announcer, document.title plumbing) is deferred until a second route is live. This plan registers exactly one route (`home`); the existing `App.spec.js` is not touched by this PR — leave it alone until the shell pass updates it. Also: add a temporary catch-all route `{ path: '/:pathMatch(.*)*', redirect: { name: 'home' } }` per `_index.md`'s 404 default so unknown URLs don't render an empty `App.vue`.

- **`typography-foundation` hard dependency. [Resolved at project level: build order guarantees it ships first.]** Per `_index.md`, `typography-foundation` is feature #1 in the build order. By the time this view's Phase 1 lands, `--font-condensed`, `--font-sans`, and the Barlow `@font-face` declarations exist. No additional gating needed.
