# menu-sidebar

A reusable `MenuSidebar.vue` SFC that renders a vertical `<aside>` of navigational tabs, parent-driven via `v-model:activeTab`. Lives in [src/components/MenuSidebar.vue](../../src/components/MenuSidebar.vue) and is consumed first by [SettingsView.vue](../../src/views/SettingsView.vue) but designed to be re-used anywhere a side-of-screen tab list is appropriate. Ships on branch `feature/menu-sidebar` as part of the broader `willgerman-portfolio` project (see sibling plans under [docs/feature-plans/](.)).

## Holistic overview

**Problem.** [SettingsView.vue](../../src/views/SettingsView.vue) (and other future views) needs a sidebar-style tab list — vertical, labels-only, parent-owned active state — to switch between settings panes. There is no existing component for this; [src/components/](../../src/components/) currently contains only empty SFC stubs ([MenuButton.vue](../../src/components/MenuButton.vue), [Modal.vue](../../src/components/Modal.vue), [ProjectCard.vue](../../src/components/ProjectCard.vue)). Without a shared sidebar component, every consumer would re-implement focus management, ARIA semantics, and active-state styling — that's exactly the kind of duplication [CODING_STANDARDS.md §2](../CODING_STANDARDS.md) tells us to consolidate.

**Approach.** A single SFC that takes a `tabs` array (each entry is `{ id, label }` or `{ id, label, to }`) and a controlled `activeTab` id. It emits `update:activeTab` so a parent can write `<MenuSidebar v-model:activeTab="active" :tabs="tabs" />`. Each tab is a native `<button type="button">` (or `<RouterLink>` when the entry carries `to`) inside an `<aside>` landmark with `aria-label="…"`. Visual state: white text on the black base, with the active tab marked by an inverted "glass" surface plus a left accent bar — both consume project-level design tokens that the `settings-view` plan and the project-wide `design-tokens` work are expected to introduce. Keyboard model: native Tab cycles through the tabs; Up / Down arrow keys move focus + activate the focused tab (the WAI-ARIA "automatic activation" tabs pattern, suitable when switching panels is cheap). Focus ring is a `focus-visible:` Tailwind ring that meets the 3:1 non-text contrast minimum from [ACCESSIBILITY.md §1.1 (1.4.11)](../ACCESSIBILITY.md) against the black background.

**Constraints.**

- WCAG 2.1 AA per [ACCESSIBILITY.md](../ACCESSIBILITY.md): visible focus (2.4.7), full keyboard operability (2.1.1), no keyboard trap (2.1.2), 4.5:1 text contrast on labels (1.4.3) and 3:1 on the focus indicator (1.4.11), accessible name on the landmark (1.3.1 / 4.1.2), state announced as "selected" / "current" (4.1.2).
- Vue 3 `<script setup>` + Composition API, props in object form, kebab-case emit name (`update:activeTab` — Vue's documented v-model emit name is the one exception to the kebab-case rule and is what `defineEmits` expects for two-way binding).
- Tailwind v4 only (no `tailwind.config.js`); tokens consumed via `@theme` declared in [src/styles/app.css](../../src/styles/app.css). The active-tab "glass surface" and accent border tokens **do not exist yet** — [src/styles/app.css](../../src/styles/app.css) currently has only `@import "tailwindcss"` + `@plugin "@tailwindcss/typography"`. See "Out of scope" and "Flagged for human review" below.
- Prettier per [.prettierrc.json](../../.prettierrc.json): 4-space indent, double quotes, semicolons, `printWidth: 100`, `singleAttributePerLine: true`.
- Component must be parent-driven: no internal router coupling beyond rendering `<RouterLink :to="…">` when the parent supplies a `to`; no persisted active-tab state of its own.

**Out of scope.**

- **Design tokens and the `glass-surface` utility.** Declared project-wide and consumed here; this plan does not redefine them. If the tokens haven't landed by Phase 1 the plan introduces a small **Phase 0** that adds a minimal token + utility set scoped to this component's needs, with explicit instructions to fold them into the project-level design system later. Flagged.
- **SettingsView layout** (where the sidebar sits, mobile collapse behavior in that view). Owned by the sibling `settings-view` plan.
- **Mobile / overlay drawer behavior.** The component renders the same `<aside>` at every breakpoint in this round; collapsing or overlay semantics are deferred to whichever consuming view first needs them. Flagged.
- **Icon support inside tabs.** No `icon` prop; labels are text only.
- **Route registration.** When a tab carries `to`, the component renders a `<RouterLink>` to it, but the route must already exist in [src/router/index.js](../../src/router/index.js). The component is not responsible for verifying that.
- **Persisted active-tab state.** Parent owns the `v-model` binding; if persistence is wanted, the parent stores it (Pinia + `pinia-plugin-persistedstate`, per [FRONTEND.md §9](../FRONTEND.md)).
- **Roving tabindex / WAI-ARIA `tablist` role.** Decided against in this round — see Phase 1 step 2.

## Generated code

### Component

The full SFC lives at [src/components/MenuSidebar.vue](../../src/components/MenuSidebar.vue). Code shown is what Phase 1 produces.

```vue
<script setup>
    import { computed, ref } from "vue";

    const props = defineProps({
        tabs: {
            type: Array,
            required: true,
            validator: (value) =>
                Array.isArray(value) &&
                value.every(
                    (tab) =>
                        tab &&
                        typeof tab.id === "string" &&
                        typeof tab.label === "string" &&
                        (tab.to === undefined ||
                            typeof tab.to === "string" ||
                            typeof tab.to === "object"),
                ),
        },
        activeTab: {
            type: String,
            default: null,
        },
        ariaLabel: {
            type: String,
            default: "Section navigation",
        },
    });

    const emit = defineEmits(["update:activeTab"]);

    const buttonRefs = ref([]);

    function setButtonRef(element, index) {
        if (element) {
            buttonRefs.value[index] = element;
        }
    }

    const activeIndex = computed(() =>
        props.tabs.findIndex((tab) => tab.id === props.activeTab),
    );

    function selectTab(tab) {
        if (tab.id !== props.activeTab) {
            emit("update:activeTab", tab.id);
        }
    }

    function focusAndSelect(index) {
        const wrapped = (index + props.tabs.length) % props.tabs.length;
        const target = buttonRefs.value[wrapped];
        if (target) {
            target.focus();
            selectTab(props.tabs[wrapped]);
        }
    }

    function handleKeydown(event, index) {
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                focusAndSelect(index + 1);
                break;
            case "ArrowUp":
                event.preventDefault();
                focusAndSelect(index - 1);
                break;
            case "Home":
                event.preventDefault();
                focusAndSelect(0);
                break;
            case "End":
                event.preventDefault();
                focusAndSelect(props.tabs.length - 1);
                break;
        }
    }
</script>

<template>
    <aside
        class="menu-sidebar"
        :aria-label="ariaLabel"
    >
        <ul
            class="menu-sidebar__list"
            role="list"
        >
            <li
                v-for="(tab, index) in tabs"
                :key="tab.id"
                class="menu-sidebar__item"
            >
                <RouterLink
                    v-if="tab.to"
                    :ref="(element) => setButtonRef(element?.$el ?? element, index)"
                    :to="tab.to"
                    class="menu-sidebar__tab"
                    :class="{ 'menu-sidebar__tab--active': tab.id === activeTab }"
                    :aria-current="tab.id === activeTab ? 'page' : undefined"
                    @click="selectTab(tab)"
                    @keydown="handleKeydown($event, index)"
                >
                    {{ tab.label }}
                </RouterLink>
                <button
                    v-else
                    :ref="(element) => setButtonRef(element, index)"
                    type="button"
                    class="menu-sidebar__tab"
                    :class="{ 'menu-sidebar__tab--active': tab.id === activeTab }"
                    :aria-pressed="tab.id === activeTab"
                    @click="selectTab(tab)"
                    @keydown="handleKeydown($event, index)"
                >
                    {{ tab.label }}
                </button>
            </li>
        </ul>
    </aside>
</template>

<style scoped>
    @reference "#app.css";

    .menu-sidebar {
        @apply flex h-full w-full flex-col text-white;
    }

    .menu-sidebar__list {
        @apply flex flex-col gap-1 p-0;
    }

    .menu-sidebar__item {
        @apply list-none;
    }

    .menu-sidebar__tab {
        @apply relative block w-full rounded-md px-4 py-2 text-left
               text-sm font-medium text-white/80
               transition-colors
               hover:text-white
               focus-visible:outline-none focus-visible:ring-2
               focus-visible:ring-white focus-visible:ring-offset-2
               focus-visible:ring-offset-black;
    }

    .menu-sidebar__tab--active {
        @apply bg-white/10 text-white;
    }

    .menu-sidebar__tab--active::before {
        content: "";
        @apply absolute top-1/4 bottom-1/4 left-0 w-1 rounded-r-md bg-white;
    }
</style>
```

### Test

A new colocated spec at [src/\_\_tests\_\_/MenuSidebar.spec.js](../../src/__tests__/MenuSidebar.spec.js) — Vitest + `@vue/test-utils`, following the layout in [CODING_STANDARDS.md §8](../CODING_STANDARDS.md). Covers:

```js
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";

import MenuSidebar from "@/components/MenuSidebar.vue";

const tabs = [
    { id: "profile", label: "Profile" },
    { id: "notifications", label: "Notifications" },
    { id: "appearance", label: "Appearance" },
];

describe("MenuSidebar", () => {
    it("renders an aside landmark with the provided accessible name", () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile", ariaLabel: "Settings navigation" },
        });
        const aside = wrapper.find("aside");
        expect(aside.exists()).toBe(true);
        expect(aside.attributes("aria-label")).toBe("Settings navigation");
    });

    it("renders one button per tab with the matching label", () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile" },
        });
        const buttons = wrapper.findAll("button");
        expect(buttons).toHaveLength(tabs.length);
        expect(buttons.map((button) => button.text())).toEqual([
            "Profile",
            "Notifications",
            "Appearance",
        ]);
    });

    it("marks the active tab as pressed and emits update:activeTab on click", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile" },
        });
        const buttons = wrapper.findAll("button");
        expect(buttons[0].attributes("aria-pressed")).toBe("true");
        expect(buttons[1].attributes("aria-pressed")).toBe("false");

        await buttons[1].trigger("click");
        expect(wrapper.emitted("update:activeTab")).toEqual([["notifications"]]);
    });

    it("does not re-emit when the active tab is clicked again", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile" },
        });
        await wrapper.findAll("button")[0].trigger("click");
        expect(wrapper.emitted("update:activeTab")).toBeUndefined();
    });

    it("moves focus and emits on ArrowDown", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile" },
            attachTo: document.body,
        });
        const buttons = wrapper.findAll("button");
        await buttons[0].trigger("keydown", { key: "ArrowDown" });
        expect(wrapper.emitted("update:activeTab")).toEqual([["notifications"]]);
        expect(document.activeElement).toBe(buttons[1].element);
        wrapper.unmount();
    });

    it("wraps focus from the last tab to the first on ArrowDown", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "appearance" },
            attachTo: document.body,
        });
        const buttons = wrapper.findAll("button");
        await buttons[2].trigger("keydown", { key: "ArrowDown" });
        expect(wrapper.emitted("update:activeTab")).toEqual([["profile"]]);
        wrapper.unmount();
    });

    it("jumps to first and last via Home and End", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "notifications" },
            attachTo: document.body,
        });
        const buttons = wrapper.findAll("button");
        await buttons[1].trigger("keydown", { key: "End" });
        await buttons[2].trigger("keydown", { key: "Home" });
        expect(wrapper.emitted("update:activeTab")).toEqual([["appearance"], ["profile"]]);
        wrapper.unmount();
    });
});
```

### Conditional Phase 0 primitives (only if design tokens have not landed)

If `app.css` still has no `@theme` block when this feature is built, Phase 0 adds the **minimum** subset of tokens this component needs — colors `--color-surface`, `--color-surface-content`, plus the `glass-surface` and `accent-border` rules that the active-tab style currently expresses inline with `bg-white/10` and the `::before` pseudo. Folded into [src/styles/app.css](../../src/styles/app.css) so the component's `<style scoped>` block can swap to `@apply bg-surface text-surface-content glass-surface accent-border` once those exist.

## Phased implementation plan

### Phase 0 — Establish missing primitives _(conditional)_

Run this phase only if `app.css` still has no `@theme` block (and no `glass-surface` / accent token) when the feature starts. If the project-wide design-tokens work has already landed, **skip Phase 0** and consume the existing tokens directly inside Phase 1's style block.

Summary at phase end: the smallest viable set of tokens and utilities the active-tab style depends on are declared in [src/styles/app.css](../../src/styles/app.css) and are importable.

1. Add a `@theme` block to [src/styles/app.css](../../src/styles/app.css) declaring `--color-surface: oklch(0 0 0)` (project base black per the project description) and `--color-surface-content: oklch(1 0 0)` (white text). _Verify:_ `bg-surface` and `text-surface-content` resolve in DevTools when applied to a probe element in `App.vue`.
2. Add a `glass-surface` utility via `@layer utilities { .glass-surface { background-color: color-mix(in oklch, var(--color-surface-content) 10%, transparent); } }` so the active-tab background can swap from the inline `bg-white/10` to `@apply glass-surface`. _Verify:_ a probe element with `class="glass-surface"` shows a 10% white-over-black tint in DevTools.
3. (Optional, only if the `::before` accent recurs across components.) Promote the active-tab left-bar to a `.accent-bar-left` utility under the same `@layer utilities` block. _Verify:_ a probe element with `class="accent-bar-left"` renders the bar.

Exit criterion: every primitive the Phase 1 component imports is resolvable from `app.css`. Flag that these are stop-gap primitives owned by this plan and should be reconciled with the project-wide tokens once they land.

### Phase 1 — Feature build-out

Summary at phase end: [src/components/MenuSidebar.vue](../../src/components/MenuSidebar.vue) is fully implemented and renders the sidebar as described in "Generated code".

1. Replace the empty stub at [src/components/MenuSidebar.vue](../../src/components/MenuSidebar.vue) with the full SFC from "Generated code" above. _Verify:_ `npm run dev` and a temporary `<MenuSidebar :tabs="…" v-model:activeTab="active" />` mount in [App.vue](../../src/App.vue) renders the sidebar; clicking a tab updates `active`.
2. Decide explicitly **not** to use `role="tablist"` / `role="tab"` / `aria-selected`. Rationale: the WAI-ARIA tabs pattern is for **co-located tabs + panels** where the tab activates a corresponding `<div role="tabpanel">` in the same focus context. Settings-style sidebars where the "panel" is a separate region (or a separate route) are better-served by the simpler "list of buttons with `aria-pressed`" pattern, which carries no implied focus-management contract beyond what the keyboard handler supplies. Document this decision in an inline `// NOTE:` comment near the keydown handler.
3. Add **`Home` and `End` key handlers** in addition to `ArrowUp` / `ArrowDown`, matching the keyboard-pattern intent the scope calls out. Wrapping behavior (last → first on `ArrowDown`, first → last on `ArrowUp`) is included; document inline if the consumer needs non-wrapping behavior they can fork. _Verify:_ manual keyboard pass (Phase 4) confirms all four keys behave as documented.
4. Add the `ariaLabel` prop with the documented default `"Section navigation"`. Consumers are expected to pass a more specific label (e.g. `"Settings navigation"`). _Verify:_ test from "Generated code" covering the custom `ariaLabel` passes.
5. Run `npm run format` so the new file conforms to the Prettier config in [.prettierrc.json](../../.prettierrc.json) before commit. _Verify:_ `npx prettier --check src/components/MenuSidebar.vue` exits 0.

Exit criterion: the component renders, the active state is visually distinguished, the keyboard handler responds to all four documented keys, and the SFC matches the baseline template from [CODING_STANDARDS.md §5](../CODING_STANDARDS.md) (script → template → style with `@reference "#app.css"`).

### Phase 2 — Unit and integration tests

Summary at phase end: [src/\_\_tests\_\_/MenuSidebar.spec.js](../../src/__tests__/MenuSidebar.spec.js) covers the documented behavior and runs green under `npm run test:unit`.

1. Add the spec from "Generated code". _Verify:_ `npx vitest run src/__tests__/MenuSidebar.spec.js` exits 0 with all seven tests passing.
2. Mount with `mount()` from `@vue/test-utils` (not `shallowMount`); per [CODING_STANDARDS.md §8](../CODING_STANDARDS.md). _Verify:_ no `stubs:` or `shallow:` in the spec.
3. The two arrow-key tests use `attachTo: document.body` so `document.activeElement` updates under jsdom; the spec calls `wrapper.unmount()` to clean up. _Verify:_ the suite runs without "should be attached to body" warnings.

Exit criterion: all seven assertions pass; the spec colocates under `src/__tests__/` per the standards doc; tests assert on rendered output and emitted events, never on internal refs.

### Phase 3 — Security and risk audit

Summary at phase end: the component is reviewed against [SECURITY.md](../SECURITY.md) and the surface is documented.

1. **No user input** flows through the component — `tabs[].label` is rendered through Vue's interpolation (`{{ tab.label }}`), which is HTML-escaped by default. `tab.to` is passed to `<RouterLink :to>` which the router validates. _Verify:_ inspect the rendered HTML for `<script>` injection via a deliberately malicious label in a manual probe; confirm it is escaped.
2. **No external requests, no third-party SDK, no `eval` / `Function` constructor, no `v-html`.** _Verify:_ `git grep -nE 'v-html|innerHTML|new Function|eval\\(' src/components/MenuSidebar.vue` returns no hits.
3. **No persisted state, no `localStorage` / `sessionStorage` writes.** _Verify:_ same `git grep` against `localStorage|sessionStorage|cookie`.

Exit criterion: nothing in the component widens the SPA's attack surface beyond what already-trusted parent props inject. Documented in a one-line PR-description note.

### Phase 4 — Accessibility audit

Summary at phase end: the component meets WCAG 2.1 AA per [ACCESSIBILITY.md §1](../ACCESSIBILITY.md), spot-checked manually and with axe-core.

1. **Landmark.** Confirm `<aside aria-label="…">` shows up in the Chrome DevTools Accessibility tree as a `complementary` landmark with the accessible name from the prop. Maps to WCAG 1.3.1, 4.1.2.
2. **Keyboard pass per [ACCESSIBILITY.md §3.3](../ACCESSIBILITY.md).** Tab into the first tab; Tab again leaves the sidebar (no trap). ArrowDown / ArrowUp / Home / End cycle through entries and emit. Enter / Space on the focused button activates (default `<button>` semantics — no extra handler needed). _Verify:_ manual walkthrough produces the expected behavior at every step.
3. **Focus visibility (WCAG 2.4.7, 1.4.11).** White `focus-visible:ring-white` on `bg-black` is well above 3:1 — confirmed in the WebAIM Contrast Checker (white vs. black is ~21:1). _Verify:_ keyboard-focus a tab; the ring is clearly visible.
4. **Label contrast (WCAG 1.4.3).** Inactive labels are `text-white/80` over `bg-black` — `oklch(1 0 0)` at 80% alpha over `oklch(0 0 0)` resolves to approximately `oklch(0.85 0 0)` perceived lightness, contrast against black ≈ 14:1, comfortably above 4.5:1. Active labels are full `text-white`. _Verify:_ measure with Chrome DevTools' contrast picker on a deployed-preview surface.
5. **Active-state announcement.** Screen reader reads the active tab as "Profile, button, pressed" (NVDA + Firefox) or the equivalent VoiceOver phrasing. For the `<RouterLink>` variant the `aria-current="page"` is announced as "current page". _Verify:_ manual SR pass per [ACCESSIBILITY.md §3.4](../ACCESSIBILITY.md).
6. **`prefers-reduced-motion`.** The component uses only `transition-colors`, which is non-essential motion. Per [DESIGN.md §10](../DESIGN.md), gate it: change `transition-colors` to `transition-colors motion-reduce:transition-none`. _Verify:_ in OS reduced-motion mode, the hover color change is instant.

Exit criterion: all six checks pass; an `axe-core` scan via DevTools (run against the dev preview with the component mounted in [App.vue](../../src/App.vue)) returns zero violations attributable to `MenuSidebar`.

### Phase 5 — Search-engine-optimization audit

_N/A — `MenuSidebar` is a presentational component with no route, no metadata, and no public-facing URL surface of its own. SEO concerns are owned by the consuming view (which sets `<title>`, meta, etc.); this component is invisible to crawlers in the SEO-relevant sense._

## Success conditions

- `<MenuSidebar :tabs="tabs" v-model:activeTab="active" />` renders an `<aside>` element containing one focusable control per `tabs` entry; clicking a control updates the parent's bound `active` value with that tab's `id`. Verified by Phase 2's "renders one button per tab" and "emits update:activeTab on click" tests.
- Keyboard focus reaches every tab via Tab; ArrowDown / ArrowUp / Home / End move focus among the tabs and emit `update:activeTab`; the focus ring is visible against the black background. Verified by Phase 2's arrow-key tests and Phase 4's manual keyboard pass.
- The `<aside>` exposes an accessible name from the `ariaLabel` prop (default `"Section navigation"`); the active tab is announced by assistive tech as "pressed" (button variant) or "current page" (link variant). Verified by Phase 2's landmark test and Phase 4's screen-reader walkthrough.
- The component file conforms to [CODING_STANDARDS.md §5](../CODING_STANDARDS.md): `<script setup>` → `<template>` → `<style scoped>` with `@reference "#app.css"`, declared props use object syntax, the v-model emit is declared via `defineEmits`, and `npx prettier --check src/components/MenuSidebar.vue` returns clean.

## Flagged for human review

_All items resolved 2026-06-14. Decisions below are binding for the implementing PR. Code snippets in "Generated code" above need to be updated to reflect items marked **[code change]**._

- **Mobile / collapse behavior of the sidebar at md and below. [Resolved: hamburger + overlay drawer.] [code change] [cross-cutting impact: settings-view]** Below `md`, the sidebar collapses to a hamburger button in the top-left of the content surface. Tapping the button opens an overlay drawer (the same `<aside>` rendered with `position: fixed; inset: 0; transform: translateX(-100%)` when closed, `translateX(0)` when open). Required machinery owned by this component:
  - `isOpen` reactive state (internal, with a `v-model:open` prop for parent control if a consumer needs it).
  - A focus trap while open (focus moves into the drawer on open; `Tab` cycles within the drawer; first / last tab indices wrap).
  - `Escape` closes the drawer and returns focus to the hamburger trigger.
  - Backdrop click closes the drawer.
  - `<Transition>` wrap on the drawer + a separate fade on a backdrop element.
  - `aria-expanded` on the hamburger trigger; `aria-hidden="true"` on the drawer when closed.
  - Body scroll lock while open (`overflow-hidden` on `<html>` via a side-effect in `onMounted` / `onBeforeUnmount`).
  - Update `_index.md` "Mobile behaviour for MenuSidebar inside SettingsView" item to reflect this decision so `settings-view` consumes it correctly.

- **Roving-tabindex vs. all-focusable model. [Resolved: all-focusable + `aria-pressed`.]** Each tab is a native focusable `<button>` (or `<RouterLink>` for routed tabs). Tab steps through every tab; Enter / Space activates. Document the deviation from the pure WAI-ARIA tabs pattern in an inline `// NOTE:` comment at the top of `<script setup>`.

- **Automatic vs. manual activation under arrow keys. [Resolved: automatic activation.]** `ArrowUp` / `ArrowDown` / `Home` / `End` focus AND select. Document the assumption in the component's JSDoc header so a future consumer knows not to wire expensive side-effects to tab change.

- **`role="tablist"` and `role="tab"`. [Resolved: native button + `aria-pressed`; do NOT use the tablist/tab/tabpanel triad.]** Ship the simpler semantics. Revisit only if a future consumer mounts genuine `<div role="tabpanel">` children in the same DOM scope.

- **Active-tab visual treatment. [Resolved: glass surface only.] [code change]** Active tab gets `bg-white/10` (inverted glass-like surface) — clean against the black base. Remove the `::before` left-accent-bar from the draft; it reads as overkill on dark when paired with the surface. If a future visual review wants the bar back, add it as a one-line follow-up.

- **Stop-gap design tokens introduced by the conditional Phase 0. [Resolved at project level: Phase 0 not needed.]** `typography-foundation` declares the base color tokens (`--color-background`, `--color-foreground`) and `menu-button` declares the shared `.glass-surface` utility, both landing before this component per the `_index.md` build order. Drop the conditional Phase 0 from this plan; consume the centrally-declared tokens / utility directly.

- **`hover:` styles and touch devices. [Resolved: keep hover, gate with `@media (hover: hover)`.] [code change]** Wrap the `hover:text-white` (and any other hover styles) with the `@media (hover: hover)` query so touch devices skip the affordance entirely and avoid the iOS Safari sticky-active behaviour. Tailwind's `hover:` modifier respects this by default in v4 — verify and rely on the built-in behaviour rather than re-implementing the media query.

- **`@/components/MenuSidebar.vue` import path. [Resolved: use the `@/` alias form.]** Consumers import via `@/components/MenuSidebar.vue` per [CODING_STANDARDS.md §4](../CODING_STANDARDS.md). No further action; flagged for completeness.
