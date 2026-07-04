---
name: rxjs-bug-fix
description: >-
  Fix reported RxJS operator, scheduler, or observable bugs end-to-end: triage,
  failing marble test, implementation, JSDoc, and verification. Use when fixing
  a GitHub issue, regression, or unexpected timer/scheduler behavior.
---

# RxJS Bug Fix

End-to-end workflow for **reported bugs** in `packages/rxjs`. Complements `rxjs-repro-to-test` (test-only) and `rxjs-github-issue` (issue triage).

## Before you write code

1. **Triage the issue** — run `rxjs-github-issue` steps or `gh issue view <n> --repo ReactiveX/rxjs`
2. **Classify timing** — see scheduler triage in `rxjs-repro-to-test` (virtual time vs real `asyncScheduler`)
3. **Write or confirm a failing test** — marble first; see `rxjs-marble-tests` and `rxjs-repro-to-test`
4. **Trace the call chain** before picking a fix location:

   | User API                        | Typical chain                                                                             |
   | ------------------------------- | ----------------------------------------------------------------------------------------- |
   | `delay` / `delayWhen`           | operator → `timer` → `executeSchedule` → `AsyncScheduler` → `AsyncAction` → `setInterval` |
   | `timer` / `interval`            | creation → scheduler → `AsyncAction`                                                      |
   | `debounceTime`, `bufferTime`, … | operator → `executeSchedule` → scheduler                                                  |

   Real `setTimeout` / `setInterval` limits are enforced in **`AsyncAction.schedule`** (via `maxTimerDelay.ts` when present), not only in operators.

## Fix-style decision

| Approach               | When                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| **Throw `RangeError`** | Invalid input; silent wrong behavior is worse than failing fast   |
| **Chunk / reschedule** | API contract requires delays beyond platform limits to still work |
| **Document only**      | WONTFIX; user must precompute or use a different scheduler        |

Discuss with the reporter when the issue comment already identifies root cause (e.g. `setTimeout` max ≈ 24.8 days).

## Implementation checklist

1. **Minimal fix** at the lowest shared layer (prefer scheduler/util over duplicating per operator)
2. **JSDoc** — update “Known limitations” on public APIs (`timer`, operators that delegate to it)
3. **Marble tests** — `spec/operators/<name>-spec.ts` and/or `spec/observables/<name>-spec.ts`
4. **Build** — `yarn workspace rxjs build` when debugging tests that resolve `rxjs/internal/*` to `dist/`
5. **Verify**

   ```sh
   yarn workspace rxjs test -- --grep '<fragment>'
   yarn nx run-many -t build lint test --exclude=rxjs.dev
   ```

## Do not

- Fix implementation in the same step as `rxjs-repro-to-test` unless the user asked for a full fix
- Use Vitest in `packages/rxjs` — Mocha + marbles only
- Import `rxjs/internal/*` in specs — use `rxjs` or `../../src/...` (see `rxjs-mocha-specs`)
- Tick fake timers by `2147483647` ms (`2^31 - 1`) — overflows / hangs

## Reference

- `rxjs-repro-to-test` — failing marble from a repro
- `rxjs-github-issue` — GitHub issue intake
- `rxjs-core-internals` — schedulers, creation functions, util layout
- `rxjs-conventional-commits` — commit message format
