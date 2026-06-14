# MenuButton component

A reusable, accessible button component used by the main-menu view (and reusable elsewhere) styled with uppercase text, a 1px white border, a glassmorphic surface, and centered text. Lives in [src/components/MenuButton.vue](../../src/components/MenuButton.vue) and ships on `feature/menu-button`. The main-menu view consumes — but does not own — this component; its plan defers all button-internal concerns here.

## Holistic overview

**Problem or opportunity.** The portfolio's home screen is a "game-menu-style" vertical stack of buttons (Resume, Projects, Settings, Quit), and the same visual treatment will recur elsewhere (e.g. Back-to-menu actions, primary CTAs on the settings view). Today there is no shared button component: `src/components/` is an empty scaffold placeholder ([CODING_STANDARDS.md §3](../CODING_STANDARDS.md), [FRONTEND.md §6](../FRONTEND.md)). Without one, each view will inline its own styling and re-discover the same accessibility traps (focus indicator, tap target, role-vs-link confusion). Shipping `MenuButton.vue` first gives every consumer one well-formed entry point.

**Approach.** A single SFC at `src/components/MenuButton.vue` that takes a `label` (required string) plus *exactly one of* a `to` prop (a `vue-router` route location → renders as `<RouterLink>`) or a click event (no `to` → renders as a native `<button>`). The visual treatment is delivered entirely via Tailwind utilities so the component reads as a thin presentational wrapper: `uppercase`, `border border-white`, the project's `.glass-surface` class (cross-cutting — see _Constraints_), `text-center`, and generous vertical padding so the tap target clears the WCAG 2.5.5 (24 CSS px) and the project's stricter 44×44 baseline ([ACCESSIBILITY.md §1.2 / FRONTEND.md §13](../ACCESSIBILITY.md)). The component is **width-agnostic**: it occupies whatever its parent gives it. Hover, `focus-visible`, and `active` states are explicit utilities (not just browser defaults) because the dark background makes the default focus ring low-contrast in some browsers.

**Constraints.**

- WCAG 2.1 AA ([ACCESSIBILITY.md §1](../ACCESSIBILITY.md)) — focus must be visible (2.4.7), the accessible name must contain the visible label (2.5.3), keyboard activation must work via Enter / Space on `<button>` and Enter on `<RouterLink>`, contrast for non-text UI ≥ 3:1 (1.4.11).
- Tailwind v4 with tokens in `@theme` only, no `tailwind.config.js` ([DESIGN.md §1](../DESIGN.md)). The component must consume project tokens, not hex literals.
- Project SFC baseline ([CODING_STANDARDS.md §5](../CODING_STANDARDS.md)) — `<script setup>` + `<template>` + `<style scoped>` with `@reference "#app.css"`.
- Prettier 4-space / double-quote / `singleAttributePerLine` ([CODING_STANDARDS.md §9](../CODING_STANDARDS.md), [FRONTEND.md §5](../FRONTEND.md)).
- No external font CDN, no third-party dependencies added ([SECURITY.md §1 / §6](../SECURITY.md)).
- `backdrop-filter: blur(...)` powers the glass effect — broadly supported but must degrade to a solid translucent fallback for browsers without it (Firefox <103 in particular historically lagged; current shipping versions support it).
- **Cross-cutting (handled at project level, NOT here):** the `.glass-surface` utility (or `@apply` recipe) and any color tokens (e.g. `--color-border-default` for the white-tinted border) live in [src/styles/app.css](../../src/styles/app.css)'s `@theme` / `@layer components` block, owned by the project's design-tokens concern. This plan consumes them by name and flags the dependency.

**Out of scope (considered and deferred):**

- The vertical button stack and the main-menu view itself — owned by the `feature/main-menu-view` plan.
- Route registration. This component accepts a `to` prop; the route table is wired by the project-level routing concern ([FRONTEND.md §8](../FRONTEND.md)).
- The shared `.glass-surface` utility and the design-token additions (`@theme` block, white-border token). Project-level cross-cutting concern.
- Icon support inside the button. None of the four named consumers (Resume, Projects, Settings, Quit) ship with icons in scope; revisit when the third consumer asks.
- Motion / micro-interactions beyond a `transition-colors` for hover / focus state changes. Animations are explicitly deferred per the harness brief.
- Loading / disabled / busy variants. Not required by any named consumer; would be added under a future `feature/menu-button-states` plan.
- Variant system (`primary` / `ghost` / `danger`). Premature — there's one visual treatment. Two similar lines is not a pattern ([CODING_STANDARDS.md §2](../CODING_STANDARDS.md)).
- Dark-mode toggling. The project's base palette is dark by default; light-mode is not in scope project-wide.

## Generated code

### Public surface

One new file: [src/components/MenuButton.vue](../../src/components/MenuButton.vue).

**Props:**

| Prop      | Type                         | Required | Default     | Notes                                                                       |
| --------- | ---------------------------- | -------- | ----------- | --------------------------------------------------------------------------- |
| `label`   | `String`                     | yes      | —           | Visible button text. Rendered verbatim; the component applies `uppercase`.  |
| `to`      | `[String, Object]`           | no       | `null`      | A `vue-router` route location. When provided, renders as `<RouterLink>`.    |
| `type`    | `String`                     | no       | `"button"`  | Only consulted when rendering as a native `<button>`. Validator: `button` / `submit` / `reset`. |

**Emits:**

| Event   | Payload         | Notes                                                                  |
| ------- | --------------- | ---------------------------------------------------------------------- |
| `click` | `MouseEvent`    | Forwarded from the underlying element. Consumers attach `@click` directly. |

The component does **not** declare a `click` handler prop; consumers listen with `@click` on the element. Vue 3's `$attrs` fall-through means `@click="…"` on the consumer side lands on the rendered root element naturally — no `emit("click", …)` plumbing required.

**Native-`<button>` vs. `<RouterLink>` switching.** A `<component :is="…">` dynamic tag swap is the cleanest pattern: when `to` is set, `:is="RouterLink"` and `:to="to"`; otherwise `:is="'button'"` and `:type="type"`. The `<RouterLink>` component is imported from `vue-router` and rendered as a button-styled anchor (the role stays `link` — correct for navigation; uppercase visual styling does not change the semantic role).

**Accessibility behavior:**

- Native `<button>` carries an implicit `role="button"` and responds to Enter / Space; no extra ARIA needed. The visible `label` is also the accessible name (2.5.3 satisfied).
- `<RouterLink>` renders as `<a href="…">` with role `link`; Enter activates by default. This is **correct semantics for a navigation control** — a button that navigates to a route is a link, regardless of visual treatment.
- `focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black` gives a 2px white ring with a 2px black offset — easily ≥ 3:1 contrast against the dark page background (1.4.11).
- Padding `px-6 py-4` yields a > 44 px tap target at the default font size and is comfortably above WCAG 2.5.5's 24 CSS px floor.
- No `outline-none` without a matching `focus-visible:ring-*` ([FRONTEND.md §13](../FRONTEND.md)).

**Code:**

```vue
<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps({
    label: {
        type: String,
        required: true,
    },
    to: {
        type: [String, Object],
        default: null,
    },
    type: {
        type: String,
        default: "button",
        validator: (value) => ["button", "submit", "reset"].includes(value),
    },
});

const isLink = computed(() => props.to !== null);
const renderedTag = computed(() => (isLink.value ? RouterLink : "button"));
</script>

<template>
    <component
        :is="renderedTag"
        :to="isLink ? to : undefined"
        :type="isLink ? undefined : type"
        class="menu-button"
    >
        {{ label }}
    </component>
</template>

<style scoped>
    @reference "#app.css";

    .menu-button {
        @apply glass-surface block w-full cursor-pointer rounded-md border border-white
            px-6 py-4 text-center text-lg font-semibold uppercase tracking-wide text-white
            no-underline transition-colors;
    }

    .menu-button:hover {
        @apply bg-white/15;
    }

    .menu-button:focus-visible {
        @apply outline-none ring-2 ring-white ring-offset-2 ring-offset-black;
    }

    .menu-button:active {
        @apply bg-white/25;
    }

    @supports not (backdrop-filter: blur(8px)) {
        .menu-button {
            @apply bg-white/20;
        }
    }
</style>
```

Notes on the snippet:

- `glass-surface` is the cross-cutting shared utility (see Constraints + Flagged for human review). It is expected to encapsulate `bg-white/10 backdrop-blur-md` plus whatever else the project standardizes. Within this component, **everything else** (the border, the radius, the padding, the typography) is local.
- `block w-full` makes the rendered element fill the parent's inline axis — the main-menu view's stack chooses the width by sizing the wrapper. This satisfies the "viewport-driven width" requirement in the brief.
- `text-center` is on the element itself rather than relying on the parent's flex centering; the brief explicitly requires centered text.
- `no-underline` on the `<RouterLink>` render path strips the default anchor underline.
- `tracking-wide` lifts uppercase text out of "letter-soup" territory; a common small touch.
- The `@supports not (backdrop-filter: …)` block is the graceful-degradation fallback called out in Constraints — when the browser lacks `backdrop-filter`, the background falls back to a solid translucent white (no blur).
- `cursor-pointer` is explicit because the `<RouterLink>` render path becomes an `<a>` without an `href`-like cursor cue in some user agents when the link styles are otherwise stripped.

### Test

One new file: [src/__tests__/MenuButton.spec.js](../../src/__tests__/MenuButton.spec.js).

Follow the project's existing test pattern ([src/__tests__/App.spec.js](../../src/__tests__/App.spec.js)) — `mount` + assertions on rendered text. Routed-link assertions use an in-memory router per [CODING_STANDARDS.md §8](../CODING_STANDARDS.md).

```js
import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";

import MenuButton from "@/components/MenuButton.vue";

function makeTestRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes: [{ path: "/projects", name: "projects", component: { template: "<div />" } }],
    });
}

describe("MenuButton", () => {
    it("renders the label in uppercase", () => {
        const wrapper = mount(MenuButton, {
            props: { label: "Projects" },
        });
        const rendered = wrapper.text();
        expect(rendered).toBe("Projects");
        const computed = window.getComputedStyle(wrapper.element);
        expect(computed.textTransform).toBe("uppercase");
    });

    it("renders as a native button when no `to` is provided and emits click", async () => {
        const wrapper = mount(MenuButton, {
            props: { label: "Quit" },
        });
        expect(wrapper.element.tagName).toBe("BUTTON");
        await wrapper.trigger("click");
        expect(wrapper.emitted("click")).toHaveLength(1);
    });

    it("renders as a RouterLink when `to` is provided", () => {
        const router = makeTestRouter();
        const wrapper = mount(MenuButton, {
            props: { label: "Projects", to: { name: "projects" } },
            global: { plugins: [router] },
        });
        expect(wrapper.element.tagName).toBe("A");
        expect(wrapper.attributes("href")).toBe("/projects");
    });
});
```

The first test asserts the rendered text matches the prop verbatim and the *computed* `text-transform` is `uppercase` — covering both the prop pass-through and the visual contract. The second confirms the native-`<button>` render path and click forwarding. The third confirms the `<RouterLink>` render path produces an `<a href="…">` for the named route. Together these cover the two success criteria below that touch JS-observable behavior.

## Phased implementation plan

### Phase 1 — Feature build-out

End-state: `MenuButton.vue` exists, renders correctly in both modes, and the project still builds.

1. Create [src/components/MenuButton.vue](../../src/components/MenuButton.vue) from the baseline SFC template, then drop in the script / template / style above.
    _Verify:_ `npm run dev` boots without an error; mounting `<MenuButton label="Test" />` in any scratch view renders a button with the visible label "Test" rendered in uppercase against a glassmorphic surface.
2. Confirm the `glass-surface` utility (cross-cutting dependency) is available in [src/styles/app.css](../../src/styles/app.css). If not yet present, **do not declare it inside this component** — flag the gap, drop a temporary `@apply bg-white/10 backdrop-blur-md` inline so the visual is plausible during development, and leave a `// TODO:` referencing the cross-cutting concern.
    _Verify:_ Search `src/styles/app.css` for `glass-surface`; either it's there or the TODO is in place.
3. Run `npm run format` to ensure Prettier's 4-space / double-quote / `singleAttributePerLine` rules are applied.
    _Verify:_ `npm run format` produces no further diff on a re-run.

Exit criteria: `npm run build` succeeds; the component renders both modes (`to`-set and `to`-unset) without console warnings in the dev server.

### Phase 2 — Unit and integration tests

End-state: Vitest spec at `src/__tests__/MenuButton.spec.js` passes in CI and locally.

1. Create [src/__tests__/MenuButton.spec.js](../../src/__tests__/MenuButton.spec.js) with the three tests above.
    _Verify:_ `npx vitest run src/__tests__/MenuButton.spec.js` reports 3 passing tests.
2. Run the full test suite to confirm no regression in the existing `App.spec.js`.
    _Verify:_ `npm run test:unit -- --run` (or `npx vitest run`) ends green across the project.

Exit criteria: All Vitest specs pass; new spec asserts on uppercased text, native-`<button>` click forwarding, and `<RouterLink>` href resolution.

### Phase 3 — Security and risk audit

End-state: The component does not introduce XSS, supply-chain, or input-handling surface.

1. Confirm no `v-html` is used and the visible label is interpolated via Vue's default-escaping `{{ label }}` ([SECURITY.md §3.1 / §3.2](../SECURITY.md)).
    _Verify:_ Mounting `<MenuButton label="<script>alert(1)</script>" />` renders the literal string `<SCRIPT>ALERT(1)</SCRIPT>` (uppercased) inside the button, not an executed script.
2. Confirm the `to` prop is consumed by `<RouterLink>` only — never coerced into a raw `href` string or interpolated into an attribute. `<RouterLink>` performs its own URL resolution; this component does not need a `safeHref(...)` wrapper because external URLs are not in the prop contract.
    _Verify:_ The component never reads `props.to` outside the template's `:to` binding on `<RouterLink>`.
3. Confirm no new npm dependency was added in this phase ([SECURITY.md §6](../SECURITY.md)). `vue-router` was already in `dependencies`.
    _Verify:_ `git diff package.json package-lock.json` is empty for this branch.

Exit criteria: No `v-html`; no raw-string `href` interpolation; no new dependency.

### Phase 4 — Accessibility audit

End-state: The component meets WCAG 2.1 AA's button-related criteria.

1. **Keyboard activation** — mount the component, focus it via Tab, verify Enter activates both modes and Space activates the `<button>` mode.
    _Verify:_ Manual keyboard pass per [ACCESSIBILITY.md §3.3](../ACCESSIBILITY.md); both modes activate.
2. **Visible focus** — Tab to the button against the dark page background, confirm a 2px white ring with black offset is visible. Confirm `focus-visible` (not just `focus`) is the trigger so mouse-click doesn't show the ring.
    _Verify:_ The `:focus-visible` rule fires on keyboard focus, not pointer focus; ring contrast computes ≥ 3:1 against `#000` (white-on-black is 21:1 — trivially passing).
3. **Accessible name** — the visible `label` is the accessible name. Validate via the browser's Accessibility tree (Chrome DevTools → Elements → Accessibility) — the computed name matches the visible text (2.5.3).
    _Verify:_ Browser accessibility panel shows `Name: "PROJECTS"` (or whatever the label is) and `Role: button` (or `link` when `to` is set).
4. **Tap target** — measure the rendered element's bounding box at the default font size; must be ≥ 44×44 CSS px.
    _Verify:_ With `px-6 py-4` and `text-lg` (1.125rem / ~18 px line-height ~28 px), the rendered height is 28 + 32 = 60 px; width is parent-driven and the consumer (vertical stack) gives full width. Confirm with a manual measurement at default zoom.
5. **`text-transform: uppercase` and accessible-name compatibility** — note that some screen readers will spell out uppercased letters letter-by-letter when CSS `text-transform: uppercase` is applied. Mitigation: the DOM text remains mixed-case (the prop is rendered verbatim; only the CSS visually uppercases it), so the screen-reader-announced name matches the prop, not the visual rendering. This is the correct behavior and a side benefit of using CSS rather than `String.prototype.toUpperCase()`.
    _Verify:_ Inspect the DOM — `wrapper.text()` returns the prop's original casing.
6. **Reduced motion** — the only transition is `transition-colors`, which is a color hover/focus state, not motion. No `motion-reduce:` gate is required, but document the consideration.
    _Verify:_ Toggling OS "Reduce motion" produces no visual change (intended).

Exit criteria: All six checks above pass; documented in this plan and in the eventual PR description.

### Phase 5 — Search-engine-optimization audit

_N/A — this component is a UI primitive, not a page or route. It contributes no `<head>` content, no canonical URL, no structured data. SEO concerns belong with the views that consume it (HomeView and beyond) under those features' plans._

## Success conditions

- Mounting `<MenuButton label="Test" to="/foo" />` in a sandbox (e.g. a temporary `HomeView` stub with the router wired) renders an `<a href="/foo">` element with visible text "TEST" uppercased, a 1px white border, and a glassmorphic translucent-white surface against the project's black page background.
- Tab-focusing the component reveals a 2px white ring with a 2px black offset that meets the WCAG 1.4.11 ≥ 3:1 non-text contrast threshold; pressing Enter activates the link (navigates) or the button (fires `@click`); pressing Space activates the `<button>` render path.
- The Vitest spec at [src/__tests__/MenuButton.spec.js](../../src/__tests__/MenuButton.spec.js) reports three passing tests covering: (1) visible label rendered verbatim with CSS `text-transform: uppercase`, (2) native `<button>` mode emits `click`, and (3) `to`-set mode renders an `<a href="…">` with the resolved route URL.

## Flagged for human review

_All items resolved 2026-06-14. Decisions below are binding for the implementing PR. Code snippets in "Generated code" above need to be updated to reflect items marked **[code change]**._

- **`.glass-surface` utility location. [Resolved at project level: declared in [src/styles/app.css](../../src/styles/app.css) under `@layer utilities`, owned by THIS feature's Phase 0.]** This feature is the first consumer of the glass surface, so Phase 0 of this plan declares the utility centrally. The utility documents its `@supports not (backdrop-filter: blur(...))` fallback inline. Downstream consumers (`settings-view`) reuse it via `@apply glass-surface` without redeclaring. **[code change]** — replace any placeholder inline `bg-white/10 backdrop-blur-md` snippets in this plan with `@apply glass-surface;` references and add the utility declaration to the Phase 0 / `app.css` snippet.

- **White-border token vs. raw `white`. [Resolved at project level: use raw `border-white`.]** Ship `border-white` (Tailwind's built-in `--color-white`). Promote to a `--color-border-default` semantic alias only when a second border treatment with a different intent lands (per `_index.md` cross-cutting concern resolution).

- **`text-lg` font size. [Resolved: ship `text-lg`.]** 1.125rem / 18px is the defensible middle ground. Revisit if `main-menu-view`'s visual review calls for larger.

- **`<RouterLink>` semantics on a button-styled element. [Resolved: keep `<RouterLink>` semantics.]** When `to` is provided the rendered element is an `<a href="…">` with role `link`. This is the correct semantic for a navigation control per WCAG 4.1.2 and [ACCESSIBILITY.md §1.4](../ACCESSIBILITY.md). Do NOT add `role="button"`. The visual / AT mismatch ("looks like a button, announces as link") is acceptable and honest.

- **Disabled-state styling. [Resolved: include a basic disabled style.] [code change]** Add a `disabled` prop (boolean, default `false`). When `true`:
  - Render with `aria-disabled="true"` (do NOT set the native `disabled` attribute on `<RouterLink>` — it has no effect on `<a>`; set the native `disabled` attribute only when the rendered element is `<button>`).
  - Visual: `opacity-50 cursor-not-allowed`.
  - Suppress hover / press transforms (use `not-disabled:` variants or a `:disabled, [aria-disabled="true"]` selector in the scoped style).
  - When `<RouterLink>`-rendered and `disabled === true`, intercept the click with `@click.prevent` so navigation does not fire.
  - Document the disabled API in the JSDoc / component prop comments.

- **Click handler vs. emit declaration. [Resolved: explicit `defineEmits(['click'])`.] [code change]** Declare `const emit = defineEmits(["click"])` in `<script setup>` and forward via `@click="emit('click', $event)"` on the rendered root. Self-documents the emit contract for consumers and removes ambiguity around fall-through behaviour when both `to` and `@click` are passed.

- **`backdrop-filter` browser support. [Resolved: ship the `@supports not` fallback with solid `bg-white/20`.]** The `.glass-surface` utility's `@supports` block lives in [src/styles/app.css](../../src/styles/app.css) (per the project-level resolution above), so every consumer inherits the fallback.

- **Press / hover micro-interactions. [Resolved: hover lift + press depression.] [code change]** Add to the scoped style:
  - `hover:-translate-y-0.5` (a subtle 2px lift on hover) with a `transition-transform duration-150 ease-out`.
  - `active:translate-y-0 active:scale-[0.98]` for the press depression.
  - Gate both behind `motion-safe:` so users with `prefers-reduced-motion: reduce` get no transform animation (per [ACCESSIBILITY.md](../ACCESSIBILITY.md)).
  - Disabled buttons (see disabled-state resolution) suppress these transforms via the same selector that suppresses hover / press.
