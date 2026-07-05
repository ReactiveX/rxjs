# RxJS Agent Guide

RxJS 8 monorepo: reactive library packages under `packages/`, docs site under `apps/`. Use **Yarn 1.22.21** (not npm). Default branch is `master`. PRs target `ReactiveX/rxjs:master`.

## Package map

| Package            | Path                  | Test runner           |
| ------------------ | --------------------- | --------------------- |
| `rxjs`             | `packages/rxjs`       | Mocha + marble tests  |
| `@rxjs/observable` | `packages/observable` | Vitest                |
| `rxjs.dev`         | `apps/rxjs.dev`       | Jasmine/Karma + dgeni |

## Cursor rules

Progressive-disclosure rules live in `.cursor/rules/`:

| Rule                       | Scope                                           |
| -------------------------- | ----------------------------------------------- |
| `rxjs-repo.mdc`            | Always on — boundaries, style, rule index       |
| `rxjs-operators.mdc`       | `packages/rxjs/src/internal/operators/**`       |
| `rxjs-core-internals.mdc`  | Observables, subjects, schedulers, ajax, util   |
| `rxjs-marble-tests.mdc`    | `packages/rxjs/spec/operators/**`               |
| `rxjs-mocha-specs.mdc`     | `packages/rxjs/spec/**` (CI vs local, GC tests) |
| `rxjs-dtslint.mdc`         | `packages/rxjs/spec-dtslint/**`                 |
| `rxjs-observable-core.mdc` | `packages/observable/**`                        |
| `rxjs-dev-site.mdc`        | `apps/rxjs.dev/**`                              |

## Skills

| Skill                       | Trigger                                                        |
| --------------------------- | -------------------------------------------------------------- |
| `/rxjs-onboard`             | First-time repo setup (explicit slash command)                 |
| `rxjs-new-operator`         | "Add a new operator", first contribution                       |
| `rxjs-repro-to-test`        | Bug report → failing marble test (test-first; QA/engineering)  |
| `rxjs-bug-fix`              | Fix a reported bug end-to-end (test + implementation + verify) |
| `rxjs-github-issue`         | GitHub issue URL/number triage before coding                   |
| `rxjs-conventional-commits` | Commit messages                                                |
| `rxjs-firebase-docs`        | Docs preview deploy (Firebase MCP in `.cursor/mcp.json`)       |
| `rxjs-publish`              | Release and publish packages (any registry, incl. Verdaccio)   |

Repo MCP: `.cursor/mcp.json` configures the Firebase server (`--only hosting`, scoped to `apps/rxjs.dev`). Each developer runs `firebase login` once; project ID lives in gitignored `.firebaserc.local`.

## Human docs

- [CONTRIBUTING.md](CONTRIBUTING.md) — PR flow, style, commits, test requirements
- [marble-testing.md](apps/rxjs.dev/content/guide/testing/marble-testing.md) — marble test authoring
- [operators.md](apps/rxjs.dev/content/guide/operators.md) — operator catalog and custom operators
- [apps/rxjs.dev/README.md](apps/rxjs.dev/README.md) — docs site development

## Commands

| Goal                                     | Command                                                                                                                |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Quick CI-style check (excludes docs app) | `yarn nx run-many -t build lint test --exclude=rxjs.dev`                                                               |
| Full package check (excludes docs app)   | `yarn prepare-packages`                                                                                                |
| RxJS unit tests                          | `yarn workspace rxjs test`                                                                                             |
| RxJS tests (CI Node 20 parity)           | `cd packages/rxjs && node --expose-gc ./node_modules/.bin/mocha --config spec/support/.mocharc.js "spec/**/*-spec.ts"` |
| RxJS type tests                          | `yarn workspace rxjs dtslint`                                                                                          |
| `@rxjs/observable` tests                 | `yarn nx test @rxjs/observable`                                                                                        |
| Regenerate API docs                      | `yarn workspace rxjs.dev docs`                                                                                         |
| Docs site dev server                     | `yarn workspace rxjs.dev start`                                                                                        |
| Release (version bump + GitHub release)  | `yarn release --dryRun=false`                                                                                          |
| Publish to local registry                | set `NPM_CONFIG_REGISTRY`, then `yarn release` (see skill)                                                             |

First-time setup: run `/rxjs-onboard`. Bug reports: `rxjs-github-issue` → `rxjs-repro-to-test` (test) or `rxjs-bug-fix` (full fix). Docs deploy: `/rxjs-firebase-docs`. Package release/publish: `/rxjs-publish`. Commits: conventional format in [CONTRIBUTING.md](CONTRIBUTING.md) (skill + hook + husky).
