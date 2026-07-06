---
name: rxjs-repro-to-test
description: >-
  Turn a bug report or repro description into a failing RxJS marble test.
  Use when QA or a developer describes unexpected operator behavior, provides
  a repro scenario, or asks what tests should cover a reported bug.
---

# RxJS Repro to Test

Converts a **plain-language bug report** into a **failing marble spec** engineers can pick up immediately. QA gets a direct interface; engineers get a regression test stub.

For full fixes (test + implementation), hand off to `rxjs-bug-fix` after the test fails.

## Input you need

Ask for (or infer from context):

1. **Which API** — operator, creation function, or subject behavior
2. **Source marble** — what the upstream observable does (or describe in words: "emits 1,2,3 then completes")
3. **Expected vs actual** — what should happen vs what the reporter saw
4. **Timing** — sync vs async; scheduler matters for marble tests
5. **Delay form** — numeric milliseconds vs `Date` (affects `timer` / `delay`)

## Scheduler triage (timing bugs)

Classify before writing the test:

| Symptom                                  | Likely layer                       | Spec file                              | Scheduler in test                                 |
| ---------------------------------------- | ---------------------------------- | -------------------------------------- | ------------------------------------------------- |
| Wrong order / virtual timing             | Operator                           | `spec/operators/<name>-spec.ts`        | `TestScheduler` (default)                         |
| `timer` / `delay` / `interval` wrong     | Creation + schedulers              | `spec/observables/`, `spec/operators/` | Often **`asyncScheduler`**                        |
| Fires immediately / never for huge delay | `AsyncAction` / `setTimeout` limit | `timer-spec`, `delay-spec`             | **`asyncScheduler`** inside `TestScheduler.run()` |
| Virtual-time only                        | N/A                                | Marble with `rxTest`                   | Do **not** expect real timer limits               |

### `setTimeout` maximum (~24.8 days)

- Platform max delay: `2^31 - 1` ms (`2147483647`)
- Delays above that can fire immediately in browsers/Node unless the library throws or chunks
- Public API notes this on `timer` JSDoc (“Known limitations”)
- Implementation belongs in `internal/scheduler/AsyncAction.ts` (and `util/maxTimerDelay.ts` when used), not only in operators

## Workflow

1. **Locate the spec file**

   - Operators → `packages/rxjs/spec/operators/<name>-spec.ts`
   - Creation → `spec/observables/<name>-spec.ts`
   - Read existing tests; add a new `it(...)` block, do not duplicate canonical cases already covered

2. **Write a failing test first**

   - Name the test after the bug: `it('should not drop values when ...', ...)`
   - Use `TestScheduler.run()` — see `rxjs-marble-tests` rule
   - Assert subscriptions when the source has a meaningful subscription log
   - The test **must fail** against current behavior if the bug is real — add an explicit assertion (marble `#`, call count, or `expect(...).to.throw`) so the test cannot pass vacuously

3. **Minimal reproduction**

   - Prefer the smallest cold/hot marble that reproduces the issue
   - Avoid unrelated operators in the pipe unless required for the bug

4. **Hand off to engineering**
   - Report: spec file path, test name, and one-line summary of expected fix
   - Suggest running: `yarn workspace rxjs test -- --grep '<test name fragment>'`
   - If the fix touches schedulers/util: note that `yarn workspace rxjs build` may be needed when specs resolve `dist/` (see `rxjs-mocha-specs`)

## Marble patterns

### Sync error (e.g. oversize delay)

Use `asyncScheduler` explicitly. Virtual `TestScheduler` alone does not hit real timer limits.

```typescript
const MAX_TIMER_DELAY = 2147483647;

testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
  const e1 = cold('(a|)');
  const e1subs = '(^!)';
  const delayMs = MAX_TIMER_DELAY + 1;
  const error = new RangeError(`Cannot schedule a delay longer than ${MAX_TIMER_DELAY}ms (2^31 - 1). Received ${delayMs}ms.`);

  expectObservable(e1.pipe(delay(delayMs, asyncScheduler))).toBe('#', null, error);
  expectSubscriptions(e1.subscriptions).toBe(e1subs);
});
```

Mirror coverage in `spec/observables/timer-spec.ts` when the bug involves `timer` directly.

For `Date` delays with `asyncScheduler`, compute the date from `asyncScheduler.now()` inside `run()` so `due = +date - now()` stays stable.

## Plain-language summary for QA

After writing the test, give QA a short summary:

- What the test proves
- What marble diagram represents (source → operator → output)
- Whether the test currently **fails** (confirms the bug) or **passes** (may be a misunderstanding)

## Do not

- Fix the operator implementation in the same step unless the user explicitly asks — default is test-first; use `rxjs-bug-fix` for implementation
- Use Vitest patterns — RxJS package tests are Mocha + marbles
- Skip `expectSubscriptions` when early disposal or inner subscriptions are part of the bug
- Import from `rxjs/internal/*` in specs — resolves to **stale `dist/`**; use `import { … } from 'rxjs'` or `../../src/...`
- Use `sinon.useFakeTimers().tick(MAX_TIMER_DELAY)` — numeric overflow / hang
- Rely on `subscribe()` throwing for observable errors — prefer marble `#` or an `error` callback; see `rxjs-mocha-specs`

## Reference

- [marble-testing.md](../../apps/rxjs.dev/content/guide/testing/marble-testing.md)
- `rxjs-marble-tests` rule — required cases and assertion patterns
- `rxjs-bug-fix` — implementation workflow after the test fails
- `rxjs-github-issue` — issue URL / number intake
