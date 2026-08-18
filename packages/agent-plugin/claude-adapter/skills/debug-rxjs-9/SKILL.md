---
name: debug-rxjs-9
description: Diagnose a concrete RxJS 9 failure involving platform Observable or ColdObservable lifecycle, missing, duplicate, stale, or out-of-order values; AbortSignal cancellation; exact operator Symbols; common errors; confusing call stacks; stuck completion; Subjects; sharing; custom operators; synchronous side effects; reentrancy; teardown; or leaks. Use for RxJS 9 reproduction and root-cause analysis, not broad review, migration, or speculative optimization.
---

# Debug RxJS 9

Confirm the exact RxJS 9 runtime and constructor first: native or fallback
platform `Observable`, `ColdObservable`, or a Subject. Preserve that lifecycle
in the reproduction. A call stack shows one synchronous slice, not the history
of a concurrent reactive system.

1. Reproduce the smallest failure through the public consumer.
2. Label each observer, producer activation, outer/inner stream, AbortSignal,
   and owned resource.
3. Record `next`, `error`, `complete`, abort with reason, teardown, restart,
   retry, and reentrant input in sequence.
4. Separate platform string methods from exact imported RxJS Symbol methods.
5. Use a stack to identify the current phase and first user-owned frame; use
   the timeline to explain ordering across tasks and shared observers.
6. Prove the cause with one changed variable, then add a failing regression at
   the public boundary.

Temporary platform `.inspect()` or RxJS `[tap]` probes are usually more useful
than stepping through concurrent work because they let the interleaving happen.
Keep them lightweight: logging itself takes time and can hide or create a
timing-sensitive symptom. Reproduce again after removing every probe.

## Load references by symptom

- Use [timeline and concurrency](references/timeline-and-concurrency.md) to
  reduce the failure and choose logging versus breakpoints.
- Use [temporary inspect and tap instrumentation](references/temporary-inspect-and-tap-instrumentation.md)
  to place lifecycle probes without crossing the source model.
- Use [call stacks and error signatures](references/call-stacks-and-error-signatures.md)
  to classify platform, fallback, and RxJS 9 failures.
- Use [AbortSignal, cancellation, and teardown](references/abort-cancellation-and-teardown.md)
  for partial cancellation, resource leaks, and ownership.
- Use [higher-order, errors, and completion](references/higher-order-errors-and-completion.md)
  for sequential/parallel/drop/switch behavior, recovery, and stuck streams.
- Use [Subjects, sharing, and reentrancy](references/subjects-sharing-and-reentrancy.md)
  for active-producer sharing, late observers, feedback, and retained state.
- Use [symptom experiments](references/symptom-experiments.md) for focused
  hypothesis tests.

Hand the proven fix to `write-rxjs-9` and its regression to
`write-rxjs-9-tests`.
