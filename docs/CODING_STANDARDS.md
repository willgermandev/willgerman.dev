# CODING STANDARDS

Project-wide coding standards: file & folder naming, JavaScript / Vue style, single-file-component layout, Pinia stores, Vue Router conventions, tests, and the format tools that enforce them.

For frontend stack details (Vue 3 + Vite + Tailwind v4) see [FRONTEND.md](FRONTEND.md). For visual design tokens see [DESIGN.md](DESIGN.md). For (currently absent) backend conventions when an API is added see [BACKEND.md](BACKEND.md). For git conventions see [GIT.md](GIT.md). For day-to-day commands see [CLAUDE.md](../CLAUDE.md).

---

## 1. Scope

This is the **cross-cutting** standards doc. It captures rules that apply across the project regardless of which view or store you're working in.

What lives here:

- File and folder naming
- JavaScript style (modules, imports, naming)
- Vue 3 SFC conventions (`<script setup>`, props/emits, composables)
- Pinia store conventions (setup style)
- Vue Router conventions (named routes, lazy loading)
- Test layout (Vitest + Vue Test Utils)
- Format tooling (Prettier)

What lives elsewhere:

- Build pipeline, Tailwind v4 integration, component patterns → [FRONTEND.md](FRONTEND.md)
- Visual tokens (colors, fonts, spacing, radii, shadows) → [DESIGN.md](DESIGN.md)
- Git conventions → [GIT.md](GIT.md)

This doc is **prescriptive for a fresh template**: every rule below establishes a default for projects scaffolded from this repo. Override deliberately; don't drift.

---

## 2. General principles

- **Prefer reuse over new code.** Check [src/utilities/](../src/utilities/), [src/services/](../src/services/), and `src/composables/` (the last not yet created) before writing a new helper. See [FRONTEND.md §10](FRONTEND.md) for which bucket a given piece of logic belongs in.
- **Trust the framework.** Don't validate state Vue's reactivity already tracks; don't guard against `undefined` props when the component contract forbids them.
- **Avoid unnecessary abstractions.** Two similar lines is not a pattern; three is. Don't build for hypothetical future needs.
- **No dead code or backward-compat shims.** If something is unused, remove it; don't leave commented-out blocks.
- **Composition API only.** No Options API in new components. Existing scaffolded code uses `<script setup>` (Composition API) — keep it.

---

## 3. File & folder naming

| Surface             | Convention                                      | Example                                                |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------ |
| Vue components      | `PascalCase.vue`                                | `App.vue`, `ProductCard.vue`, `NavBar.vue`             |
| Vue views (routed)  | `PascalCase.vue`, `*View.vue` suffix optional   | `HomeView.vue`, `ProductDetailView.vue`                |
| Composables         | `camelCase.js`, `use*` prefix                   | `useCart.js`, `useDebounce.js`                         |
| Pinia stores        | `camelCase.js`                                  | `counter.js`, `user.js`                                |
| Utilities           | `camelCase.js`, in `src/utilities/`             | `formatPrice.js`, `validators.js`                      |
| Services            | `camelCase.js`, in `src/services/`              | `apiClient.js`, `analyticsService.js`                  |
| Test files          | `*.spec.js` colocated under `__tests__/`        | `src/__tests__/App.spec.js`                            |
| Static assets       | `kebab-case.{svg,png,webp}` under `src/assets/` | `hero-banner.webp`, `logo-mark.svg`                    |
| Public assets       | `kebab-case` under `public/`                    | `favicon.ico`, `robots.txt`                            |
| CSS                 | `kebab-case.css` under `src/styles/`            | `app.css`, `tailwind.css`                              |

### Source-tree shape

The template ships with the directories below pre-created (some still empty — see the warning at the end):

```
src/
    App.vue                  # root component
    main.js                  # entry — imports app.css, registers Pinia + Router, mounts #app
    router/
        index.js             # createRouter; route table (currently empty)
    stores/
        counter.js           # one file per store
    views/                   # routed pages — scaffolded but not yet wired to routes
        HomeView.vue
        ProjectListView.vue
        ProjectDetailView.vue
        SettingsView.vue
        StyleGuideView.vue
    components/              # shared components — baseline SFCs scaffolded
        MenuButton.vue
        Modal.vue
        ProjectCard.vue
    services/                # API clients / non-reactive business logic — EMPTY
    utilities/               # pure stateless helpers (formatters, validators) — EMPTY
    composables/             # reactive Vue logic — not yet created; add when first composable lands
    styles/
        app.css              # imports tailwindcss + the typography plugin (no @theme tokens yet)
    assets/                  # imported assets (processed and fingerprinted by Vite)
        images/              # EMPTY
        fonts/               # EMPTY — self-host woff2 here (see DESIGN.md §3)
    __tests__/               # tests colocated at the root of src
        App.spec.js
```

⚠️ **Git does not track empty directories.** Without a tracked file inside, `services/`, `utilities/`, `assets/images/`, and `assets/fonts/` will not appear on a fresh clone — the scaffold shape only persists for contributors who clone *after* the first real file lands in each. If you want the structure to be discoverable on day one, drop a `.gitkeep` (or any tracked placeholder) into each empty directory, or accept that the first real file is what makes the directory exist in git.

Promote a folder when the second file of its kind lands; an empty placeholder is a hint about intent, not a hard rule.

---

## 4. JavaScript style

### Naming

| Kind                 | Style                  | Example                                  |
| -------------------- | ---------------------- | ---------------------------------------- |
| Functions / methods  | `camelCase`            | `formatPrice()`, `isInStock()`           |
| Vue components       | `PascalCase`           | `ProductCard`, `NavBar`                  |
| Composables          | `camelCase`, `use*`    | `useCart()`, `useDebounce()`             |
| Constants            | `SCREAMING_SNAKE_CASE` | `MAX_QUANTITY`, `API_BASE_URL`           |
| Pinia store IDs      | `camelCase` string     | `defineStore("counter", …)`              |
| Route names          | `kebab-case`           | `name: "product-detail"`                 |
| CSS custom props     | `--kebab-case`         | `--color-primary`, `--font-heading`      |

### Verbose names — no abbreviations

Spell identifiers out. An identifier should read like the noun it represents.

- `product`, not `prod`. `category`, not `cat`. `quantity`, not `qty`.
- `response`, not `res`. `request`, not `req`. `event`, not `e` (except in tight one-line handlers where `e` is the long-standing DOM convention and the meaning is local).
- Loop variables get full names: `for (const product of products)`, not `for (const p of products)`.

Exceptions: conventional protocol-level names (`i`, `n` in tight numeric loops; `e` in single-line DOM handlers; `_` for ignored params). When in doubt, spell it out.

### Imports

Order, with a blank line between groups:

1. Node built-ins (rare; `node:` protocol)
2. External packages (`vue`, `pinia`, `vue-router`, third-party libs)
3. Aliased internal imports (`@/components/...`, `@/stores/...`)
4. Relative imports (`./Foo.vue`, `../utils/format.js`)

Example:

```js
import { ref, computed } from "vue";
import { defineStore } from "pinia";

import { formatPrice } from "@/utils/formatPrice";
import { useCartStore } from "@/stores/cart";

import ProductImage from "./ProductImage.vue";
```

The `@/*` → `src/*` alias is wired in [vite.config.js](../vite.config.js) and mirrored in [jsconfig.json](../jsconfig.json); both must stay in sync.

### Type hints (JSDoc when useful)

This template is JavaScript, not TypeScript. Reach for JSDoc when the contract isn't obvious from the names:

```js
/**
 * @param {string} sku
 * @returns {Promise<Product | null>}
 */
export async function fetchProduct(sku) { … }
```

Don't blanket every helper. Use it where it clarifies the contract. If JSDoc starts feeling load-bearing across the project, that's the signal to migrate to TypeScript.

### Comments

- **Default to no comments.** Names should carry the meaning.
- Use `// NOTE:` for non-obvious logic, `// TODO:` for known gaps.
- Don't comment what the code already says.

### Modules

- ES modules only (`type: "module"` in [package.json](../package.json)).
- Named exports preferred. Default exports only for Vue SFCs (implicit) and the Pinia store factory function pattern.
- One concern per file. Re-export barrels (`index.js`) only when the import noise actually hurts.

---

## 5. Vue 3 SFC conventions

### `<script setup>` only

Every component uses `<script setup>` (Composition API). The Options API is not used in new code.

```vue
<script setup>
import { ref, computed } from "vue";

const props = defineProps({
    quantity: { type: Number, required: true },
});

const emit = defineEmits(["update"]);

const isEmpty = computed(() => props.quantity === 0);
</script>
```

### Block order

Vue style guide order: `<script setup>` → `<template>` → `<style scoped>`.

### Baseline template

Every new `*.vue` file starts from this template — empty `<script setup>`, empty `<template>`, and a `<style scoped>` block that pulls the project's Tailwind v4 theme into scope:

```vue
<script setup></script>

<template></template>

<style scoped>
    @reference "#app.css";
</style>
```

About `@reference "#app.css"`:

- **What it does.** Tailwind v4's `@reference` directive makes the theme tokens declared in the project's central stylesheet's `@theme` block (`var(--color-primary)`, `var(--font-heading)`, etc.) — and any `@apply`-able utilities — available inside this scoped style block **without** re-emitting the full Tailwind output in every component's CSS. Without it, you cannot `@apply` Tailwind utilities or consume `@theme` tokens inside `<style scoped>`.
- **Where `#app.css` points.** It's a Node.js subpath import declared in [package.json](../package.json)'s `imports` field, resolving to `./src/styles/app.css`. That central stylesheet must exist before this baseline works — see [FRONTEND.md §4](FRONTEND.md).
- **Keep the directive even when the block is empty.** It costs nothing in the emitted CSS if no rule consumes a token, and removing it forces every later contributor to remember to add it back the first time they reach for `@apply` or a theme variable.

### Props

- Declare with `defineProps` using the **object syntax** (type + required, optional default).
- Required props don't get defaults. Optional props with defaults state the default explicitly.
- Validators (`validator: (value) => …`) on enum-like props.

```js
defineProps({
    variant: {
        type: String,
        default: "primary",
        validator: (v) => ["primary", "secondary", "ghost"].includes(v),
    },
});
```

### Emits

Always declare with `defineEmits`. Event names are `kebab-case` (`@update-quantity`, not `@updateQuantity`) — Vue's documented convention for template-side listeners.

### Composables

A composable is a function that returns reactive state and the operations on it. Conventions:

- File name and export name both start with `use*` (`useCart`, not `cart`).
- One composable per file unless they share private internals.
- Return an object of `ref` / `computed` / functions, not a class instance.
- No side effects on import — set up watchers / lifecycle inside the `use*` body.

```js
// src/composables/useCounter.js
import { ref, computed } from "vue";

export function useCounter(initial = 0) {
    const count = ref(initial);
    const doubleCount = computed(() => count.value * 2);
    const increment = () => count.value++;
    return { count, doubleCount, increment };
}
```

### Scoped styles

Use `<style scoped>` for component-local CSS. Reach for Tailwind utilities in templates as the default; `<style scoped>` is for the occasional rule that can't be expressed as a utility (keyframes, complex pseudo-selectors). See [DESIGN.md §16](DESIGN.md) for the no-`!important` rule and arbitrary-value guidance.

---

## 6. Pinia stores

**Setup style only** — never Options style.

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

Rules:

- **One store per concern.** Don't make a god-store.
- **Store ID matches the file name** (`counter.js` → `defineStore("counter", …)`).
- **Return only what callers should access.** Private state stays out of the return object.
- **No top-level side effects in the factory.** API calls happen in actions, not at store definition time.
- **Persist deliberately.** If state needs to survive a refresh, use `pinia-plugin-persistedstate` (add it then) rather than ad-hoc `localStorage` writes.

---

## 7. Vue Router

The router is configured in [src/router/index.js](../src/router/index.js) with `createWebHistory(import.meta.env.BASE_URL)`.

Conventions:

- **Lazy-load route components** with dynamic `import()`. Eager-load only the home/landing view if it ships in the initial bundle anyway.
- **Every route has a `name`** (kebab-case) — referenced as `{ name: "product-detail" }` in `<RouterLink>` and `router.push`, never as a hardcoded path string.
- **Per-feature route splits.** When the route table grows past ~10 entries, split per-feature files (`router/routes.products.js`) and assemble them in `router/index.js`.
- **Route metadata** (`meta`) is the right place for auth-guard flags, page titles, layout hints — not a separate config object.

```js
{
    path: "/products/:slug",
    name: "product-detail",
    component: () => import("@/views/ProductDetailView.vue"),
    meta: { title: "Product details", requiresAuth: false },
}
```

The scaffold ships with an empty `routes: []`. Add the first real route as soon as the first view lands.

---

## 8. Tests

- **Framework:** Vitest with `@vue/test-utils` in the `jsdom` environment. Config in [vitest.config.js](../vitest.config.js).
- **Location:** colocate at `src/__tests__/*.spec.js` for now. When a single feature accumulates ≥3 tests, promote to `src/<feature>/__tests__/` so the tests live with the code they cover.
- **Naming:** `<Subject>.spec.js`. Top-level `describe(<Subject>)` matches the file.
- **Run:**
    ```bash
    npm run test:unit                                          # watch mode
    npx vitest run                                             # one-shot
    npx vitest run src/__tests__/App.spec.js                   # single file
    npx vitest run -t "mounts renders properly"                # single test
    ```

### Conventions when adding tests

- Mount components with `mount()` from `@vue/test-utils`. Reach for `shallowMount` only when child components have side effects on render.
- Use Pinia's `createTestingPinia()` to provide stores; never reach into the real store factory inside a test.
- For routed views, use `createRouter({ history: createMemoryHistory(), routes })` — the memory history works in `jsdom`.
- Stub the network. Don't hit a real API from a unit test — wrap fetch calls in a composable so they can be replaced with a stub.
- Cover behavior, not implementation. Assert on what the user sees (`wrapper.text()`, `wrapper.find("[data-testid=…]")`), not on internal refs.

### Coverage

No coverage tool is wired today. When one lands, add `@vitest/coverage-v8` and set the thresholds in [vitest.config.js](../vitest.config.js).

---

## 9. Format & lint tools

| Tool          | Scope                                      | Config                                       | Status |
| ------------- | ------------------------------------------ | -------------------------------------------- | ------ |
| Prettier      | JS / Vue / CSS / JSON / Markdown            | [.prettierrc.json](../.prettierrc.json)      | Active |
| ESLint        | JS / Vue                                   | —                                            | **TBD** — not wired. Adopt `eslint-plugin-vue` + the official Vue 3 flat config when the template grows beyond a few files. |
| TypeScript    | —                                          | —                                            | **TBD** — project is JS today. Migration is a deliberate decision, not an automatic one. |
| Pre-commit    | All                                        | —                                            | **TBD** — adopt `lint-staged` + `simple-git-hooks` (or `husky`) once Prettier + ESLint are both in CI. |

### Prettier config

From [.prettierrc.json](../.prettierrc.json):

| Setting                  | Value           |
| ------------------------ | --------------- |
| `tabWidth`               | 4               |
| `useTabs`                | false           |
| `printWidth`             | 100             |
| `semi`                   | true            |
| `singleQuote`            | false           |
| `singleAttributePerLine` | true            |
| `vueIndentScriptAndStyle`| true            |

The scaffolded template files (committed from `create-vue`) ship with 2-space indent and single quotes — the first `npm run format` will rewrite them. Don't be alarmed by the resulting diff; that's the project's chosen style asserting itself.

### npm scripts ([package.json](../package.json))

| Script              | Action                                                   |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Vite dev server with HMR                                 |
| `npm run build`     | Production build to `dist/`                              |
| `npm run preview`   | Serve the built `dist/` for local sanity-check           |
| `npm run test:unit` | Vitest in watch mode                                     |
| `npm run format`    | Prettier write across `src/` (uses experimental CLI flag) |

---

## 10. Conventions cheat-sheet

Quick reference — the must-knows in one block.

- Components are `<script setup>` (Composition API). Block order: script → template → style.
- Props use object syntax with explicit `type` + `required` (or `default`). Event names are kebab-case.
- Composables: file + export are both `use*`. Return reactive state, not classes.
- Pinia stores: setup style only. Store ID matches the file name. One concern per store.
- Router routes always have a `name`; route components are lazy-loaded.
- Tests use `mount` + `createTestingPinia`. Colocate at `src/__tests__/` until a feature has its own test cluster.
- Files: `PascalCase.vue` for components, `camelCase.js` for everything else, `kebab-case` for assets.
- The `@/*` → `src/*` alias is wired in [vite.config.js](../vite.config.js) and [jsconfig.json](../jsconfig.json). Both files must stay in sync.
- No `!important`, no `style=""` attributes — see [DESIGN.md §16](DESIGN.md).
- Branch names follow [GIT.md](GIT.md): `<type>/<short-description>`, lowercase, hyphen-separated.
