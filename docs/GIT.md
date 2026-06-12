# Git

Project-specific git conventions for this repository.

The general conventions — branch naming, commit subject style, pull-request template, merge strategy defaults, force-push policy — live in Claude Code's `/git` skill (`references/git-conventions.md` in the skill bundle). This file overrides or fills in the values that are specific to this repo; read it alongside the general guide.

---

## 1. Trunk branch

The trunk branch is **`main`**. Every rule in the general guide that refers to "the trunk branch" or `<trunk>` resolves to `main` here.

- Pull requests target `main`.
- `release/*` branches, when used, are cut from `main`.

---

## 2. Remote

The canonical remote is `git@github.com:willgermandev/vue-template.git`. If `git remote -v` shows a different URL, update it:

```bash
git remote set-url origin git@github.com:willgermandev/vue-template.git
```

When this template is used as the starting point for a new project, change the remote to that project's repository before pushing.

---

## 3. Local commands

Substitute these wherever the general guide says "see the project's `docs/GIT.md`":

| Purpose                     | Command                                                     |
| --------------------------- | ----------------------------------------------------------- |
| Run tests                   | `npm run test:unit`                                         |
| Single test file            | `npx vitest run src/__tests__/App.spec.js`                  |
| Single test by name         | `npx vitest run -t "mounts renders properly"`               |
| Format JS / Vue / CSS / MD  | `npm run format` (Prettier, scoped to `src/`)               |
| Production build            | `npm run build`                                             |
| Local preview of build      | `npm run preview`                                           |

There is no Python virtualenv to activate and no separate HTML linter — the Vue SFC template is owned by Prettier alongside the rest of the codebase.

---

## 4. Branch protection (target state on GitHub)

Treat this as the checklist when configuring branch protection on `main`, not a description of what's currently enabled:

- Require pull request before merging.
- Require at least one approving review.
- Dismiss stale reviews when new commits are pushed.
- Require status checks to pass (tests, build).
- Require branches to be up to date before merging.
- Disallow force-pushes to `main`.
- Disallow deletions of `main`.

The same rules apply to any active `release/*` branch.

---

## 5. Merge strategy on GitHub

- **Squash and merge** — default for `feature/`, `bugfix/`, `docs/`, `audit/`, and `refactor/` branches.
- **Create a merge commit** — reserved for `release/*` → `main` merges.
- **Rebase and merge** — not used.

Repository settings:

- Default commit message for squash merges: **Pull request title and description**.
- Automatically delete head branches after merge: **on**.

---

## 6. Commit subject style

Present-tense verbs only — `add`, `update`, `fix`, `remove`, `rename`, `move`, `refactor`, `build`, `polish`. Never past tense (`added`, `built`).

Examples that fit the conventions:

- `add prettier configuration and reformat template files`
- `wire pinia store for global cart state`
- `fix router base path for github pages deploy`
- `bump vue to 3.5.x and resolve breaking script-setup changes`

---

## 7. AI-assisted commits

Commits authored with Claude Code include the standard co-author trailer:

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

This is the `/git` skill's default and is applied automatically — no per-commit opt-in needed.

---

## 8. Pre-push checklist (concrete commands)

The general guide's checklist with this repo's commands plugged in:

- [ ] Branch name follows the general guide §1.
- [ ] Each commit subject follows the general guide §2.
- [ ] No secrets in the diff (no `.env`, no `VITE_*` keys checked in).
- [ ] No commented-out code or `console.log` left behind.
- [ ] `npm run test:unit` passes locally.
- [ ] `npm run build` succeeds without warnings.
- [ ] `npm run format` produces no diff (Prettier is clean).

---

## 9. Files that must never be committed

In addition to the general rule about secrets:

- `.env`, `.env.*.local` — environment variables. Use `.env.example` (without secrets) for the template; commit that.
- `dist/` — Vite build output, gitignored.
- `node_modules/` — npm dependencies, gitignored.
- `.vite/`, `.vitest-cache/` — dev-server and test caches, gitignored.
- `coverage/` — coverage reports, gitignored.
- `*.local` — any file with the `.local` suffix (Vite convention for local-only overrides).

There are **no tracked-but-generated files** in this template — every committed file is a source file. CSS is compiled at build time by `@tailwindcss/vite`, not committed.
