---
name: write-rxjs-7
description: Write or refactor production RxJS 7.8.x code with pipeable operators, explicit subscription ownership, deliberate higher-order concurrency, bounded retries, safe sharing, private Subjects, deterministic teardown, readable pipelines, and public custom operators. Use for implementation work that must remain on RxJS 7; do not use RxJS 9 platform Observable or Symbol APIs.
---

# Write RxJS 7

Pin guidance to RxJS `7.8.2`. State the producer, values, lifetime owner,
concurrency policy, error/completion meaning, and teardown before composing the
pipeline.

Prefer declarative ownership:

```ts
const results$ = searchTerms$.pipe(
  debounceTime(200),
  distinctUntilChanged(),
  switchMap((term) => api.search(term))
);
```

Avoid detached nested subscriptions:

```ts
// Bad: the inner work has a separate lifetime and error boundary.
searchTerms$.subscribe((term) => {
  api.search(term).subscribe(renderResults);
});
```

Use this workflow:

1. Model the source and its owner. RxJS 7 Observables are producer-per-direct-
   subscription by default; sharing is an explicit operator policy.
2. Start with sequential `concatMap` because it preserves every operation and
   is easiest to reason about. Choose `mergeMap`, `exhaustMap`, or `switchMap`
   only when the requirement explicitly calls for parallelization, an action
   lock, or cancellation/switching.
3. Place error recovery at the scope that may recover. Bound retry and promise
   conversion so the operation can settle.
4. Keep Subjects private unless public writes are the API. Make replay,
   retention, ref-counting, and reset policy visible.
5. Attach every terminal subscription and every child resource to a lifetime
   owner. Treat teardown as behavior and test it.
6. Prefer existing public creation functions and operators. Write a custom
   Observable or operator only for a real producer or reusable domain policy.
7. Name streams and extracted policies for the domain. Comments explain why a
   lifecycle or concurrency decision exists, not what an operator is called.

## Load references by task

- Start with [fundamentals and lifecycle](references/fundamentals-and-lifecycle.md)
  for source, notification, subscription-tree, hot/cold, and error semantics.
- Read [common patterns](references/common-patterns.md) for production recipes
  with good/bad examples.
- Read [operator concurrency](references/operator-concurrency.md) before using
  `switchMap`, `concatMap`, `mergeMap`, or `exhaustMap`.
- Read [errors, retry, and completion](references/errors-retry-completion.md)
  when failures, recovery, resubscription, joins, or Promise conversion matter.
- Read [sharing, Subjects, and state](references/sharing-subjects-state.md) for
  multicasting, replay, caching, event ingress, and public state boundaries.
- Read [teardown and resource ownership](references/teardown-resource-ownership.md)
  for components, services, timers, listeners, sockets, and custom sources.
- Read [custom operators](references/custom-operators.md) before authoring or
  changing a public operator.
- Use [good and bad examples](references/good-and-bad.md) during implementation
  or refactoring review.

Hand tests to `write-rxjs-7-tests` and broad critique to `review-rxjs-7`.
