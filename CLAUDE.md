# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Where conventions live

Project-wide conventions are codified in [docs/](docs/). Read the relevant doc before acting on the corresponding surface — this file orients; the docs prescribe.

| Topic                                                  | Doc                                                  |
| ------------------------------------------------------ | ---------------------------------------------------- |
| Branch names, commit subjects, PRs, merging            | [docs/GIT.md](docs/GIT.md)                           |
| File naming, JS / Vue / Pinia / Vitest style, Prettier | [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) |
| Vue 3 + Vite + Tailwind v4 stack & patterns            | [docs/FRONTEND.md](docs/FRONTEND.md)                 |
| Tailwind v4 design tokens                              | [docs/DESIGN.md](docs/DESIGN.md)                     |
| SPA threat model & deploy hardening                    | [docs/SECURITY.md](docs/SECURITY.md)                 |
| WCAG 2.1 AA / Section 508 baseline                     | [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md)       |
| API integration patterns (when a backend lands)        | [docs/BACKEND.md](docs/BACKEND.md)                   |
| Contribution workflow & changelog                      | [CONTRIBUTING.md](CONTRIBUTING.md)                   |

## Active feature plans

Per-feature implementation plans for the willgerman.dev portfolio's first round live in [docs/feature-plans/](docs/feature-plans/). The index at [docs/feature-plans/\_index.md](docs/feature-plans/_index.md) tracks the build order, cross-cutting decisions, and links to every per-feature plan. All flagged decisions are resolved (2026-06-14); the plans are binding for their implementing PRs. Read the index before starting any implementation work in this round.

## Commands

- `npm run dev` — Vite dev server with HMR.
- `npm run build` — Production build to `dist/`.
- `npm run preview` — Serve the built `dist/` for local sanity-check.
- `npm run test:unit` — Vitest in watch mode (jsdom environment, excludes `e2e/**`).
  - Single file: `npx vitest run src/__tests__/App.spec.js`
  - By test name: `npx vitest run -t "mounts renders properly"`
- `npm run format` — Prettier write across `src/` (uses the experimental CLI flag).

Node engines: `^20.19.0 || >=22.12.0` (enforced via `package.json#engines`).

## Architecture

Vue 3 + Vite SPA scaffolded from the official `create-vue` template, kept intentionally minimal as a starting point.

- **Entry**: [index.html](index.html) (now `lang="en"` and `<title>Vue Template</title>`) mounts [src/main.js](src/main.js), which imports `./styles/app.css` and then composes the app with Pinia and Vue Router before mounting `#app`. Any global plugin (i18n, error reporter, etc.) belongs in `main.js`.
- **Routing**: [src/router/index.js](src/router/index.js) uses `createWebHistory(import.meta.env.BASE_URL)` with an **empty `routes` array**. Five scaffolded views exist under [src/views/](src/views/) (`HomeView.vue`, `ProjectListView.vue`, `ProjectDetailView.vue`, `SettingsView.vue`, `StyleGuideView.vue`) but none are wired — every URL currently renders the empty `App.vue`. Wiring them is the obvious next step; the per-feature plans under [docs/feature-plans/](docs/feature-plans/) cover Home, Settings, ProjectList, and ProjectDetail (StyleGuide is not yet planned).
- **State**: Pinia stores live in `src/stores/` and use the **setup-style** `defineStore(id, () => { ... })` pattern (see [src/stores/counter.js](src/stores/counter.js)), not options style.
- **Styling**: Tailwind CSS v4 via the `@tailwindcss/vite` plugin ([vite.config.js](vite.config.js)). No `tailwind.config.js` — v4 configures tokens inside CSS via `@theme`. [src/styles/app.css](src/styles/app.css) loads `tailwindcss` + the typography plugin, declares `@font-face` rules for self-hosted Barlow / Barlow Condensed under [src/assets/fonts/](src/assets/fonts/), and an `@theme` block declares `--font-sans` (Barlow), `--font-condensed` (Barlow Condensed), `--color-background`, and `--color-foreground`; see [docs/DESIGN.md](docs/DESIGN.md) for the canonical token list. The VS Code workspace treats `*.css` as `tailwindcss` for IntelliSense.
- **Tests**: Vitest with `jsdom` and `@vue/test-utils`. Tests colocate under `src/__tests__/` and use `*.spec.js`. Config in [vitest.config.js](vitest.config.js) merges the Vite config so the `@` alias works inside tests.

### Path aliases & imports

- `@/*` → `src/*` is wired in three places that must stay in sync: [vite.config.js](vite.config.js) (`resolve.alias`), [jsconfig.json](jsconfig.json) (editor IntelliSense), and inherited by Vitest via `mergeConfig`.
- `package.json#imports` declares a subpath import `#app.css` → `./src/styles/app.css`. The relative path (`./styles/app.css`) is used by `main.js`; the subpath form is preferred from contexts where a stable anchor matters (notably `@reference "#app.css"` inside SFC `<style scoped>` blocks).

## Source structure

```
src/
    App.vue, main.js
    router/index.js                # empty route table — see Architecture
    stores/counter.js              # Pinia setup-style example
    views/                         # 5 scaffolded SFCs, not yet routed
    components/                    # MenuButton.vue, Modal.vue, ProjectCard.vue (baseline SFCs)
    services/                      # EMPTY placeholder — API clients, non-reactive logic
    utilities/                     # EMPTY placeholder — pure stateless helpers
    styles/app.css                 # tailwindcss + typography plugin + @font-face + @theme (font + base color tokens)
    assets/fonts/                  # self-hosted Barlow + Barlow Condensed .woff2 files + OFL.txt
    assets/images/                 # EMPTY placeholder
    __tests__/App.spec.js
```

⚠️ **Git does not track empty directories.** The remaining empty placeholders above (`services/`, `utilities/`, `assets/images/`) will not appear on a fresh clone until the first tracked file lands in each — drop a `.gitkeep` if persisting the scaffold matters. The same is true for [public/robots.txt](public/robots.txt) and [public/sitemap.xml](public/sitemap.xml) which are tracked but **empty** — populate before deploy (empty `sitemap.xml` is invalid XML and search engines reject it).

## Conventions

- **Prettier**: 4-space indent, semicolons, double quotes, `printWidth: 100`, `singleAttributePerLine: true`, `vueIndentScriptAndStyle: true`. Run `npm run format` rather than hand-formatting.
- **Vue SFCs**: `<script setup>` (Composition API) only. Every new `*.vue` file starts from the baseline template in [docs/CODING_STANDARDS.md §5](docs/CODING_STANDARDS.md) — empty `<script setup>` + empty `<template>` + `<style scoped>` block with `@reference "#app.css"` so scoped styles can `@apply` Tailwind utilities and consume `@theme` tokens. The four views under `src/views/` already follow this baseline.
- **Pinia stores**: setup style only (one concern per store, ID matches filename).
- **Reusable logic split**: composables (reactive, `use*` prefix) → `src/composables/` (create when needed); services (non-reactive) → `src/services/`; pure helpers → `src/utilities/`. See [docs/FRONTEND.md §10](docs/FRONTEND.md) for the decision matrix.
- **Routes**: every route has a kebab-case `name`; route components are lazy-loaded via dynamic `import()`. See [docs/CODING_STANDARDS.md §7](docs/CODING_STANDARDS.md).
