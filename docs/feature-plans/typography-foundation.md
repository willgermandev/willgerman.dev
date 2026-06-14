# Typography foundation

Self-host the **Barlow** (Light 300, Regular 400) and **Barlow Condensed** (Black 900) font families, declare the project's first Tailwind v4 `@theme` tokens for typography (`--font-sans`, `--font-condensed`) and base colors (`--color-background`, `--color-foreground`), and apply the dark-only body defaults (black background, white text, Barlow stack) on the document. The work lives entirely in [src/styles/app.css](../../src/styles/app.css), [src/assets/fonts/](../../src/assets/fonts/), and [docs/DESIGN.md](../DESIGN.md), and ships on `feature/typography-foundation`. This is the foundation every other feature in the willgerman-portfolio project (home-menu, settings, project-list, project-detail) consumes — it owns the names downstream features will reference.

## Holistic overview

**Problem or opportunity.** The willgerman.dev SPA was scaffolded from this template with [src/styles/app.css](../../src/styles/app.css) containing only `@import "tailwindcss"` and `@plugin "@tailwindcss/typography"` — there is no `@theme` block, no design tokens, and [src/assets/fonts/](../../src/assets/fonts/) is an empty placeholder. The portfolio's visual identity is built on a dark-only base (black background, white text) with two specific type families: Barlow as the body sans, and Barlow Condensed Black 900 as the display face for the game-menu-style home screen. None of those primitives exist yet. Every downstream feature — menu buttons, settings sidebar, project cards, detail view — assumes them; without this foundation, every later feature has to either reach for Tailwind v4's defaults (Inter via system stack, white-on-white at minimum) or redeclare its own tokens, which is exactly the drift [DESIGN.md §1](../DESIGN.md) warns against.

**Approach.** Self-host the three required font weights as `.woff2` under [src/assets/fonts/](../../src/assets/fonts/) (`barlow-light.woff2`, `barlow-regular.woff2`, `barlow-condensed-black.woff2`), declare three `@font-face` rules with `font-display: swap` in [src/styles/app.css](../../src/styles/app.css), and add the project's first `@theme` block declaring `--font-sans` (Barlow stack) and `--font-condensed` (Barlow Condensed stack) per [DESIGN.md §3](../DESIGN.md), plus base color tokens `--color-background: #000` and `--color-foreground: #fff`. An `@layer base` rule applies the body defaults: `background-color: var(--color-background)`, `color: var(--color-foreground)`, `font-family: var(--font-sans)`. Update [docs/DESIGN.md](../DESIGN.md) to reflect the now-declared tokens (the doc currently lies — it says "no tokens declared yet" — and the moment we land tokens, [DESIGN.md §16](../DESIGN.md) says to update it).

**Constraints.** [SECURITY.md §2.3](../SECURITY.md) implies no third-party CDN fonts; [DESIGN.md §3](../DESIGN.md) explicitly forbids depending on Google Fonts at runtime. `font-display: swap` is required per [ACCESSIBILITY.md](../ACCESSIBILITY.md) (avoids invisible text during font load — perceived-performance + a11y win). All declarations conform to Tailwind v4's CSS-only configuration model — **no `tailwind.config.js`** is introduced. Prettier conventions (4-space indent, double quotes, semicolons, 100-col) per [CODING_STANDARDS.md §9](../CODING_STANDARDS.md) apply to the CSS file. The Barlow / Barlow Condensed weights ship as static `.woff2` files (one per weight), not as a variable font, because we only need three specific weights and a variable-font payload typically exceeds three weight-pinned `.woff2`s combined for our purposes. Latin-subset is preferred to keep payload small.

**Out of scope (explicit).**

- **Applying typography utilities or color tokens to any view or component.** Each downstream feature (menu buttons, settings, project list, project detail) is responsible for consuming the tokens this feature establishes. Touching `HomeView.vue` here would couple this feature to home-menu and is explicitly deferred.
- **Variable-font (`Barlow[wght].woff2`) implementation.** Three static weights (Light 300, Regular 400, Black 900) cover the design's needs. Adopting the variable font is a separate decision driven by adding a fourth weight, and is flagged below.
- **`woff` fallback alongside `woff2`.** The project's documented Node engine matrix (`^20.19.0 || >=22.12.0`) and the modern-browser baseline mean `woff2` has effectively universal support. Flagged below in case the browser matrix changes.
- **Dark / light mode toggle logic.** The design is dark-only. No `prefers-color-scheme` media query, no `[data-theme]` attribute selector, no Pinia store. If a light mode is ever needed, that's a separate feature with its own plan.
- **Per-component typography overrides** (e.g. tightening line height on cards, restyling the `prose` plugin). Each downstream feature owns its own consumption.
- **Custom `--text-*` size-scale overrides.** Tailwind v4's default size ramp (`text-xs` through `text-9xl`) is kept. If a specific size needs adjustment (e.g. the menu-button title), the downstream feature declares it.
- **Tailwind `@tailwindcss/typography` plugin (`prose`) configuration changes.** The plugin is already loaded; this feature doesn't touch its config. Any `prose-headings:font-condensed` mapping is a downstream consumer concern.
- **`.gitkeep` files in `src/assets/fonts/`.** The `.woff2` files this feature commits *are* the tracked content that makes the directory survive a fresh clone (per the [CLAUDE.md](../../CLAUDE.md) warning).
- **Cross-cutting glass-surface utility.** That utility belongs to a later feature (`menu-button` or a shared utilities pass — see the project's `_index.md`). This feature only declares the *tokens* it owns; downstream features compose glass surfaces from this feature's tokens plus their own.

## Generated code

### Configuration

#### File: [src/assets/fonts/](../../src/assets/fonts/) (new tracked files)

Acquire the three font files from the upstream sources and place them in [src/assets/fonts/](../../src/assets/fonts/). The source-of-truth for both families is [fonts.google.com](https://fonts.google.com/specimen/Barlow) and [fonts.google.com/specimen/Barlow+Condensed](https://fonts.google.com/specimen/Barlow+Condensed) — both are SIL Open Font License 1.1, redistributable, and the same files Google Fonts serves. Download via [google-webfonts-helper](https://gwfh.mranftl.com/) (or `npx google-fonts-helper download` if added later) **Latin-subset, `.woff2`** for each:

| Family             | Weight       | File name in `src/assets/fonts/`        |
| ------------------ | ------------ | --------------------------------------- |
| Barlow             | 300 (Light)  | `barlow-light.woff2`                    |
| Barlow             | 400 (Regular)| `barlow-regular.woff2`                  |
| Barlow Condensed   | 900 (Black)  | `barlow-condensed-black.woff2`          |

Naming follows [CODING_STANDARDS.md §3](../CODING_STANDARDS.md): kebab-case under `src/assets/`. The files are imported indirectly via `@font-face url("…")` resolution from [src/styles/app.css](../../src/styles/app.css), so Vite fingerprints them as part of the CSS asset graph.

#### File: [src/styles/app.css](../../src/styles/app.css) (full replacement)

The existing file has two lines; the replacement adds the `@font-face` block, the `@theme` block, and the `@layer base` defaults. Order matters in Tailwind v4: `@import "tailwindcss"` first, `@plugin` next, then `@font-face` (so the `url()`s resolve against this file's path), then `@theme` (so tokens are picked up by the utility generator), then `@layer base` (so the defaults sit at the base layer, below utilities).

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Self-hosted Barlow family — Latin subset, .woff2 only.
   Sourced from fonts.google.com (SIL OFL 1.1). See docs/DESIGN.md §3. */
@font-face {
    font-family: "Barlow";
    font-style: normal;
    font-weight: 300;
    font-display: swap;
    src: url("../assets/fonts/barlow-light.woff2") format("woff2");
}

@font-face {
    font-family: "Barlow";
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url("../assets/fonts/barlow-regular.woff2") format("woff2");
}

@font-face {
    font-family: "Barlow Condensed";
    font-style: normal;
    font-weight: 900;
    font-display: swap;
    src: url("../assets/fonts/barlow-condensed-black.woff2") format("woff2");
}

@theme {
    /* Typography — Barlow body, Barlow Condensed display.
       Generates utilities: font-sans, font-condensed. */
    --font-sans: "Barlow", ui-sans-serif, system-ui, sans-serif;
    --font-condensed: "Barlow Condensed", "Barlow", ui-sans-serif, system-ui, sans-serif;

    /* Base colors — dark-only palette.
       Generates utilities: bg-background, text-background, bg-foreground, text-foreground, border-foreground, etc. */
    --color-background: #000000;
    --color-foreground: #ffffff;
}

@layer base {
    body {
        background-color: var(--color-background);
        color: var(--color-foreground);
        font-family: var(--font-sans);
    }
}
```

Notes on shape:

- **`url("../assets/fonts/…")`** is relative to the CSS file's location (`src/styles/app.css`), resolving to `src/assets/fonts/…`. Vite's CSS processor handles the rewrite during build so the emitted CSS points at the fingerprinted asset URL.
- **`font-display: swap`** is on every face — text renders immediately in the fallback (`ui-sans-serif` / `system-ui`) and re-renders in Barlow once it loads. Avoids the FOIT (flash of invisible text) per [ACCESSIBILITY.md](../ACCESSIBILITY.md) perceived-performance guidance.
- **`font-weight: 300 / 400 / 900`** lets browsers synthesize intermediate weights if a downstream component asks for `font-medium` (500) or `font-bold` (700). That's deliberate — synthesized weights look acceptable for Barlow, and the design only intentionally uses the three weights shipped. [DESIGN.md §3](../DESIGN.md)'s note about synthesizing on single-weight display faces still applies: don't expect `font-bold` on `font-condensed` to differ from `font-black`.
- **Fallback stack** matches [DESIGN.md §3](../DESIGN.md)'s example shape (`"<Family>", ui-sans-serif, system-ui, sans-serif`). Barlow Condensed falls back to Barlow first so the cascade preserves the "sans" feel before degrading to system fonts.
- **`@theme` declarations** become Tailwind v4 utilities automatically per [DESIGN.md §1](../DESIGN.md): `--font-sans` → `font-sans` utility; `--font-condensed` → `font-condensed` utility; `--color-background` → `bg-background`, `text-background`, `border-background`; `--color-foreground` → `bg-foreground`, `text-foreground`, `border-foreground`. **These are the public token names downstream features reference.**
- **`@layer base` for body defaults** rather than a bare selector. This places the rule in Tailwind v4's `base` layer, ensuring user utilities still win at the same specificity — the rule sets the floor, not a ceiling. The default is intentionally on `body` rather than `:root` so the `<html>` element keeps the user-agent default (mostly transparent), which avoids any flash before the body paints.

### Presentation

#### File: [docs/DESIGN.md](../DESIGN.md) (targeted edits)

Three updates so the doc stops claiming "no tokens declared yet" and documents what *is* now declared. Edit scope is narrow — don't restructure the doc, just amend the affected sections.

1. **§1 "Where tokens live"** — update the prose that says "the scaffold ships with the import and the typography plugin wired in but no tokens declared yet" to point at the now-declared `@theme` block, listing the four tokens it declares (`--font-sans`, `--font-condensed`, `--color-background`, `--color-foreground`) and linking them to the utilities they generate.
2. **§2 "Color" — Recommended starting palette** — append a "Currently declared" subsection naming `--color-background` and `--color-foreground`, noting the dark-only posture (no `*-content` pair is needed when the foreground is the only content color), and noting that the OKLCH recommendation in [DESIGN.md §2](../DESIGN.md) is deferred — we use raw `#000` / `#ffffff` because they're extremes where OKLCH offers no precision advantage.
3. **§3 "Typography" — Recommended families** — append a "Currently declared" subsection listing the two declared families, their weights (Light 300, Regular 400 for Barlow; Black 900 for Barlow Condensed), the file locations, and the fallback stacks.

These edits are documentation of state, not new prescription — no Phase 0 primitive churn elsewhere in the doc is needed.

#### File: [CLAUDE.md](../../CLAUDE.md) (one-line update, optional)

The "Architecture > Styling" line currently says:

> [src/styles/app.css](src/styles/app.css) currently has `@import "tailwindcss"` + `@plugin "@tailwindcss/typography"` and **no `@theme` block yet** — declare project tokens there per [docs/DESIGN.md §1](docs/DESIGN.md).

Update to reflect that the `@theme` block now exists with the four tokens this feature declares. Flagged below as optional — the staleness will be noticed naturally on the next pass through `CLAUDE.md`, and feature plans modifying `CLAUDE.md` risk merge churn.

## Phased implementation plan

### Phase 1 — Feature build-out

At the end of this phase: the three `.woff2` files are committed under [src/assets/fonts/](../../src/assets/fonts/); [src/styles/app.css](../../src/styles/app.css) declares the `@font-face` rules, the `@theme` block, and the `@layer base` body defaults; the dev server renders the body with a black background, white text, and Barlow as the body font; `font-sans`, `font-condensed`, `bg-background`, `bg-foreground`, `text-background`, `text-foreground` are usable utilities; and [docs/DESIGN.md](../DESIGN.md) reflects what's declared.

1. **Acquire the font files.** Download from [google-webfonts-helper](https://gwfh.mranftl.com/) — Barlow (charsets: Latin; styles: 300, 400) and Barlow Condensed (charsets: Latin; styles: 900). Pick "Modern Browsers" (`woff2` only). Place exactly three files in [src/assets/fonts/](../../src/assets/fonts/): `barlow-light.woff2`, `barlow-regular.woff2`, `barlow-condensed-black.woff2`. Rename downloads as needed to match the casing exactly.
    - _Verify:_ `ls src/assets/fonts/` lists exactly the three filenames above; `file src/assets/fonts/*.woff2` confirms each is a WOFF2 file; total size of the three files combined is under ~80 KB (Barlow Latin Light + Regular runs ~20 KB each; Barlow Condensed Black Latin runs ~20–30 KB).
2. **Replace [src/styles/app.css](../../src/styles/app.css)** with the content in `## Generated code > File: src/styles/app.css` above. Keep the existing `@import "tailwindcss"` and `@plugin "@tailwindcss/typography"` directives as the first two lines; append the `@font-face`, `@theme`, and `@layer base` blocks in that order. Conform to Prettier's 4-space indent and double-quote style per [CODING_STANDARDS.md §9](../CODING_STANDARDS.md).
    - _Verify:_ `npm run format` produces no diff on the file (Prettier accepts the formatting); the file ends with a single trailing newline.
3. **Update [docs/DESIGN.md](../DESIGN.md)** per the three targeted edits in `## Generated code > File: docs/DESIGN.md` above. Keep the existing structure; append "Currently declared" subsections rather than rewriting.
    - _Verify:_ The phrases "no tokens declared yet" and "the scaffold ships with the import and the typography plugin wired in but no tokens declared yet" no longer appear in [docs/DESIGN.md](../DESIGN.md); a new contributor reading §§1–3 can list the four declared token names without referring to any other file.
4. **Run the dev server.** `npm run dev`; open `http://localhost:5173` in Chrome / Edge / Firefox in turn.
    - _Verify:_ DevTools → Elements → Computed on `<body>` shows `background-color: rgb(0, 0, 0)`, `color: rgb(255, 255, 255)`, and `font-family` whose first family is `Barlow`. DevTools → Network filtered to "Font" shows three requests, each `200 OK`, each served from the same origin (`http://localhost:5173`), no `404`s. No console warnings about font loading.
5. **Run the production build.** `npm run build`, then `npm run preview`.
    - _Verify:_ `npm run build` exits `0` with no warnings about missing assets or unresolved `url()`s; `dist/assets/` contains three fingerprinted `.woff2` files; `npm run preview` serves the built bundle at `http://localhost:4173` with the same body computed styles as step 4.

**Exit criterion:** all five `_Verify:_` checks pass; the body of every URL in the SPA paints black-on-white-text in Barlow without console warnings or font 404s.

### Phase 2 — Unit and integration tests

_N/A — feature has no JavaScript surface to unit-test._ The deliverables are font files, CSS declarations, and a doc update. The behavioral assertions live as DOM-level computed-style checks in Phase 1's `_Verify:_` lines and Phase 4's accessibility checks. The Vitest harness ([vitest.config.js](../../vitest.config.js)) runs in `jsdom`, which does not load fonts or compute the `font-family` cascade the way a real browser does — adding a Vitest spec for "Barlow loads" would be a false-positive harness. If a future component test needs to assert "uses `font-condensed` utility," that's the component's spec, not this feature's.

If a `prose`-plugin override or a token-derived utility class is later proven necessary, this phase reopens — the success conditions in `## Success conditions` would gain a new check, and the component owning the override would add a spec.

### Phase 3 — Security and risk audit

The feature touches one surface with security implications: where the font files come from and how they're delivered. Walk through the items from [SECURITY.md](../SECURITY.md) that apply:

1. **§2.3 Environment variable hygiene** — no env vars touched; no `VITE_*` additions.
    - _Verify:_ `git diff main -- '*.env*'` is empty.
2. **§3 XSS prevention** — no `v-html`, no dynamic `:href` / `:src`, no `innerHTML`. Pure declarative CSS.
    - _Verify:_ `git diff main -- src/` shows changes only to `src/styles/app.css` and three binary `.woff2` files.
3. **§4 CSP — `font-src` directive** — when CSP lands (out of scope for this feature; flagged in the project `_index.md`), `font-src 'self'` must cover the fingerprinted `dist/assets/*.woff2` paths. Self-hosting under `src/assets/fonts/` means no third-party `font-src` allowlist entry is needed — which is the whole point of self-hosting per [SECURITY.md §1](../SECURITY.md).
    - _Verify:_ DevTools Network panel in Phase 1 step 4 confirms every font request is same-origin; documented for the future CSP-config feature owner.
4. **§6 Dependency supply chain** — no new npm dependency added. No `postinstall` script. No new lockfile churn.
    - _Verify:_ `git diff main -- package.json package-lock.json` is empty.
5. **§9 Forms / user input** — N/A; no user input.
6. **License compliance for the fonts** — Barlow and Barlow Condensed ship under the SIL Open Font License 1.1, which permits redistribution including in bundled form. No `LICENSE` file copy is *required* to be redistributed alongside the `.woff2` files, but it is best practice — note in the Flagged for human review section.
    - _Verify:_ The fonts' OFL terms are referenced in the comment block at the top of the `@font-face` rules in [src/styles/app.css](../../src/styles/app.css); the comment links readers back to [docs/DESIGN.md §3](../DESIGN.md) which can carry the full OFL pointer.

**Exit criterion:** every check above passes; no new external network destination is introduced; no new dependency is added; license posture is documented.

### Phase 4 — Accessibility audit

The feature affects every page's perceived performance and contrast floor. Walk through the [ACCESSIBILITY.md](../ACCESSIBILITY.md) WCAG 2.1 AA criteria that apply:

1. **1.4.3 Contrast (Minimum)** — `#000` background against `#ffffff` foreground is **21:1**, which is the maximum possible and trivially exceeds the 4.5:1 floor (and the AAA 7:1 floor). Verify with WebAIM Contrast Checker.
    - _Verify:_ WebAIM Contrast Checker reports 21:1 for `#000000` / `#FFFFFF`; pass for normal text, large text, and graphical objects.
2. **1.4.4 Resize Text / 1.4.10 Reflow / 1.4.12 Text Spacing** — Barlow at the default `text-base` (16px / 1rem) survives 200% zoom, 400% reflow, and Steve Faulkner's text-spacing bookmarklet without layout breakage. Re-run after Phase 1 step 4 in a viewport at 320 CSS pixels wide.
    - _Verify:_ Browser zoom to 200% on `http://localhost:5173` shows no clipped body text; viewport resized to 320 px wide shows body text reflowing without horizontal scroll.
3. **3.1.1 Language of Page** — Unchanged by this feature. [index.html](../../index.html) already ships `lang="en"` per [CLAUDE.md](../../CLAUDE.md).
    - _Verify:_ `grep 'lang=' index.html` confirms `lang="en"` still present.
4. **`font-display: swap` and FOIT avoidance** — already specified on every `@font-face` rule. Throttle network to "Slow 3G" in DevTools and reload: the body text appears immediately in the fallback (system sans), then re-renders in Barlow once loaded.
    - _Verify:_ DevTools → Network → Slow 3G throttle → reload → body text is readable within the first paint, no period of invisible text. Confirms WCAG 2.4.7 (focus visibility) is not affected by font loading state.
5. **`prefers-reduced-motion`** — N/A; this feature introduces no animation. (`font-display: swap` does not animate; the swap is a single render-tree update.)

**Exit criterion:** all four applicable checks pass. The 21:1 contrast result is recorded in the PR description as the contrast baseline downstream features can lean on; any darker foreground a downstream feature picks must independently re-verify against the new background pair.

### Phase 5 — Search-engine-optimization audit

Walk through SEO surface changes:

1. **Page title, meta description, canonical URL** — unchanged. `<title>Vue Template</title>` remains; updating it is downstream feature work (likely the home-menu or routing feature).
2. **Web fonts and Core Web Vitals** — `font-display: swap` is the right choice for Largest Contentful Paint (LCP) on body text: the LCP element is rendered immediately in the fallback rather than blocked on the Barlow download. Latin-subset keeps the total font payload small (~60–80 KB across three files), well under the LCP budget for a static SPA on a CDN.
    - _Verify:_ Lighthouse → Performance run on `npm run preview` reports no "Ensure text remains visible during webfont load" failure; the LCP element is body text rendered with the fallback initially.
3. **`preload` hints** — out of scope for this feature. If LCP later regresses, a Phase 6 follow-up can add `<link rel="preload" as="font" type="font/woff2" href="…" crossorigin>` to [index.html](../../index.html). Adding it speculatively would block on the font without a measured benefit.
    - _Verify:_ Documented as a known follow-up — no action this phase.
4. **`robots.txt` / `sitemap.xml`** — unaffected. The empty placeholder issue documented in [CLAUDE.md](../../CLAUDE.md) is its own follow-up.

**Exit criterion:** Lighthouse on `npm run preview` shows no webfont-related failure; LCP element renders in the fallback first; the preload-hint decision is documented as deferred.

## Success conditions

- `npm run dev` and `npm run build` complete with **exit code 0** and no font-related warnings, missing-asset errors, or unresolved-`url()` errors; DevTools Network panel filtered to "Font" shows exactly three `200 OK` requests, all served from the same origin (`http://localhost:5173` in dev, `http://localhost:4173` in preview).
- DevTools → Elements → Computed on `<body>` of any URL in the SPA shows `background-color: rgb(0, 0, 0)`, `color: rgb(255, 255, 255)`, and a `font-family` whose first resolved family is `Barlow`.
- Inserting `<h1 class="font-condensed font-black">Test</h1>` into any view's `<template>` renders the text in Barlow Condensed Black (not the fallback system sans, not synthesized bold). Inserting `<p class="font-light">Test</p>` renders in Barlow Light. Inserting `<div class="bg-foreground text-background">Test</div>` renders white-on-black (inverse of the body default), confirming the color tokens generated their utility classes.
- WebAIM Contrast Checker reports **21:1** for `#000000` background against `#ffffff` foreground; no [DESIGN.md §2](../DESIGN.md) contrast threshold is missed.
- Lighthouse run on `npm run preview` reports **no "Ensure text remains visible during webfont load" failure** and the LCP element is body text rendered in the fallback before Barlow loads.
- [docs/DESIGN.md](../DESIGN.md) §§1–3 no longer contain the phrase "no tokens declared yet" and explicitly name the four tokens this feature declares (`--font-sans`, `--font-condensed`, `--color-background`, `--color-foreground`) with their generated utility names.

## Flagged for human review

_All items resolved 2026-06-14. Decisions below are binding for the implementing PR._

- **`woff2`-only — no `woff` fallback. [Resolved: ship `.woff2`-only as planned.]** WOFF2 has [Baseline universal browser support](https://caniuse.com/woff2) for every browser since 2020. If a browser-matrix decision later requires IE11 or legacy Edge support, a follow-up `feature/typography-woff-fallback` plan adds the parallel `.woff` files and updates each `@font-face`'s `src:` to include `format("woff")` after the `format("woff2")` entry — non-breaking change.

- **OFL license text inclusion. [Resolved: bundle `OFL.txt` in the repo.]** Commit the full SIL OFL 1.1 license text alongside the font files at `src/assets/fonts/OFL.txt` (one file covers both Barlow and Barlow Condensed — same license). Also add a short comment block at the top of the `@font-face` rules in [src/styles/app.css](../../src/styles/app.css) citing "SIL Open Font License 1.1" and pointing at `src/assets/fonts/OFL.txt`. Revisit if the upstream license version ever changes (refresh from [fonts.google.com/specimen/Barlow](https://fonts.google.com/specimen/Barlow)).

- **Variable-font vs. three static weights. [Resolved: ship three static weights as planned.]** Three static `.woff2` files (Light 300, Regular 400, Black 900) ship now. Migration to a single variable font (`Barlow[wght].woff2`) is a 1-hour follow-up (`feature/typography-variable-fonts`) when the design needs a fourth weight.

- **Raw hex (`#000` / `#fff`) vs. OKLCH for the base colors. [Resolved: OKLCH.]** Declare `--color-background: oklch(0% 0 0)` and `--color-foreground: oklch(100% 0 0)` to keep the color-token contract uniform across the design system per [DESIGN.md §2](../DESIGN.md). The lightness/chroma/hue triplet documents intent even at the endpoints, and the file stays consistent when intermediate gray surface tokens land.

- **`@layer base` body default vs. bare `body { … }` rule. [Resolved: use `@layer base` as planned.]** Tailwind v4's `@layer base` places the rule below utilities, so a downstream component can override with `bg-foreground` or `text-background` utilities without specificity hacks — exactly what [DESIGN.md §15](../DESIGN.md) prescribes.

- **Updating [CLAUDE.md](../../CLAUDE.md) "Architecture > Styling" line. [Resolved: update in this PR.]** Replace the stale `no @theme block yet` line in [CLAUDE.md](../../CLAUDE.md)'s "Architecture > Styling" section with the accurate description: "`@theme` declares `--font-sans` (Barlow), `--font-condensed` (Barlow Condensed), `--color-background`, and `--color-foreground`; see [docs/DESIGN.md](docs/DESIGN.md) for the canonical token list." The CLAUDE.md edit lands in the same PR as the `@theme` block so the doc never drifts from reality. If a sibling plan also edits `CLAUDE.md` first, rebase and merge the edits — both will be short.

- **Cross-cutting glass surface utility (project-level concern). [Resolved at project level: owned by `menu-button` Phase 0.]** This feature does **not** declare the glassmorphic surface utility. `menu-button` (first consumer) declares it under `@layer utilities` in [src/styles/app.css](../../src/styles/app.css), consuming the `--color-background` / `--color-foreground` tokens declared here. No action required from this feature's reviewer.

- **`preload` hints for Barlow Regular. [Resolved: no preload hints in this feature.]** Ship without `<link rel="preload" as="font" …>` hints in [index.html](../../index.html). Revisit only if a measured Lighthouse / WebPageTest run flags webfont LCP cost — at that point, add the preload hint via a follow-up `feature/typography-preload` plan after measuring which weight is on the LCP critical path.

- **Font subset beyond Latin. [Resolved: Latin subset only.]** Ship the Latin subset to minimize payload. When a non-Latin content need lands (Cyrillic project names, Vietnamese diacritics), open a follow-up `feature/typography-extended-subset` plan to add the parallel subset files and the `unicode-range` descriptors.
