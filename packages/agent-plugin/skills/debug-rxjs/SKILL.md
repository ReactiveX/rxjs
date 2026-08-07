---
name: debug-rxjs
description: Diagnose a concrete RxJS 7 or RxJS 9 failure involving missing, duplicate, stale, or out-of-order values; unexpected cancellation; stuck completion; unhandled errors; retries; Subjects; sharing/replay; scheduler or host timing; custom operators; synchronous side effects, reentrancy, and feedback machines; teardown; or leaks. Use for reproduction and root-cause analysis, not broad review or speculative optimization.
---

# Debug RxJS

Confirm the RxJS major, reproduce the smallest public failure, and build a
timeline before editing production code.

Record:

1. observer subscription and source producer activation;
2. every outer/inner/notifier/recovery subscription;
3. each `next`, `error`, and `complete`;
4. cancellation/abort/unsubscribe and its owner;
5. resource teardown and restart; and
6. synchronous reentrant actions.

Read setup upstream and notifications downstream. Vary a synchronous source,
a delayed source, an overlapping second input, a second observer, and a later
restart; each separates a different class of bug.

```ts
// Useful debug event, not permanent noisy logging:
events.push({ at: now(), kind: 'inner-abort', requestId, reason });
```

Add one focused failing regression test at the public boundary before fixing
the cause. Do not “fix” a timing bug by adding a delay unless delayed semantics
are the actual requirement.

## Load references by symptom

- Use [reproduction and timeline](references/reproduction-and-timeline.md) to
  reduce the failure and instrument lifecycle.
- Use [missing, duplicate, and stale values](references/missing-duplicate-and-stale-values.md)
  for filtering, combination readiness, sharing, replay, and producer count.
- Use [higher-order, errors, and completion](references/higher-order-errors-and-completion.md)
  for cancellation/queue/drop, recovery scope, retry, and stuck streams.
- Use [Subjects, sharing, and reentrancy](references/subjects-sharing-and-reentrancy.md)
  for feedback, late observers, reset, and retained state.
- Use [cancellation and teardown](references/cancellation-and-teardown.md) for
  partial cancellation, resource leaks, and terminal order.
- Use [version-specific fault lines](references/version-specific-fault-lines.md)
  to keep RxJS 7 and RxJS 9 diagnostic models separate.
- Use [debugging examples](references/debugging-examples.md) for symptom-to-
  hypothesis experiments.

Hand the proven fix to the matching authoring skill and its regression test to
the matching testing skill.
