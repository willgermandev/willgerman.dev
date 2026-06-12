# Vue Template

## Overview

An opinionated Vue 3 starter template, scaffolded from `create-vue` and tuned with the defaults this project picks up on every new repo:

- **Vue 3** with the Composition API and `<script setup>` only.
- **Vite** for the dev server and production build.
- **Pinia** for state, in the setup-style (`defineStore(id, () => { ... })`).
- **Vue Router** with `createWebHistory(import.meta.env.BASE_URL)`.
- **Tailwind CSS v4** via `@tailwindcss/vite` — zero-config; theme tokens live in CSS via `@theme`, not in a `tailwind.config.js`.
- **Vitest** + `@vue/test-utils` in a `jsdom` environment.
- **Prettier** as the single formatter (4-space indent, double quotes, 100-col, single attribute per line).

Conventions and prescriptive defaults for everything above live in [`docs/`](docs/) — start with [docs/FRONTEND.md](docs/FRONTEND.md) for the stack overview, then branch out as needed:

| Topic                                                    | Doc                                                  |
| -------------------------------------------------------- | ---------------------------------------------------- |
| Vue 3 + Vite + Tailwind v4 stack & patterns              | [docs/FRONTEND.md](docs/FRONTEND.md)                 |
| File naming, JS / Vue / Pinia / Vitest style, Prettier   | [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) |
| Tailwind v4 design tokens                                | [docs/DESIGN.md](docs/DESIGN.md)                     |
| SPA threat model & deploy hardening                      | [docs/SECURITY.md](docs/SECURITY.md)                 |
| WCAG 2.1 AA / Section 508 baseline                       | [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md)       |
| API integration patterns (when a backend lands)          | [docs/BACKEND.md](docs/BACKEND.md)                   |
| Branch names, commit subjects, PRs, merging              | [docs/GIT.md](docs/GIT.md)                           |

For the contribution workflow and changelog management, see [CONTRIBUTING.md](CONTRIBUTING.md). For the release log, see [CHANGELOG.md](CHANGELOG.md). For guidance to Claude Code when working in this repository, see [CLAUDE.md](CLAUDE.md).

## Authors

- **Will German** ([@willgermandev](https://github.com/willgermandev)) — <contact@willgerman.dev>

## Project Setup

### Requirements

- Node `^20.19.0 || >=22.12.0` (enforced via `package.json#engines`).
- npm (ships with Node).

### Install

```sh
npm install
```

### Develop

Vite dev server with HMR on `http://localhost:5173`:

```sh
npm run dev
```

### Test

Vitest in watch mode (jsdom + `@vue/test-utils`):

```sh
npm run test:unit
```

Run a single file or a single test by name:

```sh
npx vitest run src/__tests__/App.spec.js
npx vitest run -t "mounts renders properly"
```

### Build

Production build to `dist/`:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

### Format

Prettier across `src/`:

```sh
npm run format
```

The Markdown / docs set is excluded via [.prettierignore](.prettierignore) so hand-authored formatting in [docs/](docs/) is preserved.

### Recommended IDE setup

[VS Code](https://code.visualstudio.com/) with the extensions listed in [.vscode/extensions.json](.vscode/extensions.json):

- [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) — Vue 3 language support (disable Vetur if installed).
- [Vitest Explorer](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) — run / debug tests from the gutter.
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) — wired as the default formatter with format-on-save in [.vscode/settings.json](.vscode/settings.json).
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) — class-name autocomplete and Tailwind v4 token preview.

### Recommended browser setup

For local dev:

- Chromium browsers — [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) + [enable Custom Object Formatters](http://bit.ly/object-formatters).
- Firefox — [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/) + [enable Custom Object Formatters](https://fxdx.dev/firefox-devtools-custom-object-formatters/).
