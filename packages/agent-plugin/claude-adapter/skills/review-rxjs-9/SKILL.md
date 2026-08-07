---
name: review-rxjs-9
description: Review RxJS 9 code for platform-method-first authoring, web-platform active-producer lifecycle, intentional ColdObservable boundaries, exact Symbol imports and collision isolation, AbortSignal ownership, input normalization, higher-order concurrency, terminal teardown, Subjects and replay, custom sources and operators, native/fallback safety, and lifecycle tests. Use only for code targeting RxJS 9.
---

# Review RxJS 9

Confirm the target is RxJS `9.0.0-beta.1`. Review the selected source lifecycle
and subscription ownership before operator style. Trace cancellation and
terminal behavior across every source, inner, notifier, and resource.

Prioritize:

1. platform Observables whose shared active producer contradicts caller
   expectations, or unnecessary `ColdObservable` work duplication;
2. captured `subscribe()` return values or terminal subscriptions without an
   owner-supplied AbortSignal;
3. unnecessary Symbol extensions where a platform method fits, missing/wrong
   exact Symbol imports where one is required, string prototype patches, or
   lifecycle results that bypass public `[create]`;
4. concurrency, recovery, retry, completion, or input conversion that changes
   observable behavior;
5. cleanup registered incorrectly, late work after closure, or teardown order
   that fails under reentrancy;
6. exposed Subject writes, replay/reset misconceptions, and retained state;
7. tests that omit concurrent observers, final-observer cancellation,
   receiver lifecycle, or native/fallback differences.

Lead with narrow file/line findings, scenario, impact, evidence, smallest safe
correction, and missing regression test. Separate confirmed defects from
risks, design tradeoffs, and readability.

## Load references by review area

- Use [review workflow](references/review-workflow.md) for evidence and finding
  format.
- Use [platform lifecycle and exact Symbols](references/platform-lifecycle-and-symbols.md)
  for producer sharing, `ColdObservable`, imports, creation, and input limits.
- Use [cancellation, errors, and resources](references/cancellation-errors-and-resources.md)
  for signals, terminal ordering, teardown, and Promise consumers.
- Use [concurrency, sharing, and state](references/concurrency-sharing-and-state.md)
  for flattening, reset, replay, and Subjects.
- Use [custom sources and operators](references/custom-sources-and-operators.md)
  for public `[create]`, exact external Symbols, and callback forwarding.
- Use [review examples](references/review-examples.md) for concrete bad/good
  forms and actionable wording.
- Use [testing evidence](references/testing-evidence.md) for lifecycle proof.

Hand accepted fixes to `write-rxjs-9` and missing tests to
`write-rxjs-9-tests`.
