# ProjectDetailView scaffold

A deliberately minimal scaffold of [src/views/ProjectDetailView.vue](../../src/views/ProjectDetailView.vue) that resolves a project record by URL slug and renders title, subtitle, and a short description, plus a "back to projects" link. Registers one named route (`project-detail` at `/projects/:slug`) lazy-loaded in [src/router/index.js](../../src/router/index.js). Ships on `feature/project-detail-view` as part of the `willgerman-portfolio` project. Pairs with the sibling `feature/project-list-view` plan, which owns the route the back link returns to and (today) duplicates the same placeholder record list — flagged below as a cross-cutting concern.

## Holistic overview

**Problem or opportunity.** The portfolio's project surface is a two-step flow: a grid (`ProjectListView`) and a detail (`ProjectDetailView`). The detail file exists at [src/views/ProjectDetailView.vue](../../src/views/ProjectDetailView.vue) as the project's baseline SFC template ([CODING_STANDARDS.md §5](../CODING_STANDARDS.md)) — empty `<script setup>`, empty `<template>`, scoped style with `@reference "#app.css"` — and is **not yet wired into the route table** ([src/router/index.js](../../src/router/index.js) ships `routes: []` per [FRONTEND.md §15](../FRONTEND.md)). Without a route and a body, a `ProjectCard` click in the sibling list view has nowhere to go. This feature scaffolds the minimum content the view needs to be navigable: read the `:slug` route param via `useRoute()`, look up a placeholder record, render an `<h1>` (Barlow Condensed Black) for the title, a subtitle (Barlow Light) underneath, a short paragraph of placeholder body text, and a `<RouterLink to="/projects">` for backwards navigation. A "Project not found" state covers unknown slugs.

**Approach.** A single SFC at [src/views/ProjectDetailView.vue](../../src/views/ProjectDetailView.vue) with `<script setup>` that calls `useRoute()` (Vue Router 4) to read `route.params.slug`, resolves a project record from a local `placeholderProjects` lookup keyed by slug, and exposes a `project` computed (or plain ref) to the template. The template renders a `<main>` landmark — the SPA-wide landmark recommended by [ACCESSIBILITY.md §4.2](../ACCESSIBILITY.md) for focus management on route change — containing either the project content (when the slug resolves) or a "Project not found" message with a back link (when it doesn't). The lookup map mirrors the eight placeholder records this project's `feature/project-list-view` plan owns; **the duplication is deliberate for this round** and is the lead "Flagged for human review" item. The route is registered in [src/router/index.js](../../src/router/index.js) with `name: "project-detail"`, `path: "/projects/:slug"`, `component: () => import("@/views/ProjectDetailView.vue")`, and `meta: { title: "Project details" }` ([CODING_STANDARDS.md §7](../CODING_STANDARDS.md), [FRONTEND.md §8](../FRONTEND.md)).

**Constraints.**

- Project SFC baseline ([CODING_STANDARDS.md §5](../CODING_STANDARDS.md)) — `<script setup>`, `<template>`, `<style scoped>` with `@reference "#app.css"`.
- Tailwind v4 with tokens in `@theme` only, no `tailwind.config.js` ([DESIGN.md §1](../DESIGN.md)). Consume tokens by name (`font-condensed`, `font-light`, `font-black`, `text-foreground`, etc.); do not declare new tokens here.
- The typography tokens this view consumes (Barlow / Barlow Condensed, `--color-foreground`, `--color-background`) are owned by the `feature/typography-foundation` plan. This view is a **consumer** — it must not redeclare them.
- Routes use named, kebab-case `name`s; route components lazy-load via dynamic `import()` ([CODING_STANDARDS.md §7](../CODING_STANDARDS.md)).
- WCAG 2.1 AA ([ACCESSIBILITY.md §1](../ACCESSIBILITY.md)) — exactly one `<h1>` per route ([FRONTEND.md §13](../FRONTEND.md)), a `<main>` landmark, descriptive link text ("Back to projects", not "Back" alone — [ACCESSIBILITY.md §1.2 / 2.4.4](../ACCESSIBILITY.md)).
- SPA-wide focus management on route change is **owned by routing-level cross-cutting work**, not by this view ([ACCESSIBILITY.md §4.2](../ACCESSIBILITY.md)). This view ensures the `<main>` landmark exists so that work can target it; the route guard itself is out of scope.
- Slug comes from the URL — untrusted user input. Vue's default escaping in `{{ … }}` covers display ([SECURITY.md §3.1](../SECURITY.md)); the lookup must not blindly trust an unknown slug — the "Project not found" state is the safe fallback. No `v-html`, no `:href` interpolation of the slug ([SECURITY.md §3.2 / §3.3](../SECURITY.md)).
- Prettier 4-space / double-quote / `singleAttributePerLine` ([CODING_STANDARDS.md §9](../CODING_STANDARDS.md), [FRONTEND.md §5](../FRONTEND.md)).
- Node engine matrix `^20.19.0 || >=22.12.0` per [package.json](../../package.json) `engines` — no new dependency is added by this feature.
- **Cross-cutting (NOT owned here):** the placeholder project record source. Today this view's lookup map duplicates the list owned by `feature/project-list-view`. The cross-cutting resolution — extract to `src/data/projects.js` once the second consumer (this feature) lands — is flagged for the project-level `_index.md` synthesis pass.

**Out of scope (considered and deferred):**

- Real project content. The placeholder records ship with deliberately abstract names ("Project One" through "Project Eight"); real names, real descriptions, real screenshots are a future round.
- Image galleries, case-study content, embedded media. The deliverable is title + subtitle + one paragraph; nothing image-bearing.
- A real data source (CMS, JSON file fetch, backend API). The project-wide non-goals enumerate "backend, SSR, CMS" as explicit nons; the data source stays local for now.
- A Pinia store for project records ([FRONTEND.md §9](../FRONTEND.md)). With one local lookup map per view and zero cross-component coordination, a store would be premature ([CODING_STANDARDS.md §2](../CODING_STANDARDS.md)). When the cross-cutting `src/data/projects.js` extraction lands (flagged), it stays a plain ES-module export — still not a store.
- Animations / page transitions. The project-wide non-goals enumerate animations as deferred.
- Sharing / OpenGraph metadata / structured data (JSON-LD). Per-route SEO metadata is project-level work ([ACCESSIBILITY.md §4.1](../ACCESSIBILITY.md) covers `document.title`; OG / JSON-LD belong with a later SEO pass).
- A 404 redirect from `/projects/<unknown-slug>` to a top-level not-found view. This view handles unknown slugs inline ("Project not found" state) so a wrong slug renders gracefully; a top-level 404 route is a separate routing-level concern.
- Per-view SEO `<title>` updates. The `meta: { title }` field is set on the route as preparation for the routing-level `router.afterEach` guard (see [ACCESSIBILITY.md §4.1](../ACCESSIBILITY.md)) but this view does not update `document.title` itself.
- Composables for slug → record resolution. With one consumer and one lookup map, a `useProject(slug)` composable would be premature ([FRONTEND.md §10](../FRONTEND.md)).
- The list view's grid, the `ProjectCard` component, the home menu, the settings sidebar. Each is owned by its own feature plan.

## Generated code

### Public surface

Two files touched, no new files (the SFC already exists as a baseline).

#### File: [src/views/ProjectDetailView.vue](../../src/views/ProjectDetailView.vue) (full replacement)

The existing file is the eight-line baseline template. Replace its body with the script / template / style below.

```vue
<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

// NOTE: This lookup duplicates the placeholder record list owned by
// feature/project-list-view. Cross-cutting concern — flagged in the plan for
// extraction to src/data/projects.js once a second consumer lands. Do not
// extend the list here without coordinating with the list view.
const placeholderProjects = {
    "project-one": {
        title: "Project One",
        subtitle: "A placeholder subtitle for the first project.",
        description:
            "A short placeholder description for the first project. Real content lands in a later round.",
    },
    "project-two": {
        title: "Project Two",
        subtitle: "A placeholder subtitle for the second project.",
        description:
            "A short placeholder description for the second project. Real content lands in a later round.",
    },
    "project-three": {
        title: "Project Three",
        subtitle: "A placeholder subtitle for the third project.",
        description:
            "A short placeholder description for the third project. Real content lands in a later round.",
    },
    "project-four": {
        title: "Project Four",
        subtitle: "A placeholder subtitle for the fourth project.",
        description:
            "A short placeholder description for the fourth project. Real content lands in a later round.",
    },
    "project-five": {
        title: "Project Five",
        subtitle: "A placeholder subtitle for the fifth project.",
        description:
            "A short placeholder description for the fifth project. Real content lands in a later round.",
    },
    "project-six": {
        title: "Project Six",
        subtitle: "A placeholder subtitle for the sixth project.",
        description:
            "A short placeholder description for the sixth project. Real content lands in a later round.",
    },
    "project-seven": {
        title: "Project Seven",
        subtitle: "A placeholder subtitle for the seventh project.",
        description:
            "A short placeholder description for the seventh project. Real content lands in a later round.",
    },
    "project-eight": {
        title: "Project Eight",
        subtitle: "A placeholder subtitle for the eighth project.",
        description:
            "A short placeholder description for the eighth project. Real content lands in a later round.",
    },
};

const route = useRoute();
const project = computed(() => placeholderProjects[route.params.slug] ?? null);
</script>

<template>
    <main class="mx-auto max-w-3xl px-6 py-16">
        <template v-if="project">
            <h1 class="font-condensed text-5xl font-black uppercase tracking-wide">
                {{ project.title }}
            </h1>
            <p class="mt-4 font-light text-xl">
                {{ project.subtitle }}
            </p>
            <p class="mt-8 text-base leading-relaxed">
                {{ project.description }}
            </p>
        </template>
        <template v-else>
            <h1 class="font-condensed text-5xl font-black uppercase tracking-wide">
                Project not found
            </h1>
            <p class="mt-4 font-light text-xl">
                We couldn't find a project for that URL.
            </p>
        </template>
        <p class="mt-12">
            <RouterLink
                to="/projects"
                class="underline underline-offset-4"
            >
                &larr; Back to projects
            </RouterLink>
        </p>
    </main>
</template>

<style scoped>
    @reference "#app.css";
</style>
```

Notes on the snippet:

- **`useRoute()`** is the Composition-API way to read the active route — preferred over `this.$route` (Options API is not used in this project per [CODING_STANDARDS.md §2 / §5](../CODING_STANDARDS.md)).
- **`computed(() => placeholderProjects[route.params.slug] ?? null)`** makes `project` reactive to slug changes — important because Vue Router reuses the component instance when the route param changes ([FRONTEND.md §8](../FRONTEND.md)). Without `computed`, navigating from `/projects/project-one` to `/projects/project-two` via in-app link would not update the view.
- **`route.params.slug`** is a string from the URL. The lookup either hits a key or returns `undefined`; `?? null` normalizes to `null` so the template's `v-if="project"` reads cleanly.
- **`<main>` landmark** satisfies the SPA-wide focus-management requirement in [ACCESSIBILITY.md §4.2](../ACCESSIBILITY.md): the cross-cutting routing guard targets `<main>` on route change. Without it, focus would stay on the back link from the prior page after the user lands here.
- **One `<h1>` per route** ([ACCESSIBILITY.md §1.2 / 2.4.6](../ACCESSIBILITY.md), [FRONTEND.md §13](../FRONTEND.md)). Both render paths (`project` and unknown-slug) ship exactly one. No skipped heading levels — the subtitle is a `<p>` styled like a subhead, not an `<h2>`, because there is no `<h2>`-level content beneath it.
- **`font-condensed text-5xl font-black uppercase tracking-wide`** consumes the `--font-condensed` utility owned by `feature/typography-foundation` plus Tailwind v4's built-in size / weight / transform / tracking utilities. `font-black` (weight 900) matches the Black 900 weight that `feature/typography-foundation` ships; lighter weights on Barlow Condensed would synthesize, which the typography plan warns against.
- **`font-light text-xl`** for the subtitle: Barlow Light 300 at `text-xl` (1.25rem) renders the subtitle as a visually subordinate line ([DESIGN.md §3](../DESIGN.md) prescribes four common weights including `font-light`).
- **`text-base leading-relaxed`** for the description: default body size with comfortable line-height for readability ([DESIGN.md §3](../DESIGN.md)).
- **`max-w-3xl mx-auto px-6 py-16`** is a basic page-shell shape ([DESIGN.md §8](../DESIGN.md)). `max-w-3xl` (48rem / 768px) is a documented "readable measure" for prose content. No `lg:` / `sm:` overrides in this round — the shape works at both phone and desktop without further breakpoint logic.
- **Back link is a `<RouterLink to="/projects">`** — uses Vue Router's anchor render so navigation is client-side ([FRONTEND.md §8](../FRONTEND.md), no full page reload). Plain path string is used here because the named route `projects` is owned by the sibling `feature/project-list-view` plan and may not yet be registered when this view ships in isolation — flagged below.
- **Descriptive link text** "← Back to projects" satisfies WCAG 2.4.4 (Link Purpose in Context) and 2.5.3 (Label in Name). The `&larr;` HTML entity (U+2190 LEFTWARDS ARROW) renders as a visual cue; assistive tech reads it as "left arrow" or skips it depending on the SR, but the text after it carries the meaning.
- **No `:href` or `:src` interpolation of the slug** ([SECURITY.md §3.3](../SECURITY.md)). The slug is read for a lookup; it is never written into an attribute. Display of `project.title` / `project.subtitle` / `project.description` goes through `{{ … }}` which is auto-escaped by Vue ([SECURITY.md §3.1](../SECURITY.md)).
- **`<style scoped>` with `@reference "#app.css"`** preserves the project's SFC baseline ([CODING_STANDARDS.md §5](../CODING_STANDARDS.md)) so any later `@apply` of project utilities works without re-importing.

#### File: [src/router/index.js](../../src/router/index.js) (targeted edit)

The existing file has `routes: []`. Add one entry for this view. The sibling `feature/project-list-view` plan owns the `projects` named route; this plan adds **only** the `project-detail` entry. If the list-view route is not yet registered when this branch merges, the `<RouterLink to="/projects">` back link will resolve to a path-string but won't match a registered route — flagged below.

```js
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/projects/:slug",
            name: "project-detail",
            component: () => import("@/views/ProjectDetailView.vue"),
            meta: { title: "Project details" },
        },
    ],
});

export default router;
```

Notes:

- **`path: "/projects/:slug"`** — `:slug` is the URL param, available as `route.params.slug` in the SFC.
- **`name: "project-detail"`** — kebab-case per [CODING_STANDARDS.md §7](../CODING_STANDARDS.md). Downstream `<RouterLink>`s should prefer `{ name: "project-detail", params: { slug } }` over path-string construction.
- **`component: () => import("@/views/ProjectDetailView.vue")`** — lazy-loaded per [CODING_STANDARDS.md §7](../CODING_STANDARDS.md) and the example in [FRONTEND.md §8](../FRONTEND.md). The `@/*` alias is wired in [vite.config.js](../../vite.config.js) and mirrored in [jsconfig.json](../../jsconfig.json).
- **`meta: { title: "Project details" }`** — the SPA-wide `router.afterEach` guard described in [ACCESSIBILITY.md §4.1](../ACCESSIBILITY.md) will consume this to set `document.title`. The static fallback "Project details" covers the case where the guard isn't yet wired or the slug is unknown; a future round can switch to a dynamic title derived from the project record. The route definition's `meta.title` does not need to know the actual project name in this round — that's a per-view concern that comes after the routing guard lands.

### Test

One new file: [src/__tests__/ProjectDetailView.spec.js](../../src/__tests__/ProjectDetailView.spec.js).

Follow the test pattern in [src/__tests__/App.spec.js](../../src/__tests__/App.spec.js) — `mount` from `@vue/test-utils`, plus an in-memory router for routed views per [CODING_STANDARDS.md §8](../CODING_STANDARDS.md).

```js
import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";

import ProjectDetailView from "@/views/ProjectDetailView.vue";

function makeTestRouter(initialPath) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            {
                path: "/projects",
                name: "projects",
                component: { template: "<div />" },
            },
            {
                path: "/projects/:slug",
                name: "project-detail",
                component: ProjectDetailView,
            },
        ],
    });
    router.push(initialPath);
    return router;
}

async function mountAt(path) {
    const router = makeTestRouter(path);
    await router.isReady();
    return mount(ProjectDetailView, {
        global: { plugins: [router] },
    });
}

describe("ProjectDetailView", () => {
    it("renders the resolved project title for a known slug", async () => {
        const wrapper = await mountAt("/projects/project-one");
        expect(wrapper.find("h1").text()).toBe("Project One");
    });

    it("renders the not-found state for an unknown slug", async () => {
        const wrapper = await mountAt("/projects/does-not-exist");
        expect(wrapper.find("h1").text()).toBe("Project not found");
    });

    it("renders a back link to the projects list", async () => {
        const wrapper = await mountAt("/projects/project-one");
        const backLink = wrapper.find("a[href='/projects']");
        expect(backLink.exists()).toBe(true);
        expect(backLink.text()).toContain("Back to projects");
    });
});
```

The three tests cover the three success conditions: (1) known-slug happy path, (2) unknown-slug "Project not found" branch, (3) the back link's `href` resolves to `/projects` and carries descriptive text. `createMemoryHistory()` works in `jsdom` per [CODING_STANDARDS.md §8](../CODING_STANDARDS.md); the test router registers a stub `projects` route so `<RouterLink to="/projects">` resolves cleanly even though that route is owned by the sibling feature.

## Phased implementation plan

### Phase 1 — Feature build-out

End-state: `/projects/project-one` (or any of the eight placeholder slugs) renders an `<h1>` with the project title, a subtitle line, a short paragraph, and a working "Back to projects" link. `/projects/nonexistent` renders the "Project not found" state with the same back link. The route is registered, lazy-loaded, and named `project-detail`.

1. **Replace [src/views/ProjectDetailView.vue](../../src/views/ProjectDetailView.vue)** with the script / template / style above.
    - _Verify:_ `npm run dev` boots without an error; the SFC parses (no Vue compiler warnings in the dev server output).
2. **Update [src/router/index.js](../../src/router/index.js)** to add the `project-detail` route entry shown above. Preserve the existing `createRouter` / `createWebHistory(import.meta.env.BASE_URL)` shape.
    - _Verify:_ `npm run dev`; in the browser, navigate to `http://localhost:5173/projects/project-one` — the view paints with title "Project One", a subtitle line, a description paragraph, and a "← Back to projects" link. Navigate to `http://localhost:5173/projects/does-not-exist` — the view paints "Project not found" with the back link.
3. **Confirm lazy-loading.** Open DevTools → Network panel, hard-reload `/projects/project-one`, and confirm the `ProjectDetailView` chunk arrives as a separate `.js` file (not bundled into `index.js`).
    - _Verify:_ Network panel shows a `ProjectDetailView-*.js` (or similar Vite-fingerprinted) chunk loaded on first navigation to the route.
4. **Confirm the back link round-trips without a full reload.** Click "← Back to projects" from `/projects/project-one`; the URL updates to `/projects` and the browser does not full-reload (no Network re-fetch of `index.html`). If the `projects` named route is not yet registered (because `feature/project-list-view` hasn't merged), the URL still updates but no view paints under the back-link target — flag noted; do not block this branch on that ordering.
    - _Verify:_ DevTools Network panel shows no `index.html` reload on back-link click; the URL bar updates to `/projects`.
5. **Run `npm run format`** to apply Prettier's 4-space / double-quote / `singleAttributePerLine` rules.
    - _Verify:_ `npm run format` produces no further diff on a re-run.
6. **Run `npm run build`** to confirm the production build succeeds and includes the route's chunk.
    - _Verify:_ `npm run build` exits `0`; `dist/assets/` contains a `ProjectDetailView`-named (fingerprinted) chunk.

Exit criteria: known slugs render the placeholder record; unknown slugs render "Project not found"; the back link is client-side; `npm run build` succeeds; Prettier is clean.

### Phase 2 — Unit and integration tests

End-state: Vitest spec at [src/__tests__/ProjectDetailView.spec.js](../../src/__tests__/ProjectDetailView.spec.js) passes locally and in CI.

1. **Create [src/__tests__/ProjectDetailView.spec.js](../../src/__tests__/ProjectDetailView.spec.js)** with the three tests above.
    - _Verify:_ `npx vitest run src/__tests__/ProjectDetailView.spec.js` reports 3 passing tests.
2. **Run the full suite** to confirm no regression in the existing `App.spec.js` (or `MenuButton.spec.js` if `feature/menu-button` has merged ahead of this branch).
    - _Verify:_ `npm run test:unit -- --run` (or `npx vitest run`) ends green across the project.

Exit criteria: all Vitest specs pass; the new spec covers (1) known-slug title, (2) unknown-slug not-found, (3) back-link `href` + text.

### Phase 3 — Security and risk audit

End-state: the view does not introduce XSS, supply-chain, or input-handling risk; the slug param is handled safely.

1. **Slug is untrusted URL input.** Confirm the slug is used **only** as a key into the local lookup map (which has a fixed key set) and **never** written into an attribute or DOM string ([SECURITY.md §3.3](../SECURITY.md)). The lookup `placeholderProjects[route.params.slug]` is safe — a non-matching key returns `undefined` and the template falls through to the "Project not found" branch.
    - _Verify:_ Navigate to `http://localhost:5173/projects/%3Cscript%3Ealert(1)%3C%2Fscript%3E` (URL-encoded `<script>alert(1)</script>`); the view renders the "Project not found" state, no script executes, no `<script>` tag appears in the DOM.
2. **Display goes through `{{ … }}` only** — no `v-html` ([SECURITY.md §3.2](../SECURITY.md)).
    - _Verify:_ `grep -n 'v-html' src/views/ProjectDetailView.vue` returns no matches.
3. **No new dependency.** `vue-router` was already in `dependencies`; `useRoute()` is part of the existing `vue-router` API.
    - _Verify:_ `git diff main -- package.json package-lock.json` is empty for this branch.
4. **No `:href` / `:src` interpolation of the slug.** The back link's `to="/projects"` is a static path; no dynamic URL is built from `route.params.slug`.
    - _Verify:_ `grep -n 'route.params' src/views/ProjectDetailView.vue` shows the param used only in the `computed(...)` lookup, not in any template binding.
5. **No `console.log` / `debugger` left in the diff** ([SECURITY.md §2.1 / §10.1](../SECURITY.md), [GIT.md §8](../GIT.md)).
    - _Verify:_ `grep -nE 'console\.|debugger' src/views/ProjectDetailView.vue src/router/index.js` returns no matches in the new code.

Exit criteria: every check above passes; the slug is treated as untrusted; no new dependency; no `v-html`; no script execution from a crafted slug.

### Phase 4 — Accessibility audit

End-state: the view meets the WCAG 2.1 AA / Section 508 baseline relevant to a simple read-only page ([ACCESSIBILITY.md §1](../ACCESSIBILITY.md), [FRONTEND.md §13](../FRONTEND.md)).

1. **Single `<h1>` per route** ([ACCESSIBILITY.md §1.3 / 1.3.1](../ACCESSIBILITY.md), [FRONTEND.md §13](../FRONTEND.md)). Both render paths ship exactly one `<h1>`.
    - _Verify:_ Mount the view at `/projects/project-one`, inspect the DOM — exactly one `<h1>`. Repeat at `/projects/nonexistent` — exactly one `<h1>` reading "Project not found".
2. **`<main>` landmark** ([ACCESSIBILITY.md §1.1 / 1.3.1, §4.2](../ACCESSIBILITY.md)). The template's root inside the SFC is a `<main>`, so the cross-cutting routing-level focus guard can `document.querySelector("main")` reliably.
    - _Verify:_ DOM inspection confirms the SFC root rendered into `App.vue` includes a `<main>` element wrapping all content.
3. **Heading hierarchy is not skipped** — no `<h3>` without an `<h2>`. This view has only `<h1>` and `<p>`; nothing is skipped because nothing lower exists.
    - _Verify:_ Run axe DevTools on `/projects/project-one`; no "Heading levels should only increase by one" violation.
4. **Descriptive link text** ([ACCESSIBILITY.md §1.2 / 2.4.4](../ACCESSIBILITY.md)). "Back to projects" is meaningful out of context; the arrow `&larr;` is decorative.
    - _Verify:_ Browser accessibility panel (Chrome DevTools → Elements → Accessibility) reports the link's accessible name as "← Back to projects" or equivalent — meaningful without the page context.
5. **Keyboard navigation.** Tab into the back link; the focus indicator is visible (browser default ring, since this view does not override it). Enter activates the link, navigating to `/projects`.
    - _Verify:_ Manual keyboard pass per [ACCESSIBILITY.md §3.3](../ACCESSIBILITY.md) — Tab → back link receives focus with a visible ring; Enter navigates.
6. **Contrast.** White Barlow text on the black background ships 21:1 ([feature/typography-foundation](typography-foundation.md) ships these tokens). The underline on the back link does not change the foreground color, so the underlined text stays at 21:1.
    - _Verify:_ Sampled in DevTools' Color picker on the rendered `<a>` — `color: rgb(255, 255, 255)` against `background-color: rgb(0, 0, 0)`; WebAIM Contrast Checker reports 21:1.
7. **No `outline-none` without a matching `focus-visible:ring-*`** ([FRONTEND.md §13](../FRONTEND.md)).
    - _Verify:_ `grep -n 'outline-none' src/views/ProjectDetailView.vue` returns no matches.
8. **Unknown-slug state is accessible.** The "Project not found" branch also ships an `<h1>` and the back link, so users who land on a bad URL aren't trapped.
    - _Verify:_ Mount at `/projects/nonexistent` and Tab through — the back link is reachable and activatable.
9. **`prefers-reduced-motion`** — N/A; this view introduces no animation.

Exit criteria: all eight applicable checks pass; manual keyboard + axe-DevTools sweep on both render paths is documented in the PR description.

### Phase 5 — Search-engine-optimization audit

End-state: the SEO surface is consciously deferred to a later round; nothing in this view actively harms SEO.

1. **`document.title`** — set by the cross-cutting `router.afterEach` guard ([ACCESSIBILITY.md §4.1](../ACCESSIBILITY.md)) that consumes the route's `meta.title`. This view registers `meta: { title: "Project details" }` so the guard, once wired, has a string to use.
    - _Verify:_ When the routing-level guard is wired in a later feature, `document.title` becomes `"Project details — …"` (or the suffix that feature picks) on navigation to this route. This branch ships the `meta` field; the guard itself is out of scope here.
2. **Meta description, canonical URL, OG / Twitter cards, JSON-LD** — all deferred. The project-wide non-goals enumerate "backend, SSR" as nons, and pre-render / SSR is what most SPA SEO tooling assumes; client-rendered `<head>` updates land in a later SEO-pass round.
    - _Verify:_ Documented as deferred; no `<head>` mutation code in this view.
3. **`sitemap.xml`** — [public/sitemap.xml](../../public/sitemap.xml) is currently empty and per [CLAUDE.md](../../CLAUDE.md) must be populated before deploy. Adding `/projects/:slug` URLs to the sitemap is sitemap-feature work, not this view's concern; the URLs become candidates once the eight placeholder slugs are known to be stable, which they are not yet (the placeholder list will change).
    - _Verify:_ This view documents that `/projects/:slug` is one of the URLs the sitemap pass will need to cover.
4. **`robots.txt`** — unchanged; [public/robots.txt](../../public/robots.txt) is empty (parses as "allow all" per [CLAUDE.md](../../CLAUDE.md) / [FRONTEND.md §11](../FRONTEND.md)), which is the desired posture for a portfolio.
    - _Verify:_ No change to [public/robots.txt](../../public/robots.txt).
5. **Redirect chain for renamed slugs** — N/A; the placeholder slugs are arbitrary, and renaming any of them later is breaking (no external link is yet pointed at them). When the real project slugs land, a slug-stability pass is its own follow-up.

Exit criteria: the route's `meta.title` is set; per-view `<head>` updates and sitemap inclusion are documented as deferred; nothing in this view actively harms SEO.

## Success conditions

- Navigating to `http://localhost:5173/projects/project-one` in the dev server renders an `<h1>` reading "Project One" in Barlow Condensed Black (the `font-condensed text-5xl font-black` utilities resolve through the `feature/typography-foundation` tokens), a subtitle line in Barlow Light, a short paragraph of placeholder description text, and a "← Back to projects" link.
- Navigating to `http://localhost:5173/projects/does-not-exist` renders an `<h1>` reading "Project not found", a one-line explanatory subtitle, and the same "← Back to projects" link. No script executes when the URL-encoded `<script>alert(1)</script>` slug is supplied — the view still falls into the not-found branch.
- Clicking "← Back to projects" updates the URL to `/projects` without a full page reload (DevTools Network panel shows no `index.html` re-fetch).
- The route is registered in [src/router/index.js](../../src/router/index.js) with `name: "project-detail"`, `path: "/projects/:slug"`, `component: () => import("@/views/ProjectDetailView.vue")`, and `meta: { title: "Project details" }`. The route's component chunk arrives as a separate fingerprinted file in the production build under `dist/assets/`.
- The Vitest spec at [src/__tests__/ProjectDetailView.spec.js](../../src/__tests__/ProjectDetailView.spec.js) reports three passing tests covering: (1) known-slug renders the project title in an `<h1>`, (2) unknown-slug renders "Project not found" in an `<h1>`, (3) the back link resolves `href="/projects"` and carries the text "Back to projects".

## Flagged for human review

_All items resolved 2026-06-14. Decisions below are binding for the implementing PR. Code snippets in "Generated code" above need to be updated to reflect items marked **[code change]**._

- **Duplicated placeholder project records. [Resolved at project level: extraction to `src/data/projects.js` performed by `project-list-view` PR.] [code change]** This view ships its own local copy of the eight placeholder records in the first round. When `project-list-view` lands (next in build order), it extracts the shared records to `src/data/projects.js` and updates this view to import the same module. Until then, the local copy here is intentional.

- **Unknown-slug behavior. [Resolved: inline "Project not found" + back link.]** Preserve the URL (helpful for debugging) and render a slug-specific "Project not found" message with the chevron back-to-list affordance. The global catch-all (`:pathMatch(.*)*` → home, owned by `main-menu-view`) catches `/garbage` etc.; this view owns `/projects/<bad-slug>` specifically.

- **Back link `to` form. [Resolved: ship path string `to="/projects"`; switch to named route in `project-list-view`'s PR.]** Per build order, this view ships before `project-list-view` registers `name: "project-list"`. Use `to="/projects"` here for now. Add an inline `// TODO(project-list-view): switch to { name: 'project-list' } once that route registers` comment. `project-list-view` performs the swap as part of its phasing.

- **Eight placeholder strings boilerplate. [Resolved at project level: replaced at extraction.]** Ship the eight explicit entries with ordinal-word differentiation (`Project One` / `Project Two` / …). The extraction to `src/data/projects.js` in `project-list-view`'s PR deletes the duplicate copy here.

- **Records shape. [Resolved: array with `slug` field.] [code change]** Use an array — `const placeholderProjects = [{ slug: "project-one", ... }, ...]` — and look up via `placeholderProjects.find(p => p.slug === route.params.slug)`. Matches what `src/data/projects.js` will eventually export (natural for `v-for` in the list view; consistent type shape across consumers).

- **`meta.title` is static. [Resolved: ship the static `meta.title: "Project details"`.]** Dynamic per-record titles (e.g. `"Project One — willgerman.dev"`) require a head-management library and ship in the future `feature/seo-head-management` plan tracked at project level. The static title is sufficient for the scaffold.

- **Back-link accessible name. [Resolved: ship without `aria-label`; visible text carries the meaning.]** The visible text "Back to projects" already carries the meaning; most screen readers handle the `&larr;` arrow as visual chrome without announcing it. Adding `aria-label` would risk WCAG 2.5.3 (Label in Name) failure if the labels ever drift.

- **`<main>` landmark posture. [Resolved at project level: per-view `<main id="main-content">`.]** This view's root is `<main id="main-content">`. App.vue does NOT wrap `<RouterView>` in a `<main>`. The `accessibility-shell` follow-up plan audits and confirms.

- **No responsive overrides on the page shell. [Resolved: ship single-shape shell `max-w-3xl mx-auto px-6 py-16`.]** No per-breakpoint overrides in this round. Visual polish lands in a future round (likely a project-wide `feature/responsive-polish` PR).

- **`text-5xl` for the `<h1>`. [Resolved: ship `text-5xl` (3rem / 48px).]** Generous, game-menu-aesthetic feel. Revisit if visual review wants tighter / looser.

- **No animation between not-found and found states. [Resolved: ship without `<Transition>`.]** Consistent with the project-wide animation non-goal. Revisit when the project-wide animation posture is decided.
