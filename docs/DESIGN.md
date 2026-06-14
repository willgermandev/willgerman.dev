# DESIGN

Design tokens for projects built on this template. The first round of tokens has landed (typography + base colors); this file is the **prescriptive source of truth** for the willgerman.dev portfolio: where tokens live, what's declared today, how to extend them, and the conventions that keep the system coherent.

For build pipeline / Tailwind v4 wiring see [FRONTEND.md §4](FRONTEND.md). For project-wide code style see [CODING_STANDARDS.md](CODING_STANDARDS.md).

---

## 1. Where tokens live

Tailwind v4 declares tokens **inside CSS** via `@theme` — there is no `tailwind.config.js`. The single source of truth is [src/styles/app.css](../src/styles/app.css), which carries the `tailwindcss` import, the typography plugin, the project's `@font-face` rules, and a single `@theme` block. The `@theme` block currently declares four tokens — `--font-sans` and `--font-condensed` (see [§3 Typography](#3-typography)) and `--color-background` and `--color-foreground` (see [§2 Color](#2-color)) — each of which Tailwind v4 turns into utility classes automatically:

| Declared token       | Generated utilities                                                 |
| -------------------- | ------------------------------------------------------------------- |
| `--font-sans`        | `font-sans`                                                         |
| `--font-condensed`   | `font-condensed`                                                    |
| `--color-background` | `bg-background`, `text-background`, `border-background`             |
| `--color-foreground` | `bg-foreground`, `text-foreground`, `border-foreground`             |

The shape of the file:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* @font-face rules for Barlow / Barlow Condensed — see §3. */

@theme {
    --font-sans: "Barlow", ui-sans-serif, system-ui, sans-serif;
    --font-condensed: "Barlow Condensed", "Barlow", ui-sans-serif, system-ui, sans-serif;
    --color-background: oklch(0% 0 0);
    --color-foreground: oklch(100% 0 0);
}

@layer base {
    body {
        background-color: var(--color-background);
        color: var(--color-foreground);
        font-family: var(--font-sans);
    }
}
```

The `@plugin` directive is Tailwind v4's replacement for v3's `plugins: [...]` array in `tailwind.config.js` — plugins load from CSS, not from a JS config. `@plugin "@tailwindcss/typography"` adds the `prose` class for long-form content (see [§3 Long-form content](#long-form-content-prose)); the package is installed via [package.json](../package.json) `devDependencies`.

Rules:

- **Never set raw hex / rem / px literals in component templates.** Every value resolves through a token.
- **One file owns tokens.** If a second `@theme` block lands in another CSS file, consolidate — split tokens are how drift starts.
- **Variant overrides** (dark mode, brand themes) come from extra `@theme` or `@layer base` blocks with selector scope (`@media (prefers-color-scheme: dark) { … }`, `[data-theme="brand-x"] { … }`).
- **Load additional plugins via `@plugin "<package-name>"`** in this same file, after `@import "tailwindcss"`. Each one needs the corresponding npm package installed; keep `@plugin` directives and `devDependencies` in sync.

When this file says "the project ships with X token," it means a current declaration in `@theme` — listed in the "Currently declared" subsections under §§2–3. Anything else in this file is a recommendation, not a current value.

---

## 2. Color

### Currently declared

The portfolio runs a **dark-only** palette declared in [src/styles/app.css](../src/styles/app.css):

| Token                | Value             | Generated utilities                                         |
| -------------------- | ----------------- | ----------------------------------------------------------- |
| `--color-background` | `oklch(0% 0 0)`   | `bg-background`, `text-background`, `border-background`     |
| `--color-foreground` | `oklch(100% 0 0)` | `bg-foreground`, `text-foreground`, `border-foreground`     |

Notes:

- The body default (`@layer base`) paints `bg-background` + `text-foreground`, so a downstream component opts in to inverse pairings (`bg-foreground text-background`) only when needed.
- No `*-content` pair is declared. With a single foreground color, the pair is redundant — `--color-foreground` *is* the content color on every surface that uses `--color-background`. If a second surface color lands, declare it with its `*-content` partner per the [Functional pairings](#functional-pairings) table below.
- The OKLCH recommendation in this section is honored at the endpoints: `oklch(0% 0 0)` ≡ `#000000` and `oklch(100% 0 0)` ≡ `#ffffff`. The OKLCH triplet documents intent (lightness / chroma / hue) and keeps the token contract uniform when intermediate gray surface tokens land later.

### Recommended starting palette

Three families is the minimum useful set:

| Family       | Role                                              | Suggested source                       |
| ------------ | ------------------------------------------------- | -------------------------------------- |
| **gray**     | neutral surfaces, body text, borders              | Tailwind v4 default `--color-gray-*`   |
| **primary**  | brand accent — buttons, links, focus rings        | project-defined                         |
| **state**    | success / warning / error / info                  | Tailwind v4 defaults (`green`, `yellow`, `red`, `blue`) |

Tailwind v4 ships with full color ramps (50–950) for `gray`, `red`, `orange`, `yellow`, `green`, `blue`, `indigo`, `purple`, `pink`, etc. Don't redeclare them — override only what's specific to your brand.

```css
@theme {
    /* Primary — burgundy example */
    --color-primary-50:  oklch(0.97 0.03 350);
    --color-primary-100: oklch(0.93 0.06 350);
    --color-primary-500: oklch(0.55 0.18 350);
    --color-primary-700: oklch(0.40 0.20 350);
    --color-primary-900: oklch(0.25 0.18 350);
    --color-primary:     var(--color-primary-700);
    --color-primary-content: white;
}
```

### OKLCH over HSL / hex

Tailwind v4's defaults use OKLCH. Match it — perceptually uniform lightness, predictable contrast, and the `oklch()` function lets you tweak lightness without hue shift.

### Semantic vs. raw

Define both:

- **Raw scale tokens** (`--color-primary-500`, `--color-primary-700`) — for explicit ramp picks.
- **Semantic alias tokens** (`--color-primary`, `--color-primary-content`, `--color-surface`, `--color-surface-content`) — for "the brand button color, whatever it is today."

Components prefer the semantic alias. A theme swap (dark mode, brand variant) re-aims the alias; raw-scale references break.

### Functional pairings

Always declare a `*-content` pair for every surface color so text contrast is deliberate:

| Token                        | Pair                                  |
| ---------------------------- | ------------------------------------- |
| `--color-surface`            | `--color-surface-content`             |
| `--color-primary`            | `--color-primary-content`             |
| `--color-success`            | `--color-success-content`             |

Usage in templates:

```html
<button class="bg-primary text-primary-content rounded-md px-4 py-2">…</button>
```

### Dark mode

Add a second `@theme` block (or `@layer base`) under a `@media (prefers-color-scheme: dark)` query, or under a `[data-theme="dark"]` attribute selector if you want an explicit toggle.

```css
@media (prefers-color-scheme: dark) {
    @theme {
        --color-surface: oklch(0.18 0.01 250);
        --color-surface-content: oklch(0.95 0.01 250);
        /* lighten one step on dark — preserves contrast */
        --color-primary: var(--color-primary-400);
    }
}
```

The template ships with **no dark mode wired**. Decide deliberately when adopting — `prefers-color-scheme` auto-pickup vs. an explicit toggle is a product call.

---

## 3. Typography

### Currently declared

The portfolio declares two families, self-hosted as Latin-subset `.woff2` files under [src/assets/fonts/](../src/assets/fonts/):

| Token              | Value                                                                       | Files                                                                                         | Generated utility |
| ------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------- |
| `--font-sans`      | `"Barlow", ui-sans-serif, system-ui, sans-serif`                            | `barlow-light.woff2` (300), `barlow-regular.woff2` (400)                                      | `font-sans`       |
| `--font-condensed` | `"Barlow Condensed", "Barlow", ui-sans-serif, system-ui, sans-serif`        | `barlow-condensed-black.woff2` (900)                                                          | `font-condensed`  |

Notes:

- The body default (`@layer base`) sets `font-family: var(--font-sans)`, so every page renders in Barlow without an explicit `font-sans` class.
- Barlow ships at two weights (Light 300, Regular 400); Barlow Condensed ships at one (Black 900). Asking for an unshipped weight (e.g. `font-bold` on `font-condensed`) gets the browser's synthesized bold — acceptable for body Barlow, but on the single-weight display face it tends to look uneven. Stick to the shipped weights.
- All three `@font-face` rules declare `font-display: swap` — text renders in the fallback (`ui-sans-serif` / `system-ui`) immediately and re-renders in Barlow once the file loads. Avoids FOIT per [ACCESSIBILITY.md](ACCESSIBILITY.md).
- License: SIL Open Font License 1.1, full text at [src/assets/fonts/OFL.txt](../src/assets/fonts/OFL.txt). Same license covers both families.

### Recommended families

| Family    | Role                | Suggested source            |
| --------- | ------------------- | --------------------------- |
| **sans**  | body / default      | system stack or self-hosted |
| **heading** | headings (h1–h6)  | optional — distinct display face |
| **mono**  | code / tabular      | system mono stack           |

```css
@theme {
    --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
    --font-heading: "Cal Sans", "Inter", ui-sans-serif, sans-serif;
    --font-mono: ui-monospace, "SF Mono", "Cascadia Code", monospace;
}

@layer base {
    body { font-family: var(--font-sans); }
    h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
    code, pre { font-family: var(--font-mono); }
}
```

### Self-host fonts

Don't depend on Google Fonts at runtime — it's a privacy + availability tax. Put `.woff2` files in [public/fonts/](../public/fonts/) (or `src/assets/fonts/` for fingerprinting) and declare `@font-face` in [src/styles/app.css](../src/styles/app.css) with `font-display: swap`.

### Type scale

Tailwind v4 ships `text-xs` → `text-9xl` defaults. Use them. Override only specific entries (e.g. tightening `--text-base` to 0.9375rem for a denser dashboard):

```css
@theme {
    --text-base: 0.9375rem;     /* 15px instead of 16px */
    --text-base--line-height: 1.5;
}
```

### Weights

The defaults cover `font-thin` (100) through `font-black` (900). Most projects use four:

- `font-normal` (400) — body
- `font-medium` (500) — small emphasis
- `font-semibold` (600) — strong inline emphasis
- `font-bold` (700) — UI labels, buttons

If the heading family ships at a single weight (display faces often do), weight utilities are no-ops on headings — synthesize bold tends to look uneven. Document the limit.

### Long-form content (`prose`)

[src/styles/app.css](../src/styles/app.css) loads the [`@tailwindcss/typography`](https://github.com/tailwindlabs/tailwindcss-typography) plugin via `@plugin "@tailwindcss/typography"`. It adds the `prose` class for styled long-form HTML — articles, marketing pages, MDX output, server-rendered Markdown — without having to style every `<h2>` / `<p>` / `<ul>` / `<blockquote>` / `<code>` by hand. Apply it to a wrapping element:

```html
<article class="prose max-w-3xl">
    <!-- raw HTML inside renders with sane long-form defaults -->
</article>
```

Useful modifiers:

- **Size**: `prose-sm` / `prose-base` / `prose-lg` / `prose-xl` / `prose-2xl`.
- **Color**: `prose-gray` / `prose-slate` (etc.) for ramp choice; `dark:prose-invert` for dark-mode inversion.
- **Element-level overrides**: `prose-headings:font-heading`, `prose-a:text-primary`, `prose-code:before:content-none` — `prose-<element>:<utility>` lets you tweak any tag without dropping the whole class.

Constrain line length with `max-w-*` on the wrapper. The plugin sets a sensible default, but stating it explicitly keeps long-form layouts readable across breakpoints.

`prose` is for **content the project doesn't fully control the markup of** (CMS output, rendered Markdown). UI surfaces with hand-authored HTML should compose Tailwind utilities directly — `prose` carries a lot of opinionated defaults you don't want on a dashboard card.

---

## 4. Spacing

Tailwind v4's default spacing scale is `0.25rem` per step (`p-1` = 4px, `p-4` = 16px, `p-8` = 32px). Use it as-is.

### Patterns

Document **conventions for your design**, not new tokens:

| Surface              | Convention                  |
| -------------------- | --------------------------- |
| Button padding       | `px-4 py-2` (default), `px-3 py-1.5` (compact) |
| Card padding         | `p-4` (compact), `p-6` (default), `p-8` (spacious) |
| Inline gap (icon + label) | `gap-2`               |
| Stack gap            | `gap-4`, `gap-6`            |
| Section vertical     | `py-16 lg:py-24` (major), `mb-12` (between subsections) |

If a custom spacing value is genuinely recurring (`h-[60px]` for a fixed header), add it to the theme:

```css
@theme {
    --spacing-header: 3.75rem;        /* → h-header, top-header, etc. */
}
```

---

## 5. Border radius

Tailwind v4 defaults: `rounded-none`, `rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full`.

Pick a small subset and stick to it. A common, sane default for a Vue app:

| Class          | Use                                 |
| -------------- | ----------------------------------- |
| `rounded-md`   | buttons, cards, inputs (default)    |
| `rounded-lg`   | larger panels, modals               |
| `rounded-full` | pills, badges, avatars, dot indicators |

Document which you've adopted in the first project; reject the rest in code review.

---

## 6. Shadow

Tailwind v4 defaults: `shadow-xs` → `shadow-2xl`, plus `shadow-inner`. Three are usually enough:

| Class       | Use                                     |
| ----------- | --------------------------------------- |
| `shadow-xs` | sticky nav (subtle elevation on scroll) |
| `shadow-sm` | cards, default-elevated surfaces        |
| `shadow-xl` | hero card, featured content             |

For tinted shadows (softer against light backgrounds):

```html
<div class="shadow-xl shadow-gray-100">…</div>
```

---

## 7. Border

Tailwind v4 ships sensible defaults. Conventions:

- **`border` (1px) is the standard.** Reserve `border-2` for highly-emphasized boundaries (selected state, error state).
- **Border color:** `border-gray-200` default, `border-gray-300` hover, `border-primary` active / selected.
- **Directional** (`border-b`, `border-t`) for dividers; full `border` for boxed elements.

---

## 8. Container widths

Tailwind v4 ships `max-w-*` utilities (`max-w-md`, `max-w-2xl`, `max-w-7xl`, etc.). Common page-shell pattern:

```html
<div class="container mx-auto max-w-7xl px-4 lg:px-0">…</div>
```

Document which `max-w-*` the project's page shells use so they don't drift (a heading `max-w-3xl`, a hero `max-w-6xl`, etc.).

---

## 9. Breakpoints

Tailwind v4 defaults: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px). Mobile-first.

Most projects use two or three of these. Document which the project ships with so styles don't sprawl across all five. A common pick:

- `lg:` for tablet → desktop layout shifts.
- `sm:` for small-tablet adjustments when needed.

If a project ends up two-state (mobile / desktop only), explicitly forbid `sm:`, `md:`, `xl:`, `2xl:` in code review.

---

## 10. Effects & motion

| Class                | Use                                                      |
| -------------------- | -------------------------------------------------------- |
| `transition-colors`  | hover / focus states on links, buttons                   |
| `transition-all`     | broad state transitions (reach for the narrower form first) |
| `animate-pulse`      | small "loading" / "new" indicators                       |
| `antialiased`        | applied to `<body>` for smoother font rendering          |

**Respect `prefers-reduced-motion`.** Tailwind ships a `motion-reduce:` variant; gate non-essential animation on it:

```html
<div class="animate-pulse motion-reduce:animate-none">…</div>
```

---

## 11. Z-index

Tailwind v4 ships `z-0`, `z-10` … `z-50` plus `z-auto`. Most projects need three layers:

| Token  | Use                                |
| ------ | ---------------------------------- |
| `z-10` | sticky header / dropdowns          |
| `z-40` | modals, drawers                    |
| `z-50` | toasts, tooltips, popovers          |

Don't sprinkle arbitrary z-index values across components — when a third layer is needed, claim a documented slot here.

---

## 12. Gradients

Tailwind v4 uses `bg-linear-to-r` (not `bg-gradient-to-r` — the v3 syntax was renamed in v4). Worked example:

```html
<!-- Text accent gradient -->
<h1 class="bg-clip-text bg-linear-to-r from-primary-700 to-primary-500 text-transparent">
    Headline
</h1>

<!-- Background fade -->
<section class="bg-linear-to-b from-transparent to-gray-50">…</section>
```

If a gradient recurs, name it via a custom utility in [src/styles/app.css](../src/styles/app.css) instead of repeating the literal.

---

## 13. Icons

The template ships with no icon system. When adopting, pick **one** of:

- **`@heroicons/vue`** — the canonical Tailwind-aligned set; tree-shakes well.
- **`lucide-vue-next`** — broader catalog, same tree-shaking.
- **`unplugin-icons`** — on-demand from any Iconify collection; tiny final bundle.

Once chosen, document the import pattern and standard sizes (e.g. `class="size-5"` for inline icons, `class="size-6"` for buttons) here.

Avoid the inline-SVG-per-icon pattern past the third duplicate. The discipline cost (someone updates one copy, the other six drift) is higher than the dependency cost.

---

## 14. Dark mode

The template ships with **no dark mode**. Two patterns when adopting:

### 14.1 OS-driven (`prefers-color-scheme`)

```css
@media (prefers-color-scheme: dark) {
    @theme { … }
}
```

Zero UI — the OS chooses. Simplest to implement, accessible by default.

### 14.2 Explicit toggle (`[data-theme="dark"]`)

```css
[data-theme="dark"] {
    @theme { … }
}
```

Requires a toggle UI and a Pinia store / `localStorage` persistence. Use when you need an "always dark" or "always light" override on top of the OS preference.

Pick one path before writing the second component that varies between themes.

---

## 15. CSS conventions

### No `!important`

**Do not use the `!important` modifier** — not as Tailwind's `!` suffix (`bg-primary!`) and not as raw CSS `!important`. It short-circuits the cascade and makes future layering brittle.

When a project style needs to win over a default, use one of these instead:

- **Override the CSS custom property the default reads.** Tailwind utilities consume the `--color-*` / `--font-*` / `--spacing-*` vars declared in `@theme`. Update the var, not the utility.
- **Place project rules in [src/styles/app.css](../src/styles/app.css) after `@import "tailwindcss"`** so source order wins on equal-specificity selectors.
- **Tighten the selector** — wrap the element in a project-specific class and target that.

If none of those approaches work, the default is probably the wrong starting point for that surface.

### Prefer built-in utilities over arbitrary values

**Avoid Tailwind's arbitrary-value syntax (`max-w-[480px]`, `text-[15px]`, `bg-[#1d4ed8]`, `h-[60px]`) unless absolutely necessary.** Reach for the closest built-in utility instead — `max-w-md`, `text-sm`, `bg-primary`, etc.

Why:

- Built-in utilities track the design tokens in this file. Arbitrary values bypass the scale and let pixel-perfect drift creep in.
- Built-ins compile into a smaller, deduplicated CSS output. Arbitrary values create one-off rules per use.
- A reader scanning `max-w-md` knows it lines up with the documented container scale. `max-w-[472px]` raises an immediate "why this specific number?" question.

Acceptable uses of arbitrary syntax:

- **Arbitrary properties** (CSS-variable overrides like `focus:[--ring-color:var(--color-primary)]`) — there's no built-in alternative.
- **Arbitrary variants** (selector tweaks like `group-data-[loading=true]:invisible`) — also no built-in alternative.
- **Truly one-off measurements** that don't fit the scale and won't recur — document why in a comment.

If a value keeps recurring as an arbitrary literal, add it to `@theme` so it earns a name.

### Scoped styles in SFCs

Component-local CSS goes in `<style scoped>`. Reach for it only when a rule can't be expressed as Tailwind utilities (keyframes, complex pseudo-selectors, third-party widget overrides). The default for everything else is a utility class.

---

## 16. Tokens cheat-sheet

Quick reference — start here when bootstrapping a project's design system.

- **One source of truth:** `@theme` in [src/styles/app.css](../src/styles/app.css). No `tailwind.config.js`.
- **Three color families** to start: `gray` (default), `primary` (brand), state colors (success/warning/error). Add semantic aliases (`--color-surface`, `--color-primary`) and always pair a `*-content` for text contrast.
- **OKLCH** over hex / HSL — perceptually uniform.
- **Two-or-three font families** at most (`sans`, `heading`, optional `mono`). Self-host; declare `@font-face` in `app.css`.
- **Tailwind's default spacing scale** is fine. Add named tokens (`--spacing-header`) only for recurring custom values.
- **Pick a subset** of radius / shadow / breakpoint utilities and stick to it. Reject the rest in review.
- **No `!important`.** No arbitrary values when a built-in fits.
- **Decide dark-mode posture** (OS-driven vs. explicit toggle) before the second themed component lands.
- **Update this file** the moment a project declares its first concrete tokens — the "no tokens declared yet" framing should never lie.
