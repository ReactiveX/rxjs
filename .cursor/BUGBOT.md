# RxJS Bugbot Review Rules

Project-specific PR review instructions for the RxJS 8 monorepo. Default branch is `master`. Use **Yarn 1.22.21** — not npm workspaces.

Reference docs (follow these; do not duplicate in review comments):

- [AGENTS.md](../AGENTS.md) — package map and commands
- [CONTRIBUTING.md](../CONTRIBUTING.md) — PR flow, style, commits, tests
- [.cursor/rules/](./rules/) — scoped authoring rules for agents

## Repository-wide gates

If the PR modifies files under `.nx/cache/**`, `.yarn/cache/**`, `.tshy/**`, `dist/**`, or `**/generated/**` (except intentional release artifacts committed by maintainers), then add a blocking bug titled **"Do not commit build or cache output"** with body: "Revert generated, cache, and dist edits. Edit source files instead."

If the PR modifies `package-lock.json` or uses npm-specific workspace config instead of the repo's Yarn 1 setup, then add a blocking bug titled **"Use Yarn 1.22.21"** with body: "This monorepo uses Yarn 1.22.21. Do not add npm lockfiles or npm workspace changes."

If the PR targets a base branch other than `master` without clear release-maintainer context, then add a blocking bug titled **"Target master by default"** with body: "RxJS contribution PRs should target `ReactiveX/rxjs:master` unless a maintainer is intentionally preparing a release or backport branch."

If the PR adds pipeable operators or operator-like transforms under `packages/observable/**`, then add a blocking bug titled **"Operators belong in packages/rxjs"** with body: "`@rxjs/observable` is core primitives only. Move operator logic to `packages/rxjs/src/internal/operators/`."

If the PR edits API documentation output under `apps/rxjs.dev/` that is generated from JSDoc (dgeni output), then add a blocking bug titled **"Do not edit generated API docs"** with body: "Update JSDoc in `packages/rxjs/src/` and regenerate with `yarn workspace rxjs.dev docs`. Hand-written guides live in `apps/rxjs.dev/content/`."

If the PR changes public exports in `packages/rxjs/src/index.ts` or subpath barrels (`src/ajax/`, `src/fetch/`, `src/testing/`, `src/webSocket/`) without corresponding tests or JSDoc updates in the changed API surface, then add a blocking bug titled **"Public API change missing tests or docs"** with body: "New or changed public API requires marble or unit tests, dtslint when types change, and JSDoc with `@example` (marble PNG when stream-shaped)."

If a non-trivial PR has an empty or vague PR description that does not explain the problem, the chosen fix, and how it was tested, then add a non-blocking bug titled **"PR description missing review context"** with body: "Maintainers repeatedly ask for enough context to judge necessity and scope. Summarize the problem, implementation approach, and test/CI coverage in the PR body."

If the PR adds a new public API surface (operator, creation function, scheduler, subject helper, exported type, or package subpath) without linking an issue, discussion, or clear rationale for why it belongs in core rather than userland, then add a blocking bug titled **"New public API needs core rationale"** with body: "New RxJS API needs explicit maintainer-facing rationale: use case, semantics, naming, compatibility, and why this should live in RxJS core instead of a userland package."

If a PR mixes material library behavior changes with broad formatting-only or whitespace-only edits across unrelated files, then add a non-blocking bug titled **"Split formatting churn from behavior changes"** with body: "Keep mechanical formatting or move-only churn out of behavior PRs so reviewers can see the semantic diff. Put broad formatting changes in a follow-up PR."

If changed Markdown, HTML, or JSDoc adds links to paths that do not exist in this repository, references old repo locations such as `docs_app/`, or uses stale version names that conflict with the current RxJS 8 branch, then add a blocking bug titled **"Docs link or version drift"** with body: "Update links and version references to the current monorepo layout. Do not introduce stale `docs_app/` paths or outdated RxJS version guidance."

If the PR changes GitHub Actions workflows, package scripts, TypeScript config, dependency installation, or lockfile behavior in a way that drops the Node 18/20 CI matrix, skips `rxjs` lint/build/test/dtslint/import/esm checks, or bypasses `rxjs.dev` build/test checks without an explicit maintainer migration note, then add a blocking bug titled **"Preserve RxJS CI coverage"** with body: "CI changes must keep the package and docs checks that catch contribution regressions: Node 18/20, lint, build, unit tests, dtslint, import/esm tests, and rxjs.dev build/test unless a maintainer is intentionally migrating CI."

## Non-blocking guidance

If the only issues are Prettier/ESLint formatting that CI auto-fixes, do not file blocking bugs — mention as a non-blocking note only when the diff clearly violates stated style (single quotes, 140 char width, `import type` preference).

If the PR is an intentional breaking change for RxJS 8 with migration notes in `apps/rxjs.dev/content/deprecations/`, do not flag removal of deprecated APIs as a regression.

Scoped rules for changed paths:

- `packages/rxjs/` → [packages/rxjs/.cursor/BUGBOT.md](../packages/rxjs/.cursor/BUGBOT.md)
- `packages/observable/` → [packages/observable/.cursor/BUGBOT.md](../packages/observable/.cursor/BUGBOT.md)
- `apps/rxjs.dev/` → [apps/rxjs.dev/.cursor/BUGBOT.md](../apps/rxjs.dev/.cursor/BUGBOT.md)
