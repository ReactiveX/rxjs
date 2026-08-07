---
name: design-rxjs-library-apis
description: Design public library APIs that expose or consume RxJS 7 or RxJS 9 Observables with explicit ownership, lifecycle, cancellation, errors, typing, interop, version support, and testing contracts. Use for API design, not ordinary pipeline implementation.
---

# Design RxJS Library APIs

Declare the supported RxJS major or version range before choosing types.

- Specify who creates the producer, whether concurrent consumers share it,
  when work restarts, and who cancels it.
- Separate event/value APIs from control/write APIs. Avoid exposing mutable
  Subjects as a public convenience.
- State error and completion meaning, replay/current-state behavior, and
  whether late subscribers receive anything.
- In RxJS 7, design around `Subscription`, `ObservableInput`, pipeable
  operators, and its producer-per-subscription baseline.
- In RxJS 9, design around the platform Observable, exact Symbols,
  AbortSignal, platform input conversion, and explicit `ColdObservable` when
  needed.
- Do not publish one ambiguous type contract that pretends both majors have
  identical subscription or input semantics.
- Provide public declaration tests, consumer examples, lifecycle tests, and
  package-path tests.

Read the [API design checklist](references/api-design-checklist.md).
