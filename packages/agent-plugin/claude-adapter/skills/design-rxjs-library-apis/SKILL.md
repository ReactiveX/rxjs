---
name: design-rxjs-library-apis
description: Design public library APIs that expose or consume RxJS 7 or RxJS 9 Observables with explicit version boundaries, producer lifecycle, cancellation ownership, errors, inputs, typing, controller shape, custom operators, package exports, and consumer tests. Use for API design, not ordinary pipeline implementation.
---

# Design RxJS Library APIs

Declare the supported RxJS major and runtime contract before choosing public
types. A public `Observable<T>` is also a promise about producer creation,
sharing, cancellation, late consumers, errors, completion, and accepted input.

Use this workflow:

1. Choose a single-major contract, separate versioned entry points, or an
   explicit adapter boundary. Do not pretend RxJS 7 and RxJS 9 subscribe/input
   contracts are identical.
2. Specify producer lifecycle, consumer independence, restart, retained state,
   terminal behavior, and the owner that cancels work.
3. Separate read/value capabilities from commands. A class with shared
   prototype methods and a closure factory returning a readonly tuple are both
   sound controller shapes.
4. Define accepted inputs, error channels, completion meaning, queueing,
   parallelization, action locks, and switching behavior.
5. For RxJS 9, prefer platform methods when their contracts fit. Publish an
   exact Symbol extension only when fluent public syntax is truly part of the
   API; use a module-owned `Symbol()` by default.
6. Design package exports, peer dependencies, declarations, and runtime side
   effects together, then test from a packed external consumer.

## Load references by decision

- Use [version and package boundaries](references/version-and-package-boundaries.md)
  for majors, peers, entry points, and adapters.
- Use [lifecycle and cancellation](references/lifecycle-and-cancellation.md)
  for producer/consumer ownership and late subscribers.
- Use [values, inputs, errors, and concurrency](references/values-inputs-errors-and-concurrency.md)
  for protocol semantics.
- Use [controller API shapes](references/controller-api-shapes.md) for classes,
  readonly tuple factories, Subjects, and retained state.
- Use [RxJS 9 platform methods and extensions](references/rxjs-9-platform-methods-and-extensions.md)
  before exposing an operator or Symbol.
- Use [consumer testing and release checks](references/consumer-testing-and-release-checks.md)
  for declarations, packing, multi-copy behavior, and compatibility evidence.
- Use [good and bad API examples](references/good-and-bad.md) during design review.
