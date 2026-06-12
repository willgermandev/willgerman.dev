# Contributing

Thanks for working on this project. This doc covers the workflow conventions that don't already live in [`docs/`](docs/).

For everything else, the relevant doc owns the rules:

| Topic                                                  | Doc                                                  |
| ------------------------------------------------------ | ---------------------------------------------------- |
| Branch names, commit subjects, PRs, merging, reverts   | [docs/GIT.md](docs/GIT.md)                           |
| File naming, JS / Vue / Pinia / Vitest style, Prettier | [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) |
| Vue 3 + Vite + Tailwind v4 stack & patterns            | [docs/FRONTEND.md](docs/FRONTEND.md)                 |
| Tailwind v4 design tokens                              | [docs/DESIGN.md](docs/DESIGN.md)                     |
| SPA threat model & deploy hardening                    | [docs/SECURITY.md](docs/SECURITY.md)                 |
| WCAG 2.1 AA / Section 508 baseline                     | [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md)       |
| API integration patterns (when a backend lands)        | [docs/BACKEND.md](docs/BACKEND.md)                   |

If a rule isn't in one of those, this document is where it goes — currently that's the changelog.

---

## Quick start

```bash
npm install
npm run dev        # Vite dev server with HMR
npm run test:unit  # Vitest in watch mode
npm run build      # Production build to dist/
npm run format     # Prettier write across src/
```

Node `^20.19.0 || >=22.12.0` is required (see `engines` in [package.json](package.json)).

---

## Pull request checklist

Before opening a PR:

- [ ] Branch follows the naming rules in [docs/GIT.md §1](docs/GIT.md).
- [ ] Each commit subject is present-tense, lowercase, ≤72 chars (see [docs/GIT.md §6](docs/GIT.md)).
- [ ] `npm run test:unit` passes.
- [ ] `npm run build` succeeds without warnings.
- [ ] `npm run format` produces no diff.
- [ ] **[`CHANGELOG.md`](CHANGELOG.md) updated** with an entry under `## [Unreleased]` describing the user-visible change (see [Changelog management](#changelog-management) below).

The full pre-push checklist with project-specific commands lives in [docs/GIT.md §8](docs/GIT.md).

---

## Changelog management

This project keeps a human-readable changelog in [`CHANGELOG.md`](CHANGELOG.md) following the **[Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/)** specification and **[Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html)**. Read both — the rest of this section assumes you've skimmed them.

### Why bother

A changelog is a written-for-humans summary of every notable change to the project, organized by release. It's the document you wish every dependency you ever used had written. Specifically, it answers two questions a `git log` cannot:

- **What changed for the user** between version X and version Y? (`git log` is shaped by how the work was done, not by what landed.)
- **Was the change additive, behavior-changing, or breaking**, and **does my codebase need to do something** to upgrade?

`git log` is the audit trail; `CHANGELOG.md` is the release notes.

### What goes in (and what doesn't)

Keep a Changelog defines six change categories. Use only these — don't invent new ones:

| Section          | Use for                                                                       |
| ---------------- | ----------------------------------------------------------------------------- |
| **Added**        | New features, files, or capabilities.                                          |
| **Changed**      | Changes in existing functionality.                                             |
| **Deprecated**   | Features still working but scheduled for removal in a future release.          |
| **Removed**      | Features or behavior taken out in this release.                                |
| **Fixed**        | Bug fixes.                                                                     |
| **Security**     | Vulnerabilities patched, hardening applied. Always call these out explicitly.  |

**Do** include:

- User- or developer-visible behavior changes.
- New or removed configuration options, env vars, public APIs, CLI flags.
- Breaking changes (with a migration note in the same bullet).
- Notable doc rewrites that change the project's stated conventions.
- Dependency changes that affect downstream consumers (major bumps, replacements).

**Don't** include:

- Internal refactors that don't change observable behavior.
- Minor patch-level dependency bumps that don't surface to consumers.
- Typo fixes, formatting-only commits.
- Anything covered solely by the commit message — the changelog is editorial, not exhaustive.

> Rule of thumb: if a reader upgrading from the previous version doesn't need to know, leave it out.

### The `[Unreleased]` section

Every change starts under `## [Unreleased]` at the **top** of the file. This is where work accumulates between releases — when you open a PR, you add your entry there. At release time, the `[Unreleased]` heading is renamed to the new version, dated, and a fresh empty `[Unreleased]` block is added above it.

Maintaining `[Unreleased]` as you go means the release ritual is a rename, not an archaeology dig through `git log`.

### Writing entries

- **Past tense, user-facing voice.** "Added X", "Fixed Y", "Removed Z" — not "I added X" or "Adds X".
- **One bullet per discrete change.** Don't merge unrelated work into a single line; don't atomize one feature into a dozen sub-bullets.
- **Be specific.** "Added `useApi()` composable" beats "Added API helpers". Name files, env vars, options, and components in backticks so readers can grep for them.
- **Explain the why for breaking changes.** A breaking removal needs the migration path in the bullet:
  > **Removed** the `VITE_LEGACY_API` env var. Set `VITE_API_BASE_URL` directly — see [docs/BACKEND.md §3](docs/BACKEND.md).
- **Group by category, not by author or feature.** A PR that adds one thing and fixes another splits across **Added** and **Fixed**.

### When to update

Update `CHANGELOG.md` **in the same commit (or at least the same PR)** as the code change. Reviewers should see the changelog entry alongside the diff so the description can be discussed with the code.

If a PR has no user-visible effect (internal refactor, comment-only change, CI tweak), no entry is needed.

### Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html): `MAJOR.MINOR.PATCH`.

- **MAJOR** — incompatible API changes / breaking changes.
- **MINOR** — backward-compatible new functionality.
- **PATCH** — backward-compatible bug fixes.

While the project version is `0.x.y`, **anything goes** per semver §4 — breaking changes can land in a minor bump. A `1.0.0` release is the explicit "the public API is now stable" signal.

### Cutting a release

When the `[Unreleased]` section is ready to ship:

1. Pick the next version per semver. Anything **Removed**, or a **Changed** entry that breaks consumers, forces a MAJOR bump (or a MINOR while on `0.x.y`).
2. Bump `version` in [`package.json`](package.json).
3. In `CHANGELOG.md`:
   - Rename `## [Unreleased]` to `## [X.Y.Z] - YYYY-MM-DD` (ISO 8601 date).
   - Add a fresh empty `## [Unreleased]` block above it with the standard category headings.
   - Update the comparison links at the bottom (template below).
4. Commit with `release vX.Y.Z` as the subject.
5. Tag the commit: `git tag -a vX.Y.Z -m "release vX.Y.Z"` and push the tag.
6. Create the GitHub release using the new section of `CHANGELOG.md` as the description.

### Comparison links

Keep a Changelog renders version headings as links to the diff between releases. Pattern at the bottom of `CHANGELOG.md`:

```markdown
[Unreleased]: https://github.com/willgermandev/vue-template/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/willgermandev/vue-template/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/willgermandev/vue-template/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/willgermandev/vue-template/releases/tag/v1.0.0
```

Update the `[Unreleased]` link's left side at every release so it always compares against the latest tag.

### Worked example

A typical PR that adds a feature, fixes an unrelated bug, and removes a deprecated option would land an entry like this in the existing `[Unreleased]` section:

```markdown
## [Unreleased]

### Added

- `useApi()` composable wrapping `fetch` with `VITE_API_BASE_URL` and a normalized error type. See [docs/BACKEND.md §3.1](docs/BACKEND.md).

### Changed

- `<RouterLink>` usages in `NavBar.vue` now navigate by route name instead of path. No behavior change for end users.

### Removed

- `VITE_LEGACY_API` env var. Use `VITE_API_BASE_URL` instead — see [docs/BACKEND.md §2.1](docs/BACKEND.md).

### Fixed

- Cart total no longer drops the decimal when the quantity equals one (`formatPrice` integer-collapse bug).

### Security

- Bumped `vite` to `^8.0.9` to pick up the dev-server origin-check fix in `GHSA-xxxx-xxxx-xxxx`.
```

When this ships as `1.2.0`, the `## [Unreleased]` heading becomes `## [1.2.0] - 2026-06-12`, a fresh empty `## [Unreleased]` is added above it, and the comparison links are updated.

### Tooling

There's no automated changelog tooling wired today (no `release-please`, no `changesets`, no `conventional-changelog`). The changelog is **hand-authored** because the bullets need editorial care that those tools don't provide. If a future project needs automation, evaluate:

- [release-please](https://github.com/googleapis/release-please) — GitHub Action driven by Conventional Commits.
- [changesets](https://github.com/changesets/changesets) — preferred when shipping multiple packages from one repo.
- [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) — CLI for generating entries from Conventional Commits.

Each of these requires adopting Conventional Commits (or a variant). That decision conflicts with the present-tense plain-English commit subject style in [docs/GIT.md §6](docs/GIT.md) — pick one or the other, don't half-adopt.

### References

- [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) — the format this project follows.
- [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) — version-bumping rules.
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) — referenced only because the tooling above expects it; **this project does not use Conventional Commits**.
