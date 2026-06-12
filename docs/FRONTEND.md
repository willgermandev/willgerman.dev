# FRONTEND

Frontend stack reference for this Vue 3 + Vite template: tools, build pipeline, component / store / router conventions, and how the pieces fit together.

This is the **stack + conventions** doc. For visual design tokens (colors, fonts, spacing, radii, shadows) see [DESIGN.md](DESIGN.md). For project-wide code style (naming, modules, tests) see [CODING_STANDARDS.md](CODING_STANDARDS.md). For (currently absent) backend integration patterns when an API is added see [BACKEND.md](BACKEND.md).

---

## 1. Stack at a glance

| Concern                  | Tool                              | Version       | Status                                                                                                |
| ------------------------ | --------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------- |
| UI framework             | Vue 3                             | ^3.5.32       | Active — Composition API + `<script setup>`                                                            |
| Build / dev server       | Vite                              | ^8.0.8        | Active                                                                                                |
| State management         | Pinia                             | ^3.0.4        | Active — setup-style stores                                                                            |
| Routing                  | Vue Router                        | ^5.0.4        | Active — `createWebHistory` with `BASE_URL`                                                            |
| Utility CSS              | Tailwind CSS v4                   | ^4.3.0        | Active via `@tailwindcss/vite` (zero-config; theme in CSS via `@theme`)                                |
| Form-input validation    | `validator`                       | ^13.15.35     | Available — string-level validators (email, URL, etc.) for client-side UX                              |
| Tests                    | Vitest + `@vue/test-utils`        | ^4.1.4 / ^2.4 | Active in `jsdom` environment                                                                          |
| Vue devtools (Vite)      | `vite-plugin-vue-devtools`        | ^8.1.1        | Recommended; not yet wired in [vite.config.js](../vite.config.js) — add the plugin when adopting       |
| Code formatter           | Prettier                          | 3.8.3         | Active — owns JS, Vue, CSS, JSON, MD                                                                   |

**No component library** (no DaisyUI, Vuetify, Naive UI, etc.). Component patterns are built from Tailwind utilities + Vue SFCs. If a library is adopted, document the integration here and update [DESIGN.md](DESIGN.md) for token mapping.

**No HTTP client.** Decide between `fetch` (built in, fine) and `axios` / `ofetch` when the first API call lands.

**No icon library.** Inline SVG works for early scaffolding; pick `@heroicons/vue`, `lucide-vue-next`, or `unplugin-icons` before the third duplicate inline SVG appears.

Versions from [package.json](../package.json).

---

## 2. Entry, mount, and global plugins

[index.html](../index.html) holds the `<div id="app"></div>` mount point and loads [src/main.js](../src/main.js) as a module.

[src/main.js](../src/main.js) is where every global plugin gets registered, in this order:

```js
import "./styles/app.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
```

The relative `import "./styles/app.css"` and the subpath form `import "#app.css"` (declared in [package.json](../package.json) `imports`) resolve to the same file — the relative form is used here because it works without the subpath import being configured. Reach for `#app.css` from places where a relative path would be awkward (e.g. `@reference "#app.css"` inside `<style scoped>` blocks — see [CODING_STANDARDS.md §5](CODING_STANDARDS.md)).

When adding a new global concern (error reporter, i18n, analytics SDK, devtools plugin) wire it here, **after `createPinia()` and `router`** unless documentation says otherwise. Keep `main.js` lean; complex setup belongs in a `src/plugins/<name>.js` module that `main.js` imports.

---

## 3. Vite build

[vite.config.js](../vite.config.js) is intentionally minimal:

```js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [vue(), tailwindcss()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
```

### Path alias

The `@/*` → `src/*` alias is declared in **three** places that must stay in sync:

1. [vite.config.js](../vite.config.js) — at runtime / build time.
2. [jsconfig.json](../jsconfig.json) — for editor IntelliSense.
3. [vitest.config.js](../vitest.config.js) — inherited via `mergeConfig(viteConfig, …)`.

If you change the alias, change all three.

### Subpath imports

[package.json](../package.json) declares one subpath import:

```json
"imports": {
    "#app.css": "./src/styles/app.css"
}
```

The file exists (it ships with `@import "tailwindcss"` and `@plugin "@tailwindcss/typography"` — see §4). [main.js](../src/main.js) currently imports it via the relative path; SFC `<style scoped>` blocks consume it via `@reference "#app.css"` so the subpath import does work from places relative imports can't easily reach.

### Commands

| Command           | Action                                                   |
| ----------------- | -------------------------------------------------------- |
| `npm run dev`     | Vite dev server with HMR on `http://localhost:5173`      |
| `npm run build`   | Production build to `dist/` (tree-shaken, minified)      |
| `npm run preview` | Serve the built `dist/` for local sanity-check           |

`dist/` is gitignored — production builds are produced by CI, not committed.

---

## 4. Tailwind CSS v4

Tailwind v4 is wired through `@tailwindcss/vite` — **no `tailwind.config.js`**. Configuration lives **inside CSS** using `@theme` / `@import "tailwindcss"`, which is the v4 way.

### Entry CSS file

[src/styles/app.css](../src/styles/app.css) currently ships minimally with the Tailwind import and the typography plugin:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

`@tailwindcss/typography` is installed (see [package.json](../package.json) `devDependencies`) and provides the `prose` class for long-form content. No `@theme` block has been declared yet — the first real project adds tokens (colors, fonts, semantic aliases) there. See [DESIGN.md §1](DESIGN.md) for the prescribed shape and [DESIGN.md §3](DESIGN.md) for `prose` modifiers.

[main.js](../src/main.js) imports the stylesheet on the first line via the relative path:

```js
import "./styles/app.css";
```

The subpath import form `import "#app.css"` works equivalently and is preferred from contexts where a relative path doesn't have a stable anchor (see §3 above).

Tailwind v4 auto-detects content from imported files in the bundle — no `content: [...]` array is needed. Plugins are loaded via `@plugin "..."` directives inside the CSS, not in a JS config; keep `@plugin` directives in `app.css` in sync with the corresponding `devDependencies` in `package.json`.

### Editor support

[.vscode/settings.json](../.vscode/settings.json) treats `*.css` as `tailwindcss` for IntelliSense:

```json
"files.associations": {
    "*.css": "tailwindcss"
},
"tailwindCSS.includeLanguages": {
    "css": "html"
}
```

The recommended extension is `bradlc.vscode-tailwindcss`, listed in [.vscode/extensions.json](../.vscode/extensions.json).

### Class-ordering convention

When the **Prettier Tailwind plugin** (`prettier-plugin-tailwindcss`) is adopted, class order in templates becomes deterministic — class names get sorted on save. Adopt it as soon as the first non-trivial component lands so the ordering never drifts.

Until then: layout utilities (`flex`, `grid`, `gap-*`, `p-*`, `m-*`) come before color / typography utilities (`text-*`, `bg-*`, `font-*`) come before state utilities (`hover:*`, `focus:*`). This matches what `prettier-plugin-tailwindcss` will eventually enforce.

---

## 5. Format & lint

### Prettier

Config in [.prettierrc.json](../.prettierrc.json):

```json
{
    "$schema": "https://json.schemastore.org/prettierrc",
    "semi": true,
    "singleQuote": false,
    "printWidth": 100,
    "useTabs": false,
    "tabWidth": 4,
    "singleAttributePerLine": true,
    "vueIndentScriptAndStyle": true
}
```

- **4-space indent, double quotes, 100-col, semicolons.**
- **`singleAttributePerLine`** — every Vue / HTML attribute on its own line.
- **`vueIndentScriptAndStyle`** — `<script>` and `<style>` block contents are indented one level inside the SFC.

Run via:

```bash
npm run format                         # Prettier write across src/
npx prettier --write README.md         # any file outside src/
```

There's no pre-commit hook today; the editor's format-on-save (configured in [.vscode/settings.json](../.vscode/settings.json)) is the front line.

### ESLint — TBD

Not wired today. Adopt `eslint-plugin-vue` with the official Vue 3 flat config (`@vue/eslint-config-prettier` to defer formatting to Prettier) once the template grows past a single scaffolded view. Wire it into `npm run lint` and CI.

---

## 6. Component conventions

### File naming

| File                              | Convention                                          |
| --------------------------------- | --------------------------------------------------- |
| Single-file components            | `PascalCase.vue` (`ProductCard.vue`, `NavBar.vue`)  |
| Routed views                      | `PascalCase.vue`; `*View.vue` suffix optional        |
| Composables                       | `camelCase.js` with `use*` prefix (`useCart.js`)    |

See [CODING_STANDARDS.md §5](CODING_STANDARDS.md) for the full SFC conventions (block order, props, emits, scoped styles).

### Where components live

The template pre-creates the following directories:

- **[src/views/](../src/views/)** — routed pages. Ships scaffolded with four empty SFCs that follow the baseline template from [CODING_STANDARDS.md §5](CODING_STANDARDS.md): `HomeView.vue`, `ProjectListView.vue`, `ProjectDetailView.vue`, `StyleGuideView.vue`. **None are yet wired into `router/index.js`** — adding them to the route table is the next step (see §8).
- **[src/components/](../src/components/)** — shared components used across routes (`AppButton.vue`, `AppInput.vue`, generic cards). **Currently empty** — add components here as soon as they're shared by two views.
- **`src/components/<feature>/`** — feature-scoped clusters (`src/components/cart/CartDrawer.vue`). Promote a feature subdirectory when the second related component lands.

`src/components/` is empty and git won't track it across clones until a file lands inside — see [CODING_STANDARDS.md §3](CODING_STANDARDS.md) for the `.gitkeep` note.

### Single-attribute-per-line in templates

Because [.prettierrc.json](../.prettierrc.json) sets `singleAttributePerLine: true`, multi-attribute elements render like:

```vue
<RouterLink
    :to="{ name: 'product-detail', params: { slug } }"
    class="card card-bordered"
    data-testid="product-link"
>
    {{ product.name }}
</RouterLink>
```

This makes diffs cleaner when attributes change. Don't fight it by jamming attributes onto one line.

---

## 7. Forms

There's no form library wired (no VeeValidate, no Formkit). The pattern below covers the simple case.

### Pattern

Bind `v-model` directly to a local `ref` (or composable), validate on blur or submit, and render errors next to the field.

```vue
<script setup>
import { ref } from "vue";
import validator from "validator";

const email = ref("");
const error = ref("");

function handleSubmit() {
    if (!validator.isEmail(email.value)) {
        error.value = "Enter a valid email address.";
        return;
    }
    error.value = "";
    // submit
}
</script>

<template>
    <form @submit.prevent="handleSubmit">
        <label
            for="email"
            class="block text-sm"
        >Email</label>
        <input
            id="email"
            v-model="email"
            type="email"
            class="block w-full rounded-md border border-gray-300 px-3 py-2"
            :class="{ 'border-red-500': error }"
            autocomplete="email"
        />
        <p
            v-if="error"
            class="text-sm text-red-600"
        >{{ error }}</p>
    </form>
</template>
```

### `validator` (npm) usage

`validator` provides battle-tested string checks (`isEmail`, `isURL`, `isStrongPassword`, etc.). Use it for client-side UX validation only — **server-side validation remains the source of truth.** When the form library decision lands (VeeValidate is the default choice for Vue 3 + Pinia), revisit this section.

### Accessibility floor

- Every field has a `<label for="…">` — placeholders are not labels.
- Errors are linked via `aria-describedby` once forms move beyond the trivial.
- `autocomplete` is set per WCAG 1.3.5 (see [ACCESSIBILITY.md §1.1](ACCESSIBILITY.md)).
- Submit on Enter works (`@submit.prevent` on the `<form>`, not `@click` on the button).

---

## 8. Routing

[src/router/index.js](../src/router/index.js) creates the router with `createWebHistory(import.meta.env.BASE_URL)` and an empty `routes: []`. Conventions:

- **Every route has a `name`** (kebab-case). Navigate by `{ name }`, never by string path.
- **Lazy-load route components** with dynamic `import()`. Eager-load only the home view if it ships in the initial bundle anyway.
- **Layout pattern:** when multiple routes share chrome, use a layout component imported at the route component (`<DefaultLayout>` wrapping `<RouterView>` per layout) rather than the legacy `<router-view name="…">` named-view approach.
- **Guards:** route-level (`beforeEnter`) for view-specific checks; `router.beforeEach` for cross-cutting (auth, analytics). Read `meta.requiresAuth` rather than hard-coding route name lists.

```js
{
    path: "/products/:slug",
    name: "product-detail",
    component: () => import("@/views/ProductDetailView.vue"),
    meta: { title: "Product details", requiresAuth: false },
}
```

### Base path

`createWebHistory(import.meta.env.BASE_URL)` honors Vite's `base` option, set in [vite.config.js](../vite.config.js) (default `/`). When deploying to a subpath (GitHub Pages project sites, etc.), set `base` in `vite.config.js`; the router picks it up automatically.

---

## 9. State (Pinia)

Stores live in [src/stores/](../src/stores/), one file per concern, all setup style. See [CODING_STANDARDS.md §6](CODING_STANDARDS.md) for the full rules.

```js
// src/stores/counter.js
import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", () => {
    const count = ref(0);
    const doubleCount = computed(() => count.value * 2);
    function increment() {
        count.value++;
    }
    return { count, doubleCount, increment };
});
```

When to reach for Pinia vs. local component state:

- **Local state** (`ref` inside a component or composable) — UI ephemera, form input, animation state, anything that dies with the component.
- **Pinia** — anything two unrelated components both need to read or write (auth user, cart, theme, feature flags).
- **`provide` / `inject`** — when state is scoped to a subtree and doesn't belong globally. The middle ground.

### Persistence

If state must survive a refresh (cart contents, auth token, theme preference), use `pinia-plugin-persistedstate`:

```js
const useCart = defineStore("cart", () => { … }, { persist: true });
```

Don't hand-roll `localStorage` reads/writes inside store actions — the plugin handles it deterministically and you avoid hydration races.

---

## 10. Composables, services, utilities — which goes where

The template separates non-component logic into three buckets, each with a precise purpose:

| Bucket               | Directory          | Returns                                    | Use for                                                              |
| -------------------- | ------------------ | ------------------------------------------ | -------------------------------------------------------------------- |
| **Composables**      | `src/composables/` | reactive state (`ref`, `computed`) + ops   | Reusable Vue-aware behavior (mouse position, debounce, `useApi`)     |
| **Services**         | `src/services/`    | plain functions / classes / module exports | API clients, external SDK wrappers, business logic with no `ref`s    |
| **Utilities**        | `src/utilities/`   | pure functions, no state                   | Formatters, validators, parsers, math helpers                        |

Concretely:

- A function that calls a backend and returns `{ data, isLoading, error }` refs is a **composable** (`useProducts`).
- A function that wraps `fetch` and returns a Promise is a **service** (`apiClient.get("/products")`).
- A function that takes a number and returns `"$42.00"` is a **utility** (`formatPrice(42)`).

`src/composables/` doesn't exist in the scaffold yet — create it when the first composable lands. `src/services/` and `src/utilities/` exist as empty placeholders; git won't track them until the first file lands (see [CODING_STANDARDS.md §3](CODING_STANDARDS.md)).

Conventions:

- File name and export name both start with `use*` for composables (`useCart`, not `cart`).
- Services and utilities are named for their concern (`apiClient.js`, `formatPrice.js`), not for the Vue lifecycle.
- One concern per file. Re-export barrels (`index.js`) only when the import noise actually hurts.
- No side effects on import — set up watchers / lifecycle inside the `use*` body.

If a composable starts coordinating state across multiple components that don't share a subtree, that's the signal it should become a Pinia store instead.

---

## 11. Static assets

Two trees, with different processing semantics:

```
src/assets/                  # imported by JS / CSS; processed and fingerprinted by Vite
    images/                  # EMPTY — drop imported images here
    fonts/                   # EMPTY — drop self-hosted woff2 here

public/                      # served verbatim at the site root; not processed
    favicon.ico
    robots.txt               # EMPTY placeholder — populate before deploy
    sitemap.xml              # EMPTY placeholder — populate before deploy
```

- **`src/assets/`** — `import logo from "@/assets/images/logo.svg"`. Vite emits a fingerprinted URL and inlines small assets as data URIs. `images/` and `fonts/` are pre-created but empty; git won't track them until the first asset lands (see [CODING_STANDARDS.md §3](CODING_STANDARDS.md)).
- **`public/`** — referenced with an absolute path (`/favicon.ico`). No fingerprinting; the file you put there is what ships. Use it for files that need a stable filename (favicon, `robots.txt`, `sitemap.xml`, manifest, OG images referenced by external systems).

Fonts:

- **Self-host fonts in `src/assets/fonts/`** (preferred — fingerprinted) or `public/fonts/`. Declare `@font-face` in [src/styles/app.css](../src/styles/app.css). Don't depend on Google Fonts at runtime — it's a privacy / availability hit.

⚠️ **`public/robots.txt` and `public/sitemap.xml` are currently empty placeholders.** Before any production deploy, populate them — an empty `robots.txt` is parsed as "allow all" (often fine), but an empty `sitemap.xml` is invalid XML and search engines will reject it. Generate `sitemap.xml` from the route table once routes are wired (manually for a small SPA, or via a Vite plugin like `vite-plugin-sitemap` once the route count makes that worthwhile).

---

## 12. Environment variables

Vite exposes `import.meta.env.*`. Conventions:

- **Only `VITE_*`-prefixed vars are exposed to the client bundle.** Anything else stays server-side (and there's no server in this template).
- **Secrets never go in `VITE_*` vars.** Anything in `VITE_*` is shipped to the user's browser. Treat the value as public.
- **`.env.example` is committed; `.env`, `.env.local`, `.env.*.local` are gitignored** — see [GIT.md §9](GIT.md).
- **Document every `VITE_*` var** in `.env.example` with a one-line comment so a new contributor knows what to set.

For the production-build base URL, prefer Vite's `base` config option in [vite.config.js](../vite.config.js) over a `VITE_BASE_URL` env var.

---

## 13. Accessibility baseline

Minimum bar for any new UI:

- Every form field has an associated `<label for="…">` — not just a placeholder.
- Interactive non-`<button>` elements get `role` and `tabindex="0"`, and respond to `Enter` / `Space`.
- Focus is visible: rely on browser defaults; if overriding via `outline-none`, replace with a matching `focus-visible:ring-*`.
- Color contrast: pair surface + content tokens (use the design system's semantic pairings from [DESIGN.md](DESIGN.md)).
- Heading levels: one `<h1>` per route, no skipping levels.
- Touch targets ≥ 44×44px on interactive elements.

Full requirements (WCAG 2.1 AA + Section 508) live in [ACCESSIBILITY.md](ACCESSIBILITY.md).

---

## 14. UI task brief — what to specify

When kicking off a new frontend task, the brief should answer all six. If any is unanswered, ask before coding.

1. **Surface & route.** Which route? Which layout? New view file or extending an existing one?
2. **Behavior.** Local component state, Pinia, or composable? Network round-trip — what endpoint, what shape?
3. **Data shape.** The props the component takes; the store getters it reads; the actions it calls.
4. **Visual reference.** A screenshot, sketch, or Figma link. If only described in text, name the surface tokens from [DESIGN.md](DESIGN.md) to start from.
5. **Constraints.** Accessibility, responsive breakpoints, dark-mode behavior (if adopted).
6. **Scope boundary.** Component-only? Component + store? Component + store + route? Component + store + route + plugin?

---

## 15. Known gaps / TBDs

This template ships intentionally bare. The list below is what to wire as soon as a real project demands it — each is a deliberate "decide later" rather than an oversight.

- **Route table is empty.** [router/index.js](../src/router/index.js) has `routes: []` even though four scaffolded views exist under [src/views/](../src/views/). Wire them up (`HomeView` → `/`, `ProjectListView` → `/projects`, `ProjectDetailView` → `/projects/:slug`, `StyleGuideView` → `/style-guide`) — names are kebab-case (see §8). Until then, every URL renders the empty `App.vue`.
- **Empty placeholder directories** — [src/components/](../src/components/), [src/services/](../src/services/), [src/utilities/](../src/utilities/), [src/assets/images/](../src/assets/images/), [src/assets/fonts/](../src/assets/fonts/) are pre-created but empty. They won't survive a fresh clone unless tracked content (e.g. `.gitkeep`) lands inside — see [CODING_STANDARDS.md §3](CODING_STANDARDS.md).
- **Empty `public/` files** — [public/robots.txt](../public/robots.txt) and [public/sitemap.xml](../public/sitemap.xml) are empty placeholders. `robots.txt` is harmless empty (parses as "allow all"); `sitemap.xml` is invalid empty and must be populated before deploy (see §11).
- **`src/styles/app.css` has no `@theme` block yet** — the file ships with `@import "tailwindcss"` and `@plugin "@tailwindcss/typography"` but no design tokens. See [DESIGN.md §1](DESIGN.md) for the prescribed shape.
- **Vue devtools plugin** — `vite-plugin-vue-devtools` is in `devDependencies` but **not yet wired into [vite.config.js](../vite.config.js)**. Add `import VueDevtools from "vite-plugin-vue-devtools"; plugins: [vue(), tailwindcss(), VueDevtools()]` to enable.
- **Prettier Tailwind plugin** — adopt `prettier-plugin-tailwindcss` for deterministic class ordering before the first non-trivial component ships.
- **ESLint** — not wired. Adopt `eslint-plugin-vue` flat config + `@vue/eslint-config-prettier` when the template grows past the scaffolded views.
- **HTTP client** — none. Pick `fetch` (built-in) or `ofetch` / `axios` when the first API call lands. Wrap it in a composable (or a service — see §10) so it's swappable.
- **Icon library** — none. Pick `@heroicons/vue`, `lucide-vue-next`, or `unplugin-icons` before the third inline SVG duplicates.
- **Component library** — none deliberately. If you adopt one (Vuetify, Naive UI, PrimeVue, Reka), document the integration here and update [DESIGN.md](DESIGN.md) for token mapping.
- **Form library** — none. VeeValidate is the default choice for Vue 3 + Pinia when forms grow beyond the §7 pattern.
- **i18n** — none. `vue-i18n` is the default if multi-language ships.
- **State persistence** — `pinia-plugin-persistedstate` for cart / auth / theme persistence (see §9).
- **Routing data hooks** — if data-fetching grows complex, evaluate VueQuery (`@tanstack/vue-query`) before rolling your own.
- **TypeScript** — JS today. Migration is a deliberate decision; don't slide into it via TS files. Add `tsconfig.json`, replace `jsconfig.json`, rename, all at once.
- **CI** — no workflows in `.github/`. Wire `npm ci && npm run test:unit && npm run build` as the minimum.
- **Pre-commit hooks** — none. Adopt `lint-staged` + `simple-git-hooks` (or `husky`) once Prettier + ESLint are both in CI.
