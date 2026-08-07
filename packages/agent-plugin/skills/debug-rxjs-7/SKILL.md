---
name: debug-rxjs-7
description: Diagnose a concrete RxJS 7 failure involving missing, duplicate, stale, or out-of-order values; unexpected cancellation; stuck completion; common RxJS errors; confusing call stacks; retries; Subjects; sharing/replay; schedulers; custom operators; synchronous side effects; reentrancy; teardown; or leaks. Use for RxJS 7 reproduction and root-cause analysis, not broad review, migration, or speculative optimization.
---

# Debug RxJS 7

Confirm that the failing runtime is RxJS 7, preserve its cold/shared source
contract, and reconstruct the event timeline before changing production code.
A call stack is one synchronous slice; it is not the history of a concurrent
reactive system.

1. Reproduce the smallest failure through the public consumer.
2. Label each subscription, source activation, outer/inner stream, and owned
   resource.
3. Record `next`, `error`, `complete`, explicit `unsubscribe`, finalization,
   retry, and reentrant input in sequence.
4. Read setup from consumer toward source and synchronous notifications from
   source toward consumer.
5. Use a stack to identify the current phase and first user-owned frame; use
   the timeline to explain ordering across asynchronous boundaries.
6. Prove the cause with one changed variable, then add a failing regression at
   the public boundary.

Temporary `tap` probes are usually more useful than stepping through
concurrent work because they let the interleaving happen. Keep them lightweight:
logging itself takes time and can hide or create a timing-sensitive symptom.
Reproduce again after removing every diagnostic probe.

## Load references by symptom

- Use [timeline and concurrency](references/timeline-and-concurrency.md) to
  reduce the failure and choose logging versus breakpoints.
- Use [temporary tap instrumentation](references/temporary-tap-instrumentation.md)
  to place lifecycle probes and remove them safely.
- Use [call stacks and error signatures](references/call-stacks-and-error-signatures.md)
  to classify common RxJS 7 frames and errors.
- Use [subscriptions, cancellation, and teardown](references/subscriptions-cancellation-and-teardown.md)
  for partial cancellation, resource leaks, and ownership.
- Use [higher-order, errors, and completion](references/higher-order-errors-and-completion.md)
  for queue/parallel/drop/switch behavior, recovery, retry, and stuck streams.
- Use [Subjects, sharing, and reentrancy](references/subjects-sharing-and-reentrancy.md)
  for producer counts, late observers, feedback, and retained state.
- Use [symptom experiments](references/symptom-experiments.md) for focused
  hypothesis tests.

Hand the proven fix to `write-rxjs-7` and its regression to
`write-rxjs-7-tests`.
