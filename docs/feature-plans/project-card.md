A reusable `ProjectCard.vue` single-file component that represents one project in the portfolio's project grid. Each card is a 5/7 aspect-ratio surface that displays the project's title (Barlow Condensed), optional subtitle, and either a thumbnail image or a tasteful placeholder, and acts as a single keyboard- and pointer-focusable target that navigates to `/projects/:slug`. The component lives at [src/components/ProjectCard.vue](../../src/components/ProjectCard.vue), is the first occupant of [src/components/](../../src/components/), and is consumed by the `project-list-view` feature's grid. Ships on branch `feature/project-card`. Related plans defer scope here:

- `project-list-view` owns the responsive 1/2/3/4-column grid that lays out eight `ProjectCard`s; this plan defers all grid concerns to it.
- `project-detail-view` owns route registration for `/projects/:slug` and the detail view itself; this plan only consumes the URL pattern.

## Holistic overview

**Problem.** The portfolio's project surface — a homepage menu entry that opens onto a responsive grid of eight project cards — has no card primitive yet. Without one, the project-list-view feature cannot lay out projects, and the project-detail-view feature has no inbound navigation entry from the grid. The card is the lowest-level reusable surface in this surface area, so it gets built first.

**Approach.** A single `<script setup>` SFC at `src/components/ProjectCard.vue` that takes a flat props object — `title`, `subtitle?`, `slug`, `thumbnail?`, `thumbnailAlt?` — and renders one `<RouterLink>` whose entire surface is the click/tap/focus target. The card has a fixed `aspect-ratio: 5/7` (Tailwind `aspect-[5/7]`), a dark surface that consumes whatever surface token the project-level `@theme` declares (defaulting to Tailwind's `bg-gray-900` until tokens land — see flagged item), a thumbnail when one is provided (`object-cover` filling the surface, with a sensible `alt`), and a placeholder otherwise. The title sits on top of the thumbnail/placeholder in Barlow Condensed (consumed via `font-heading` once the project-level heading token lands; flagged). The whole card surfaces visible hover and `focus-visible` states (a ring + a subtle scale or border shift) that meet WCAG 1.4.11 (3:1 non-text contrast) against the dark base.

**Constraints.**

- WCAG 2.1 AA throughout — single clickable/focusable target (no nested links or buttons), visible focus indicator, alt text on the thumbnail, decorative placeholder marked `aria-hidden`.
- Tailwind v4 utilities only; no raw hex / px / rem in the template. Where the project's `@theme` does not yet declare the token, fall back to a Tailwind default and flag the gap.
- Vue 3 `<script setup>`; props use object syntax with explicit `type` + `required` / `default`; component name is `ProjectCard` (the brief's "ProejctCard" is a typo).
- Prettier per [.prettierrc.json](../../.prettierrc.json): 4-space, double quotes, semicolons, `printWidth: 100`, `singleAttributePerLine: true`.
- `<style scoped>` must open with `@reference "#app.css";` per the project's SFC baseline ([docs/CODING_STANDARDS.md §5](../CODING_STANDARDS.md)).
- Layout-agnostic — no fixed width on the root element. The grid in `project-list-view` controls the card's width via column sizing; the card controls only its own aspect ratio and internal layout.

**Out of scope (explicit).**

- **The grid that arranges 8 cards.** Owned by `project-list-view`. This plan does not declare any container, grid, or responsive column logic outside the card itself.
- **Route registration for `/projects/:slug`.** Owned by `project-detail-view`. This plan emits a `<RouterLink :to="`/projects/${slug}`">` and assumes that route will resolve when the user clicks; if it isn't registered yet at integration time, Vue Router will warn at runtime — that's a flagged integration risk, not a build-time blocker for the card.
- **Project data source / schema.** No store, no fetch, no fixture file. The parent passes props.
- **Filtering, sorting, search, or any list-level controls.**
- **Animations beyond a CSS hover/focus transition.** No entrance animation, no parallax, no scroll-linked motion.
- **A "featured" variant, a compact variant, or any size variant** — one size, one shape. Variants land when there's a second, concrete need.
- **Project-level `@theme` token declaration** for the dark surface, the heading font, the radius, and the placeholder background. Flagged as a cross-cutting concern owned at the project level; this plan consumes whichever tokens exist and falls back to Tailwind defaults otherwise.
- **The home-page game-menu entry that links into the grid.** Different feature.

## Generated code

### Presentation

**File added:** [src/components/ProjectCard.vue](../../src/components/ProjectCard.vue) (new).

The full component:

```vue
<script setup>
defineProps({
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        default: "",
    },
    slug: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        default: "",
    },
    thumbnailAlt: {
        type: String,
        default: "",
    },
});
</script>

<template>
    <RouterLink
        :to="`/projects/${slug}`"
        class="project-card group block aspect-[5/7] overflow-hidden rounded-md bg-gray-900 text-white no-underline transition-colors duration-150 hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
    >
        <div class="relative flex h-full w-full flex-col justify-end">
            <img
                v-if="thumbnail"
                :src="thumbnail"
                :alt="thumbnailAlt"
                class="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
            />
            <div
                v-else
                aria-hidden="true"
                class="absolute inset-0 bg-linear-to-b from-gray-800 to-gray-950"
            />
            <div
                class="relative flex flex-col gap-1 bg-linear-to-t from-black/80 to-transparent p-4 pt-12"
            >
                <h3 class="font-heading text-2xl leading-tight font-semibold uppercase tracking-wide">
                    {{ title }}
                </h3>
                <p
                    v-if="subtitle"
                    class="text-sm text-gray-200"
                >
                    {{ subtitle }}
                </p>
            </div>
        </div>
    </RouterLink>
</template>

<style scoped>
    @reference "#app.css";
</style>
```

Why each shape:

- **`<RouterLink>` is the root.** Per the brief and WCAG 2.4.4, the entire card is one focusable, clickable target. No nested `<button>` or secondary `<a>` — that would create two tab stops for one logical action. The `block` class promotes the link from inline to a block-level surface so the whole 5/7 box is the hit target.
- **`aspect-[5/7]`** — Tailwind v4 has no built-in for this ratio. Acceptable arbitrary value per [docs/DESIGN.md §15](../DESIGN.md) (no built-in alternative; documented one-off). Width is set by the parent grid; height follows.
- **`bg-gray-900` + `text-white`** — placeholder until the project's `@theme` declares a `--color-surface-dark` (or similar) token. Flagged. Once tokens land, swap to `bg-surface text-surface-content`.
- **`font-heading`** — consumed from `@theme` per [docs/DESIGN.md §3](../DESIGN.md). Until the project declares `--font-heading: "Barlow Condensed", …`, this class is a no-op and the heading falls back to the body font. Flagged.
- **Hover + focus-visible.** `hover:bg-gray-800` is a subtle color shift; `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white` is the visible focus indicator (WCAG 2.4.7). White on `gray-900` is ~17:1 contrast — well above the 3:1 non-text minimum (WCAG 1.4.11). The `group` class is included for future child reactions (e.g. `group-hover:` on the thumbnail) without requiring template changes.
- **`motion-reduce:transition-none`** — respects `prefers-reduced-motion` per [docs/DESIGN.md §10](../DESIGN.md).
- **Thumbnail vs. placeholder.** When `thumbnail` is non-empty, render an `<img>` with `object-cover` (per the brief) and the caller-supplied `alt`. When absent, render an `aria-hidden` decorative gradient — that satisfies WCAG 1.1.1 (decorative non-text content is `aria-hidden`). Both sit absolutely inside the relative wrapper so they fill the 5/7 surface beneath the text block.
- **`loading="lazy"` + `decoding="async"`** — performance hygiene. Cards beyond the viewport in an 8-card grid don't block initial paint.
- **Text gradient overlay.** `bg-linear-to-t from-black/80 to-transparent` darkens the area under the heading so text contrast holds whatever the thumbnail looks like. `from-black/80` against `text-white` is ≥4.5:1 (WCAG 1.4.3) for the bulk of the heading area.
- **`<h3>`.** The page (`ProjectListView`) owns `<h1>`/`<h2>`; cards within the grid should be `<h3>` to preserve a coherent outline. Flag if the consuming view uses a different level — the heading element here may need to become configurable.

**File added (test):** [src/__tests__/ProjectCard.spec.js](../../src/__tests__/ProjectCard.spec.js) (new).

```js
import { describe, it, expect } from "vitest";

import { mount, RouterLinkStub } from "@vue/test-utils";

import ProjectCard from "@/components/ProjectCard.vue";

describe("ProjectCard", () => {
    const baseProps = {
        title: "Test project",
        subtitle: "A subtitle",
        slug: "test-project",
    };

    function mountCard(props = {}) {
        return mount(ProjectCard, {
            props: { ...baseProps, ...props },
            global: {
                stubs: { RouterLink: RouterLinkStub },
            },
        });
    }

    it("renders the title and subtitle text", () => {
        const wrapper = mountCard();
        expect(wrapper.text()).toContain("Test project");
        expect(wrapper.text()).toContain("A subtitle");
    });

    it("links to /projects/<slug>", () => {
        const wrapper = mountCard();
        const link = wrapper.findComponent(RouterLinkStub);
        expect(link.props("to")).toBe("/projects/test-project");
    });

    it("renders the thumbnail when provided, with the supplied alt", () => {
        const wrapper = mountCard({
            thumbnail: "/img/test.webp",
            thumbnailAlt: "Test thumbnail",
        });
        const image = wrapper.find("img");
        expect(image.exists()).toBe(true);
        expect(image.attributes("src")).toBe("/img/test.webp");
        expect(image.attributes("alt")).toBe("Test thumbnail");
    });

    it("falls back to a decorative placeholder when no thumbnail is provided", () => {
        const wrapper = mountCard();
        expect(wrapper.find("img").exists()).toBe(false);
        expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true);
    });

    it("renders exactly one focusable interactive element", () => {
        const wrapper = mountCard();
        const focusables = wrapper.findAll(
            "a, button, [tabindex]:not([tabindex='-1'])",
        );
        // RouterLinkStub renders as a single <a>; the card surface is the only target.
        expect(focusables).toHaveLength(1);
    });
});
```

The `RouterLinkStub` from `@vue/test-utils` is the canonical way to test components that use `<RouterLink>` without wiring a real router for every spec — it exposes the `to` prop directly. (The full router-in-memory pattern from [docs/FRONTEND.md §8](../FRONTEND.md) is reserved for routed-view tests; component-level link tests don't need it.) Flagged: if the project later prefers `createRouter({ history: createMemoryHistory(), routes })` for parity with view tests, this spec migrates trivially.

### Configuration

_None._ No new env vars, no new build config, no router edits (route registration owned by `project-detail-view`).

### Data model

_N/A — feature has no persistent state._

### Public surface

_N/A — feature exposes one Vue component, not an HTTP route or CLI surface._ The component's "public surface" is its props contract, declared in the SFC above.

### Business logic

_N/A — the component is purely presentational. Navigation is delegated to Vue Router._

### Integration

_N/A — no external services. The parent grid passes props in; clicks navigate via the router. Both ends are owned by sibling features._

## Phased implementation plan

### Phase 1 — Feature build-out

End state: `src/components/ProjectCard.vue` exists, is importable from anywhere in the app, and renders a clickable 5/7 card when given the required props.

1. Create `src/components/ProjectCard.vue` from the SFC in "Generated code → Presentation" verbatim. _Verify:_ `npm run dev` starts cleanly; ad-hoc-render the card from `App.vue` with hardcoded props and confirm the surface fills its container at 5/7, hover darkens it, and clicking dispatches a router navigation (Vue Router will warn that `/projects/test` has no match — expected; it's owned by `project-detail-view`).
2. Run `npm run format`. _Verify:_ no diff after the second run; Prettier is idempotent.

Exit criteria: file lands at the documented path, passes Prettier, and renders without console errors in the dev server.

### Phase 2 — Unit and integration tests

End state: `ProjectCard.vue` has a Vitest spec that pins down the props contract and the single-focusable-target invariant.

1. Create `src/__tests__/ProjectCard.spec.js` from the spec in "Generated code → Presentation" verbatim. _Verify:_ `npx vitest run src/__tests__/ProjectCard.spec.js` — five tests pass.
2. Run the full unit suite to confirm no regression. _Verify:_ `npx vitest run` exits 0.

Exit criteria: five specs pass; the suite as a whole still passes.

### Phase 3 — Security and risk audit

End state: the card's thumbnail and alt-text handling are reviewed for the obvious SPA risks.

1. **`thumbnail` URL handling.** The component renders the `thumbnail` prop directly into an `<img src>`. Vue's template compiler does not sanitize URL props — `javascript:` URLs in attributes are blocked by modern browsers in `<img src>` (the browser will not execute), but `data:` URLs and `blob:` URLs would render. For a portfolio where the caller always supplies a known, self-hosted URL, this is acceptable. _Verify:_ document the constraint in the prop's JSDoc (or via a runtime `validator` — flagged item below).
2. **`title` / `subtitle` rendering.** Both are rendered via `{{ … }}` (mustache interpolation), which Vue auto-escapes — there is no XSS path. _Verify:_ no `v-html` anywhere in the component.
3. **`thumbnailAlt`** is an attribute binding, also escaped by Vue. _Verify:_ no `innerHTML` writes.
4. **Self-hosted assets per [docs/SECURITY.md](../SECURITY.md).** The card itself loads no external fonts, scripts, or images — `thumbnail` URLs must resolve to project-owned assets (caller responsibility). _Verify:_ add a one-line note in the component's leading comment when the project's first thumbnail lands so future contributors don't reach for a remote URL.

Exit criteria: the three points above are checked; no `v-html`, no `innerHTML`, no untrusted-origin imagery.

### Phase 4 — Accessibility audit

End state: the card meets the WCAG 2.1 AA criteria called out in the brief and in [docs/ACCESSIBILITY.md](../ACCESSIBILITY.md).

1. **Single tab stop (WCAG 2.4.3, 2.4.4).** Keyboard-walk a page that renders one card: Tab should land on the card once and not split between the link and an inner element. _Verify:_ the `findAll("a, button, [tabindex]:not([tabindex='-1'])")` assertion in Phase 2's spec; manual Tab walkthrough.
2. **Visible focus indicator (WCAG 2.4.7, 1.4.11).** `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white` produces a 2px white ring on `gray-900` — measured contrast ratio ≈17:1, well above the 3:1 non-text minimum. _Verify:_ keyboard-Tab into the card in the dev server; confirm the ring is visible and offset from the card edge.
3. **Keyboard activation (WCAG 2.1.1).** `<RouterLink>` renders as an `<a>`, which activates on Enter natively. _Verify:_ Tab to the card, press Enter, observe router navigation.
4. **Alt text (WCAG 1.1.1).** When `thumbnail` is set, the consumer must supply `thumbnailAlt`. The default is empty string, which is a valid "decorative" alt — acceptable when the thumbnail is purely decorative atop a labeled card, but the brief implies the thumbnail is informative. _Verify:_ flag for review whether empty default + required-when-image-present should be a runtime warning (Vue's `validator` or a `dev`-time `console.warn`).
5. **Decorative placeholder (WCAG 1.1.1).** The placeholder `<div>` is `aria-hidden="true"` — screen readers skip it. _Verify:_ the `findAll('[aria-hidden="true"]')` assertion in Phase 2's spec.
6. **Reflow (WCAG 1.4.10).** The card has no fixed width and no min-width — at 320 CSS pixels the grid (owned by `project-list-view`) will collapse to one column and the card will shrink with it. _Verify:_ once the grid lands, zoom the dev server to 400% and confirm no horizontal scroll.
7. **Reduced motion (best practice).** `motion-reduce:transition-none` is wired. _Verify:_ enable OS "reduce motion" and confirm the hover transition is gone.
8. **Touch target (WCAG 2.5.5 AAA; floor in [docs/FRONTEND.md §13](../FRONTEND.md)).** The whole card is the target; even at the narrowest column on a phone, the 5/7 ratio plus column width keeps the surface well above 44×44 CSS px. _Verify:_ once the grid lands, measure the card at the mobile breakpoint.

Exit criteria: items 1–7 verified during this phase; item 6 and 8 deferred to grid-integration verification.

### Phase 5 — Search-engine-optimization audit

_Skipped with justification — this component is a presentational primitive with no page-level surface area._ SEO concerns (page title, meta description, canonical URL, JSON-LD, sitemap entry) belong to the routed views that consume the card (`ProjectListView`, `ProjectDetailView`), not to the card itself. The card does emit `<RouterLink>` URLs in the form `/projects/<slug>` — slug stability and the sitemap entry derived from project slugs are flagged at the project level (see "Flagged for human review").

## Success conditions

- Mounting `<ProjectCard title="Test project" subtitle="A subtitle" slug="test-project" />` renders a single `<a>` element with `aspect-ratio: 5/7`, dark background, the title in the heading font, and `href` resolving to `/projects/test-project`. _Pinned by:_ Phase 2 specs "renders the title and subtitle text" + "links to /projects/<slug>".
- Tab focuses the card exactly once (single focusable target), a visible focus ring appears against the dark surface, and pressing Enter triggers router navigation. _Pinned by:_ Phase 2 spec "renders exactly one focusable interactive element" + Phase 4 manual keyboard walkthrough.
- Mounting `<ProjectCard …>` without a `thumbnail` prop renders an `aria-hidden` decorative placeholder and no `<img>`; mounting with `thumbnail="/img/x.webp"` + `thumbnailAlt="…"` renders an `<img>` with `object-cover`, the supplied `alt`, and `loading="lazy"`. _Pinned by:_ Phase 2 specs "renders the thumbnail when provided" + "falls back to a decorative placeholder".
- The component imports cleanly from `@/components/ProjectCard` (Vite alias) inside both runtime and test contexts. _Pinned by:_ Phase 1 dev-server check + Phase 2 `vitest run` exit 0.
- Hover and `focus-visible` produce a visible color or outline shift; the transition is suppressed under `prefers-reduced-motion`. _Pinned by:_ Phase 4 step 7.

## Flagged for human review

_All items resolved 2026-06-14. Decisions below are binding for the implementing PR._

- **Exact prop shape and naming. [Resolved: `{ title, subtitle?, slug, thumbnail?, thumbnailAlt? }`. Do NOT thread `description`.]** Keep the card's contract minimal. Card focuses on what it renders (title + subtitle + thumbnail). `description` is passed by the parent directly to `ProjectDetailView`, not threaded through the card. The shape can be widened later without breaking callers because every new prop is optional.

- **`thumbnailAlt` required when `thumbnail` is present. [Resolved: dev-only `console.warn` when missing.]** Add a `validator` (or an inline `watchEffect`) that `console.warn`s during dev when `thumbnail` is non-empty and `thumbnailAlt` is empty. Empty alt remains valid for genuinely decorative thumbnails (callers explicitly pass `thumbnailAlt=""`). Catches mistakes without breaking builds.

- **Heading element level. [Resolved: fixed `<h3>`.]** Consuming `ProjectListView` owns `<h1>` for the page heading; the card's `<h3>` slots cleanly underneath. Promote to a `headingLevel` prop only when a second consumer needs a different level.

- **Card surface aesthetic. [Resolved: dark base; no glass.]** Honor the brief — `bg-gray-900` (or the semantic equivalent once tokens land). Revisit only if a future visual review breaks the consistency with the menu / settings glass aesthetic.

- **`/projects/:slug` route registration. [Resolved at project level: owned by `project-detail-view`; ship the card before that route lands.]** The dev-server "no match" warning is harmless until `project-detail-view` ships. Document the dependency in the PR description.

- **Project data source / schema. [Resolved at project level: `src/data/projects.js` introduced by `project-list-view`.]** When `project-list-view` lands (the second consumer of project records, per `_index.md` build order), it extracts the shared record array to `src/data/projects.js` with shape `{ slug, title, subtitle?, thumbnail?, thumbnailAlt?, description }`. This card consumes via props only — no direct import of the data module.

- **Project-level design tokens. [Resolved at project level: consume from `typography-foundation`.]** `--color-background` and `--color-foreground` land before this component. Use `bg-gray-900` / `text-white` as a Tailwind-default placeholder for the card surface until a semantic `--color-surface` token lands (out of scope for this round). Swap to the semantic token in a one-line edit when it arrives.

- **`prettier-plugin-tailwindcss` not yet adopted. [Resolved: ship as written.]** Class order was hand-ordered to match what the plugin will eventually enforce (layout → spacing → color → state). The first `npm run format` after the plugin is adopted will rewrite the class list in-place; the diff will be cosmetic.

- **Test pattern. [Resolved: `RouterLinkStub`.]** Use the standard `@vue/test-utils` `RouterLinkStub` for the link assertion. Decouples the spec from the route table this feature does not own. If a future spec asserts actual navigation behavior, that test introduces `createMemoryHistory()` per [docs/FRONTEND.md §8](../FRONTEND.md).
