# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `CLAUDE.md` orienting Claude Code in the repo — points at `docs/` as the source of truth for conventions, lists commands, calls out empty placeholder directories + the `.gitkeep` gotcha, and notes the empty route table / empty `public/sitemap.xml` blockers.
- `.prettierignore` excluding `docs/` and `*.md` so the documentation set keeps its hand-authored formatting.
- `CHANGELOG.md` (this file) following the Keep a Changelog 1.1.0 format.
- `CONTRIBUTING.md` pointing at `docs/` for topic ownership and containing a substantial section on changelog management referencing Keep a Changelog and Semantic Versioning.
- `docs/GIT.md` — branch / commit / PR conventions tied to this repo's Vue/Vite stack (correct remote URL, `npm run test:unit` / `npm run build` / `npm run format` pre-push checklist, Vue-template "must never be committed" list: `.env*`, `dist/`, `.vite/`, `coverage/`).
- `docs/CODING_STANDARDS.md` — JavaScript / Vue 3 `<script setup>` / Pinia setup-style stores / Vue Router named routes / Vitest layout conventions. Includes the baseline `*.vue` file template (empty `<script setup>` + empty `<template>` + `<style scoped>` block carrying `@reference "#app.css"` so scoped styles can `@apply` Tailwind v4 utilities and consume `@theme` tokens without re-emitting the full stylesheet per component) and documents the `composables/` / `services/` / `utilities/` split.
- `docs/FRONTEND.md` — Vue 3 + Vite + Pinia + Vue Router + Tailwind CSS v4 stack reference (zero-config via `@tailwindcss/vite`; theme declared in CSS via `@theme`; composables vs services vs utilities decision matrix; empty-directory and empty-`public/*` warnings).
- `docs/BACKEND.md` — records that the template has no backend; prescribes the integration boundary when an API lands (`apiClient` service in `src/services/`, `useApi()` composable in `src/composables/`, `VITE_API_BASE_URL` env var, Nuxt as the SSR migration path).
- `docs/DESIGN.md` — Tailwind v4 token authoring (`@theme` in CSS, OKLCH over hex, semantic `*-content` pairings) plus a long-form-content (`prose`) subsection covering the `@tailwindcss/typography` plugin.
- `docs/SECURITY.md` — SPA threat model (public bundle, `VITE_*` exposure boundary, `v-html` discipline, CSP at the host, dependency supply chain, token-storage tradeoffs).
- `docs/ACCESSIBILITY.md` — WCAG 2.1 AA + Section 508 standards reference plus Vue 3 applied patterns (route announcements, focus management on route change, skip link, `:aria-*` reactive bindings, `useFocusTrap`, `prefers-reduced-motion`, recommended Vue a11y ecosystem).
- `src/styles/app.css` with `@import "tailwindcss"` + `@plugin "@tailwindcss/typography"`. The relative form (`import "./styles/app.css"`) is wired into `src/main.js`; the subpath form (`@reference "#app.css"`, declared in `package.json#imports`) is consumed by SFC `<style scoped>` blocks.
- `@tailwindcss/typography` (`^0.5.20`) installed via `devDependencies` to satisfy the `@plugin` directive and provide the `prose` class for long-form content.
- `src/views/` scaffolded with four empty SFCs — `HomeView.vue`, `ProjectListView.vue`, `ProjectDetailView.vue`, `StyleGuideView.vue` — each following the baseline template documented in `docs/CODING_STANDARDS.md` §5. **Not yet wired into the route table.**
- `public/robots.txt` and `public/sitemap.xml` as tracked empty placeholders. Populate before any production deploy — an empty `sitemap.xml` is invalid XML and search engines reject it.
- `.claude/launch.json` and `.claude/settings.json` for project-level Claude Code configuration (permissions allowlist, launch config). The local-override `settings.local.json` remains gitignored.
- Empty placeholder directories scaffolded for `src/components/`, `src/services/`, `src/utilities/`, `src/assets/images/`, `src/assets/fonts/`. **Git does not track empty directories** — these will only persist across clones once the first tracked file lands inside each (or a `.gitkeep` is added).

### Changed

- `README.md` restructured around a project title, overview pointing at `docs/`, authors, and project-setup section (install / develop / test / build / format) with sub-sections for recommended IDE and browser setup.
- Reformatted scaffolded `src/` files (`App.vue`, `__tests__/App.spec.js`, `main.js`, `router/index.js`, `stores/counter.js`) per the project's Prettier configuration (4-space indent, double quotes, semicolons, single attribute per line).
- `src/main.js` now imports `./styles/app.css` on the first line so the Tailwind v4 stylesheet is wired into the app entry.
- `index.html` set to `lang="en"` with `<title>Vue Template</title>` (replacing the scaffolded `lang=""` and placeholder `<title>Vite App</title>`); reformatted to Prettier conventions.

[Unreleased]: https://github.com/willgermandev/vue-template/compare/HEAD...HEAD
