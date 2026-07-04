---
name: rxjs-onboard
description: >-
  Onboard a new engineer to the RxJS monorepo — verify Node/Yarn versions,
  install dependencies, validate the Nx workspace, and run smoke build/tests.
  Use when the user asks to onboard, set up the dev environment, get started,
  or run first-time repo setup.
disable-model-invocation: true
---

# RxJS Onboard

One-shot environment setup for the RxJS 8 monorepo. Invoked explicitly via `/rxjs-onboard`.

Passive context already lives in [AGENTS.md](../../../AGENTS.md) and `.cursor/rules/` — do not repeat operator or marble-test guidance here.

## Workflow

1. **Confirm repo root** — must contain `packages/rxjs`, `packages/observable`, and `apps/rxjs.dev`.
2. **Run preflight** from repo root (auto-fixes Node/Yarn when possible):

   ```sh
   .cursor/skills/rxjs-onboard/scripts/smoke-check.sh
   ```

   Use `--check-only` to verify without attempting installs. Auto-fix may need **network** permission (fnm/nvm downloads, `brew install`, `yarn install`).

3. **Report results** — plain-language summary: what passed, what was auto-installed, what still failed.
   On failure, re-run the failing command **without** output suppression so you can explain the error.
4. **On success** — point the engineer to:
   - [AGENTS.md](../../../AGENTS.md) for commands and rule map
   - [CONTRIBUTING.md](../../../CONTRIBUTING.md) for PR and commit conventions
   - `yarn workspace rxjs.dev start` if they want the docs site locally

## Toolchain auto-fix

The script attempts fixes before failing:

| Tool     | Strategy                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| **Node** | Switch/install Node 20 via fnm → nvm → volta → `brew install node@20` (macOS)                                     |
| **Yarn** | Use repo-bundled `.yarn/releases/yarn-1.22.21.cjs` (no global Yarn required); corepack fallback if bundle missing |

Global Yarn 1.22.21 is **not** required when the repo bundle exists.

If no version manager is installed and auto-fix fails, tell the engineer to install **fnm** or **nvm**, then re-run `/rxjs-onboard`.

## Interpreting failures

| Failure                            | Likely fix                                                                                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node still wrong/missing           | Install fnm (`brew install fnm`) or nvm, open a new shell, re-run onboard                                                                                             |
| Repo Yarn bundle missing           | `git checkout .yarn/releases/` or `corepack enable && corepack prepare yarn@1.22.21 --activate`                                                                       |
| yarn install                       | Delete `node_modules`, retry. **Never use npm**                                                                                                                       |
| nx show projects                   | `yarn nx reset` if daemon errors; ensure install completed                                                                                                            |
| @rxjs/observable test/build        | Read full error output; often stale `node_modules` or wrong Node                                                                                                      |
| Local tests pass, CI Node 20 fails | See `rxjs-mocha-specs` — GC leak tests need `global.gc` (CI Node 20 only). Re-run with `node --expose-gc` or `yarn nx run-many -t build lint test --exclude=rxjs.dev` |
| Nx build/test appears stuck        | Sandbox blocks Nx daemon; re-run with full permissions or `yarn nx reset`                                                                                             |

Re-run the script after fixes until it passes.

## CI parity (before opening a PR)

`yarn workspace rxjs test` can be green locally while CI Node 20 fails: two GC leak specs only run when `global.gc` is exposed (see `rxjs-mocha-specs` rule). Optional check:

```sh
cd packages/rxjs
node --expose-gc ./node_modules/.bin/mocha --config spec/support/.mocharc.js "spec/**/*-spec.ts"
```

Full pipeline match: `yarn nx run-many -t build lint test --exclude=rxjs.dev`

## Optional deeper verification

Only if the user asks or preflight passed and they want more confidence:

```sh
yarn nx run-many -t build lint test --exclude=rxjs.dev
```

See [AGENTS.md](../../../AGENTS.md) command matrix.

## Do not

- Run `npm install`
- Duplicate onboarding content into AGENTS.md or rules
- Start implementing features — complete onboard first, then CONTRIBUTING.md
