---
name: write-rxjs-9
description: Write or refactor production RxJS 9 code with platform methods first, exact imported Symbol extensions when needed, explicit shared-versus-producer-per-subscription lifecycles, AbortSignal ownership, bounded concurrency and retry, intentional Subjects, deterministic resource teardown, and public custom operators. Use for RxJS 9 implementation work; do not apply RxJS 7 pipeable, Subscription, scheduler, or arbitrary-subscribable assumptions.
---

# Write RxJS 9

Target RxJS `9.0.0-beta.1`. State the producer, values, lifetime owner,
concurrency policy, error/completion meaning, and cancellation boundary before
composing a stream.

Prefer platform methods whenever their contract fits. They require no RxJS
operator extension import and let browser-native implementations provide the
operation without adding those extension bytes to a bundle:

```ts
import { debounce } from 'rxjs/debounce';
import { distinctUntilChanged } from 'rxjs/distinct-until-changed';
const results = searchTerms[debounce](200)
  [distinctUntilChanged]()
  .switchMap((term) => api.search(term));
```

Avoid RxJS 7 syntax and accidental platform-method substitution:

```ts
// Bad: RxJS 9 does not expose the RxJS 7 pipeable-operator contract.
const results = searchTerms.pipe(debounceTime(200), switchMap(search));
```

Use this workflow:

1. Choose the source lifecycle. A platform Observable shares one active
   producer; `ColdObservable` creates a producer for every direct subscription.
2. Use a platform string method first when its semantics fit. Import an exact
   Symbol when the platform lacks the capability, the RxJS contract differs,
   or a `ColdObservable` result must retain producer-per-subscription lifecycle.
3. Start with sequential platform `.flatMap()` because it preserves every
   operation and is easiest to reason about. Choose `[mergeMap]`,
   `[exhaustMap]`, or `.switchMap()` only for explicit parallelization, action
   locking, or cancellation/switching requirements.
4. Put recovery at the scope that can recover. Bound retry and Promise
   consumption so work can settle.
5. Give each terminal subscription an `AbortSignal` owned by its component,
   request, service, job, or test. Register producer cleanup with
   `subscriber.addTeardown()`.
6. Keep Subject writes private. Make retained state, replay, reset, and
   late-observer behavior explicit.
7. Prefer existing platform methods, public capabilities, or reusable transformations. Define a
   new exact Symbol only when a public fluent operator is the intended API.

## Load references by task

- Start with [fundamentals and lifecycle](references/fundamentals-and-lifecycle.md)
  for platform activation, `ColdObservable`, Symbols, inputs, and terminal
  behavior.
- Read [common patterns](references/common-patterns.md) for production recipes
  with concrete code.
- Read [operator concurrency](references/operator-concurrency.md) before
  flattening or coordinating asynchronous work.
- Read [errors, completion, and Promise consumers](references/errors-completion-and-promises.md)
  for recovery, retry, termination, and `first()`/`last()` boundaries.
- Read [sharing, Subjects, and state](references/sharing-subjects-state.md) for
  active-producer sharing, replay limitations, hot state, and reset policy.
- Read [cancellation and resource ownership](references/cancellation-and-resource-ownership.md)
  for signals, custom producers, listeners, timers, sockets, and teardown
  order.
- Read [custom operators](references/custom-operators.md) before publishing a
  domain transformation or exact Symbol extension.
- Use [good and bad examples](references/good-and-bad.md) during implementation
  and refactoring review.
- Consult the [generated API surface](references/api-surface.md) only to verify
  a public import path; it is not a recommendation catalog.

Hand tests to `write-rxjs-9-tests` and broad critique to `review-rxjs-9`.
