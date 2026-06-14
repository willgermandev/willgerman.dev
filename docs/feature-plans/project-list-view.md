The project listing page for the willgerman.dev portfolio SPA. Renders a responsive CSS grid of exactly eight `<ProjectCard>` instances at `/projects` (1 column on mobile → 2 / 3 / 4 columns at `sm` / `md` / `lg`), each card linking to its detail page. Lives in `src/views/ProjectListView.vue` (the file already exists as the scaffolded SFC baseline) and adds one route to [src/router/index.js](../../src/router/index.js). Ships on branch `feature/project-list-view` as part of the `willgerman-portfolio` multi-feature project; sibling plans cover `project-card` (the consumed component), `project-detail-view` (the route this page links to), and project-wide concerns (route table, design tokens, project-data schema).

## Holistic overview

**Problem.** [src/views/ProjectListView.vue](../../src/views/ProjectListView.vue) ships today as the empty SFC baseline from [docs/CODING_STANDARDS.md §5](../CODING_STANDARDS.md) — empty `<script setup>`, empty `<template>`, `<style scoped>` with `@reference "#app.css"`. The router's `routes: []` is empty ([src/router/index.js](../../src/router/index.js)). Nothing currently renders at `/projects`, and the listing surface — one of the three load-bearing routes of the portfolio (home / list / detail) — has no implementation.

**Approach.** Author the contents of [src/views/ProjectListView.vue](../../src/views/ProjectListView.vue) so it (a) declares a local in-component array of eight placeholder project records, (b) renders them through a Tailwind v4 utility-driven CSS grid (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`) of `<ProjectCard>` instances, and (c) sits beneath a single `<h1>` heading in Barlow Condensed Black. Register one new route in [src/router/index.js](../../src/router/index.js) named `project-list` at path `/projects`, lazy-loaded per [docs/CODING_STANDARDS.md §7](../CODING_STANDARDS.md). No state escapes the component, no fetch happens, and the cards' rendering is delegated entirely to the sibling-owned `<ProjectCard>` component.

**Constraints.**
- **Tailwind v4** via `@theme` (no `tailwind.config.js`); utilities only, no `!important`, no arbitrary values when a built-in fits ([docs/DESIGN.md §15](../DESIGN.md)).
- **WCAG 2.1 AA** ([docs/ACCESSIBILITY.md](../ACCESSIBILITY.md)) — semantic landmarks, single `<h1>`, logical focus order across grid cells (DOM order = visual reading order, which holds for CSS grid auto-flow), 320 px reflow (WCAG 1.4.10), visible focus indicators on every card link.
- **Self-hosted assets** ([docs/SECURITY.md](../SECURITY.md)) — no external CDN references.
- **Vue 3 `<script setup>`** + setup-style Pinia ([docs/CODING_STANDARDS.md §5, §6](../CODING_STANDARDS.md)). No Pinia store needed here.
- **Prettier**: 4-space indent, double quotes, semicolons, 100-col, `singleAttributePerLine: true`, `vueIndentScriptAndStyle: true` ([docs/CODING_STANDARDS.md §9](../CODING_STANDARDS.md)).
- **Node engines** `^20.19.0 || >=22.12.0`.
- **Layout must work down to a 320 px viewport** without horizontal scroll (WCAG 1.4.10).
- **Exactly 8 cards** — not a variable count.

**Out of scope (explicit).**
- The `<ProjectCard>` component itself — owned by the `project-card` plan. This plan consumes a presumed prop shape (`:title :subtitle :slug`) and flags it for cross-plan confirmation.
- The detail view (`ProjectDetailView.vue`) and its `/projects/:slug` route — owned by the `project-detail-view` plan. This plan only links to it via `{ name: "project-detail", params: { slug } }`.
- The `HomeView`, `SettingsView`, and `StyleGuideView` routes — owned by their respective sibling plans.
- Search, filter, sort, or pagination over the project list. Out of scope per project brief.
- Fetching project data from a backend, static JSON manifest, or CMS. The eight records are inline placeholders. The future data-source decision is a cross-cutting concern flagged below.
- Animations or transitions on grid items (entrance, hover-tilt, etc.).
- Persistence (no Pinia store, no `localStorage`).
- `@theme` token declarations (color, font-family, spacing) — owned by a cross-cutting plan. This plan consumes whatever tokens exist when it lands and flags any consumption assumption.
- The cross-feature route table assembly — this plan registers exactly one route entry and notes that the home/detail/settings/style-guide routes land in their own plans.

## Generated code

### Public surface — view

[src/views/ProjectListView.vue](../../src/views/ProjectListView.vue), authored from the existing scaffolded baseline:

```vue
<script setup>
const projects = [
    { slug: "project-one", title: "Project One", subtitle: "Placeholder subtitle" },
    { slug: "project-two", title: "Project Two", subtitle: "Placeholder subtitle" },
    { slug: "project-three", title: "Project Three", subtitle: "Placeholder subtitle" },
    { slug: "project-four", title: "Project Four", subtitle: "Placeholder subtitle" },
    { slug: "project-five", title: "Project Five", subtitle: "Placeholder subtitle" },
    { slug: "project-six", title: "Project Six", subtitle: "Placeholder subtitle" },
    { slug: "project-seven", title: "Project Seven", subtitle: "Placeholder subtitle" },
    { slug: "project-eight", title: "Project Eight", subtitle: "Placeholder subtitle" },
];
</script>

<template>
    <section class="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <h1 class="font-heading-condensed mb-8 text-4xl font-black tracking-wide lg:mb-12 lg:text-6xl">
            PROJECTS
        </h1>
        <ul
            role="list"
            class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
        >
            <li
                v-for="project in projects"
                :key="project.slug"
            >
                <ProjectCard
                    :slug="project.slug"
                    :title="project.title"
                    :subtitle="project.subtitle"
                />
            </li>
        </ul>
    </section>
</template>

<style scoped>
    @reference "#app.css";
</style>
```

Notes on the snippet:

- **`<ProjectCard>` is referenced unimported.** Two ways forward: (a) add `import ProjectCard from "@/components/ProjectCard.vue";` to `<script setup>` once the `project-card` plan lands; (b) register it globally in [src/main.js](../../src/main.js) (not currently done, project-wide call). Local import is the project convention by default — see [docs/CODING_STANDARDS.md §4 / §5](../CODING_STANDARDS.md). Flagged for review.
- **The `<ul role="list">` + `<li>` wrapping** preserves list semantics even when Tailwind's `list-none` (implicit on grids) strips the default list bullet — screen readers still announce "list, 8 items". WCAG 1.3.1 (Info and Relationships). The `role="list"` is needed because Safari + VoiceOver drop list semantics when `list-style: none` is set.
- **`mx-auto max-w-7xl`** uses the documented page-shell pattern from [docs/DESIGN.md §8](../DESIGN.md). If a different container width is project-canonical, swap it once tokens land.
- **`font-heading-condensed` and `font-black`** assume the future `@theme` declares `--font-heading-condensed: "Barlow Condensed", …;` (recommended in the project brief). Until the token exists, the utility resolves to nothing and the heading falls back to the default sans family — flagged.
- **Gap utilities** (`gap-4` → `md:gap-6`) follow [docs/DESIGN.md §4](../DESIGN.md) stack-gap conventions. Single consistent value is also acceptable (`gap-6` everywhere); the responsive bump tightens mobile rows where vertical space is precious. Flagged.

### Public surface — route

Append the route entry to [src/router/index.js](../../src/router/index.js):

```js
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/projects",
            name: "project-list",
            component: () => import("@/views/ProjectListView.vue"),
            meta: { title: "Projects" },
        },
    ],
});

export default router;
```

Notes:

- **Lazy-loaded** via dynamic `import()` per [docs/CODING_STANDARDS.md §7](../CODING_STANDARDS.md).
- **`name: "project-list"`** in kebab-case per same. Used by other views (e.g. `HomeView`, `SettingsView`) via `{ name: "project-list" }`, never as a hardcoded path.
- **`meta.title`** is the page-title source consumed by the SPA route announcer pattern in [docs/ACCESSIBILITY.md §4.1](../ACCESSIBILITY.md). That announcer is a cross-cutting concern owned by a project-level plan — this plan declares the `meta.title` so the announcer can pick it up once it ships.
- **The route table will accumulate** entries from sibling plans (`home` at `/`, `project-detail` at `/projects/:slug`, `settings` at `/settings`, `style-guide` at `/style-guide`). When the table crosses ~10 entries, [docs/CODING_STANDARDS.md §7](../CODING_STANDARDS.md) prescribes per-feature splits — not yet needed.

### Business logic

_None._ The view is a static render of an inline array; no composables, services, or utilities are created. The eight project records are local component state — no `ref`, no `reactive`, just a `const` array. If/when project data moves to a fetch (CMS, static JSON manifest, etc.), the right home is a service in [src/services/](../../src/services/) plus a composable in `src/composables/` per [docs/FRONTEND.md §10](../FRONTEND.md). Cross-cutting; flagged.

### Configuration

_None._ No new env vars, no new Vite config, no new Tailwind plugins.

## Phased implementation plan

### Phase 1 — Feature build-out

End-state: navigating to `/projects` renders the section heading and the 8-card grid; clicking any card pushes to `{ name: "project-detail", params: { slug } }`; the heading reads "PROJECTS" in Barlow Condensed Black (or falls back to default sans until the `@theme` token lands).

1. Add the route entry to [src/router/index.js](../../src/router/index.js) per the "Public surface — route" snippet above.
   _Verify:_ `npm run dev` and navigate to `http://localhost:5173/projects` — the page no longer renders the empty `App.vue`. (Until step 2 lands, the route resolves to the empty SFC baseline and the page is visually blank; that's expected.)
2. Author [src/views/ProjectListView.vue](../../src/views/ProjectListView.vue) per the "Public surface — view" snippet. Use `<ProjectCard>` as if it exists; if the `project-card` plan has not yet shipped, Vue will warn at runtime ("Failed to resolve component: ProjectCard") and render the slot as nothing — the rest of the page still renders.
   _Verify:_ `npm run dev`; at `http://localhost:5173/projects` the `<h1>PROJECTS</h1>` heading and an 8-cell grid skeleton are visible. At ≥1024 px viewport width, the grid is 4 columns × 2 rows. Resize down through `lg → md → sm → mobile` breakpoints and confirm 4 → 3 → 2 → 1 columns. At 320 px the page has no horizontal scroll.
3. Once the sibling `project-card` plan lands and `src/components/ProjectCard.vue` exists, add the import to `<script setup>`:
   ```js
   import ProjectCard from "@/components/ProjectCard.vue";
   ```
   _Verify:_ the runtime warning goes away; each card renders with the placeholder `title` / `subtitle` / clickable area linking to `/projects/<slug>`.
4. Run `npm run format` to normalize the file to Prettier's 4-space + double-quote style.
   _Verify:_ `npx prettier --check src/views/ProjectListView.vue src/router/index.js` exits 0.

Exit criteria:
- `/projects` renders the page heading and an 8-cell grid at all four target breakpoints (mobile / sm / md / lg).
- `npm run build` succeeds with no warnings.
- Prettier check is clean.

### Phase 2 — Unit and integration tests

End-state: a Vitest spec at [src/\_\_tests\_\_/ProjectListView.spec.js](../../src/__tests__/ProjectListView.spec.js) pins the cardinality (exactly 8 cards), the heading content, the route registration, and the prop shape passed to `<ProjectCard>`. The tests do not assert on responsive column counts (those are CSS-only and not observable in `jsdom`).

1. Create [src/\_\_tests\_\_/ProjectListView.spec.js](../../src/__tests__/ProjectListView.spec.js):

   ```js
   import { describe, it, expect } from "vitest";
   import { mount } from "@vue/test-utils";
   import { createRouter, createMemoryHistory } from "vue-router";

   import ProjectListView from "@/views/ProjectListView.vue";

   const ProjectCardStub = {
       name: "ProjectCard",
       props: ["slug", "title", "subtitle"],
       template: "<a :data-slug=\"slug\">{{ title }}</a>",
   };

   function mountView() {
       const router = createRouter({
           history: createMemoryHistory(),
           routes: [
               { path: "/projects", name: "project-list", component: ProjectListView },
               { path: "/projects/:slug", name: "project-detail", component: { template: "<div />" } },
           ],
       });
       return mount(ProjectListView, {
           global: {
               plugins: [router],
               stubs: { ProjectCard: ProjectCardStub },
           },
       });
   }

   describe("ProjectListView", () => {
       it("renders exactly 8 ProjectCard instances", () => {
           const wrapper = mountView();
           expect(wrapper.findAllComponents(ProjectCardStub)).toHaveLength(8);
       });

       it("renders a PROJECTS h1", () => {
           const wrapper = mountView();
           const heading = wrapper.find("h1");
           expect(heading.exists()).toBe(true);
           expect(heading.text()).toBe("PROJECTS");
       });

       it("passes unique slug, title, and subtitle to every card", () => {
           const wrapper = mountView();
           const cards = wrapper.findAllComponents(ProjectCardStub);
           const slugs = cards.map((card) => card.props("slug"));
           expect(new Set(slugs).size).toBe(8);
           cards.forEach((card) => {
               expect(card.props("title")).toMatch(/^Project /);
               expect(typeof card.props("subtitle")).toBe("string");
           });
       });
   });
   ```

   _Verify:_ `npx vitest run src/__tests__/ProjectListView.spec.js` — all three tests pass.

2. Add a router-level test to a route-table spec (or extend an existing one) that asserts the `project-list` route exists with the expected name and path. If no router spec exists yet, create [src/\_\_tests\_\_/router.spec.js](../../src/__tests__/router.spec.js) — coordinate with sibling route-owning plans so the file isn't fought over. Flagged.
   _Verify:_ `npx vitest run -t "project-list"` resolves the route by name and matches path `/projects`.

Exit criteria:
- All Phase 2 tests pass under `npm run test:unit -- --run`.
- `npx vitest run src/__tests__/ProjectListView.spec.js` exits 0.

### Phase 3 — Security and risk audit

End-state: the view introduces no XSS surface, no `v-html`, no `javascript:` URL exposure, and no third-party assets.

1. Verify no `v-html` in the file. Per [docs/SECURITY.md §3.2](../SECURITY.md), `v-html` is the project's biggest XSS risk; this view uses only `{{ }}` interpolation through `<ProjectCard>`'s props, which Vue auto-escapes.
   _Verify:_ `grep -n "v-html" src/views/ProjectListView.vue` returns no matches.
2. Verify no dynamic `:href` / `:src` constructed from user-controlled input. The eight project records are statically authored inline — no user input, no URL parameters. The card's link target (`{ name: "project-detail", params: { slug } }`) is router-resolved, which Vue Router URL-encodes; even so, document that future migration to a fetched data source must re-evaluate this if `slug` ever becomes user-controlled. Flagged for the future data-source plan.
   _Verify:_ `grep -nE ':href|:src' src/views/ProjectListView.vue` returns no matches in this view (the card owns its own anchor).
3. Verify no third-party fetch / CDN / inline `<script>` / `<iframe>` in the view. None added by this plan.
   _Verify:_ visual inspection of the SFC.
4. Verify no `console.log` / `debugger` left in the file.
   _Verify:_ `grep -nE 'console\.|debugger' src/views/ProjectListView.vue` returns no matches.

Exit criteria: all four verifications pass; no new XSS surface introduced.

### Phase 4 — Accessibility audit

End-state: the page meets WCAG 2.1 AA on the criteria the view directly controls — landmarks, headings, keyboard reach, focus order, contrast at 4.5:1 for the heading, 320 px reflow. The card's internal accessibility (focus ring, ≥44×44 px hit area, accessible link name, `aria-label`s) is the `project-card` plan's responsibility — flagged.

1. **Landmark / heading sanity (WCAG 1.3.1, 2.4.6).** The view's outer `<section>` is the page's main content region — confirm the parent layout in [src/App.vue](../../src/App.vue) wraps `<RouterView />` in `<main>` (project-wide concern; flagged). The `<h1>PROJECTS</h1>` is the page's single H1.
   _Verify:_ open `/projects` in Chrome DevTools → Accessibility tree → the H1 is the first heading; no H2/H3 below skips levels.
2. **Keyboard reach + focus order (WCAG 2.1.1, 2.4.3, 2.4.7).** Tab from the page top — focus lands on each card link in DOM order (which matches visual reading order: row-by-row, left-to-right) across all four breakpoints. Focus is visible on each card.
   _Verify:_ keyboard-only walkthrough per [docs/ACCESSIBILITY.md §3.3](../ACCESSIBILITY.md); confirm each card link receives a visible focus ring (rely on browser defaults until tokens land).
3. **Reflow at 320 px (WCAG 1.4.10).** Set viewport to 320 × 1024; the grid collapses to a single column with no horizontal scroll.
   _Verify:_ Chrome DevTools → Device toolbar → Responsive → 320 px wide; scrollbar is vertical only.
4. **Text contrast (WCAG 1.4.3).** The H1 against the dark base background must hit ≥4.5:1 (large text would relax to ≥3:1 — Barlow Condensed Black at 36 px easily qualifies as "large", but check the canonical ratio anyway). Defers to the `@theme` color tokens; once the project's `--color-surface` / `--color-surface-content` pair is declared, verify with WebAIM Contrast Checker.
   _Verify:_ Stark / Chrome DevTools contrast checker on the rendered H1.
5. **`prefers-reduced-motion`.** This view ships no animation, so the variant is moot. Confirm no `animate-*` / `transition-*` utilities are in the markup.
   _Verify:_ `grep -nE 'animate-|transition-' src/views/ProjectListView.vue` returns no matches.
6. **Automated axe scan.** Once an axe-core integration is wired into the project (cross-cutting; flagged), run it against `/projects`.
   _Verify:_ axe scan produces 0 new violations.

Exit criteria: items 1–5 verified manually; item 6 deferred to the axe-integration plan but tracked.

### Phase 5 — Search-engine-optimization audit

End-state: `/projects` has a meaningful `<title>` via `meta.title`, a descriptive `<h1>`, semantic markup that's crawlable, and an entry in the eventual `public/sitemap.xml`.

1. **Page title.** `meta: { title: "Projects" }` on the route entry feeds the SPA title-announcer pattern from [docs/ACCESSIBILITY.md §4.1](../ACCESSIBILITY.md). When the announcer lands as a cross-cutting concern, `<title>` becomes `Projects — willgerman.dev` (or whatever site name the project plan adopts).
   _Verify:_ once the announcer ships, navigating to `/projects` updates `document.title`.
2. **`<h1>` content.** "PROJECTS" is descriptive of the page topic per WCAG 2.4.6 and SEO best practice.
3. **Sitemap.** [public/sitemap.xml](../../public/sitemap.xml) is currently empty — invalid XML, [docs/FRONTEND.md §11](../FRONTEND.md) flags it as a deploy blocker. When sitemap generation is wired (cross-cutting concern), include `/projects` with priority 0.8 (typical for a top-level listing).
   _Verify:_ once sitemap exists, `<url><loc>https://willgerman.dev/projects</loc></url>` appears.
4. **No `robots` meta tag** preventing indexing on this page. None added by this plan.
5. **Structured data (JSON-LD).** Out of scope for v1. A future SEO-focused pass could add `ItemList` JSON-LD over the eight cards. Flagged as a follow-up, not a v1 blocker.

Exit criteria: items 1–4 verified; item 5 explicitly deferred.

## Success conditions

- At a 320 px viewport, `/projects` renders all 8 cards stacked in a single column with no horizontal scroll; at `sm` (≥640 px) the layout becomes 2 columns × 4 rows; at `md` (≥768 px) it becomes 3 columns over 3 rows (one row contains 2 cards); at `lg` (≥1024 px) it becomes 4 columns × 2 rows. Verifiable by manual breakpoint walk; tested implicitly by visual inspection in Phase 4 step 3.
- The page renders exactly 8 `<ProjectCard>` instances (no more, no fewer) with unique `slug` values. Asserted by the Phase 2 cardinality test in [src/\_\_tests\_\_/ProjectListView.spec.js](../../src/__tests__/ProjectListView.spec.js).
- The page heading is a single `<h1>` with text content `"PROJECTS"`. Asserted by the Phase 2 heading test.
- Clicking (or pressing Enter on a focused) card navigates to `/projects/<slug>` (the `project-detail` route). Verifiable in the dev server once both the `project-card` and `project-detail-view` plans have shipped; not directly asserted in this plan's tests because the card owns the anchor.
- The route `project-list` resolves the path `/projects` and is lazy-loaded (the network panel shows a separate JS chunk for the view on first navigation, not in the entry bundle). Asserted by the Phase 2 router spec entry; lazy-load verified manually via DevTools Network → JS filter.
- `npm run build` succeeds with no warnings; Prettier check is clean; `npm run test:unit -- --run` passes.
- No new `v-html`, `javascript:` URLs, third-party fetch, `console.log`, or `debugger` introduced (Phase 3).

## Flagged for human review

_All items resolved 2026-06-14. Decisions below are binding for the implementing PR. Code snippets in "Generated code" above need to be updated to reflect items marked **[code change]**._

- **`<ProjectCard>` prop shape. [Resolved at sibling plan: `{ title, subtitle?, slug, thumbnail?, thumbnailAlt? }`.] [code change]** Consume `<ProjectCard :title :subtitle :slug :thumbnail :thumbnail-alt />` per the resolved `project-card` plan. Drop the `:subtitle` if all placeholder records omit it; otherwise pass through.

- **`<ProjectCard>` registration. [Resolved: local import via `@/components/ProjectCard.vue`.]** Project convention per [docs/CODING_STANDARDS.md §4 / §5](../CODING_STANDARDS.md).

- **Project records inline in the SFC. [Resolved at project level: THIS PR extracts records to `src/data/projects.js`.] [code change]** Per `_index.md` build order, this view is the second consumer of project records (after `project-detail-view`). As part of this PR's phasing, create `src/data/projects.js` exporting:
  ```js
  export const projects = [
    { slug: "project-one", title: "Project One", subtitle: "Placeholder subtitle", thumbnail: "", thumbnailAlt: "", description: "Placeholder description for the first project." },
    // … through project-eight
  ];
  ```
  Update `ProjectDetailView.vue` (already merged) to import from this module and remove its local copy. Both views share one source of truth from this PR forward.

- **Placeholder titles `Project One` … `Project Eight`. [Resolved at project level: ship placeholders to staging; replace before public launch.]** No action in this PR beyond shipping the placeholders.

- **Tailwind utilities for the responsive grid. [Resolved: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6`.]** Matches the brief. Gap tightens on mobile and breathes on tablet+.

- **Page heading text. [Resolved: defer copy.] [code change]** Match the `main-menu-view` treatment — ship with `[Heading placeholder — TBD]` and a `<!-- TBD content -->` comment. A pre-launch content sweep replaces with real copy.

- **`font-heading-condensed` token name. [Resolved at typography-foundation: `--font-condensed` / utility `font-condensed`.] [code change]** Update template references from `font-heading-condensed` to `font-condensed`.

- **Self-hosted Barlow / Barlow Condensed `@font-face`. [Resolved at typography-foundation.]** Lands in feature #1 of the build order; available by the time this view's Phase 1 ships.

- **Page-level layout wrapper / `<main>` landmark. [Resolved at project level: per-view `<main id="main-content">`.] [code change]** Change the outer wrapper from `<section>` to `<main id="main-content" class="mx-auto max-w-7xl …">`. App.vue does not wrap `<RouterView>` in a `<main>`.

- **SPA route announcer + focus-on-route-change. [Resolved at project level: deferred to `accessibility-shell` follow-up.]** Ship without; this view's `<main id="main-content">` becomes the future skip-link target when the shell pass lands.

- **`<ul role="list">` redundant role. [Resolved: keep the role.]** Compensates for Safari + VoiceOver stripping list semantics when `list-style: none` is implicit. Costs nothing in other browsers.

- **Inline subtitle text repeated 8×. [Resolved at extraction: each record carries its own subtitle field.]** With the data extraction above, each of the eight records has its own `subtitle` placeholder (all identical for now; differ when real content lands). Reviewers should not "fix" the repetition.

- **Router-level test location. [Resolved: assert in the view spec via `findComponent(RouterLink)` / `RouterLinkStub`.]** Do not introduce `src/__tests__/router.spec.js` here. A project-wide router plan owns that file when it lands.

- **Future migration of `slug`-derived links to dynamic data sources. [Resolved: tracked as a non-blocker for v1.]** Statically-authored slugs in `src/data/projects.js` are safe. The XSS / path-traversal re-audit happens when the future data-source plan ships (CMS, JSON manifest, etc.). Document this in the PR description as a known v1-acceptable assumption.

- **`public/sitemap.xml` currently empty. [Resolved at project level: deferred to the deploy plan.]** Not in this PR's scope. The future deploy / SEO plan populates the sitemap with all four routes.
