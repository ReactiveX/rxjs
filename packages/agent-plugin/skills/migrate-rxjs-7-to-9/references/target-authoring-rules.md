# RxJS 9 target authoring rules

A migration is not complete merely because candidate source parses or type-
checks. The target must be idiomatic, reviewable RxJS 9 code.

## Required target shape

- Default ordinary migrated RxJS 7 producers and derived results to
  `ColdObservable` plus exact Symbols. Promote a reviewed unit to the platform
  lifecycle only after sharing or single-subscriber evidence.
- After platform promotion, prefer a platform string method whenever its
  behavior fits. This avoids unnecessary extension imports and browser bundle
  bytes.
- Import each required operator/factory Symbol from its exact public subpath;
  do not manufacture a same-description Symbol or patch string methods.
- Treat `ColdObservable` as the conservative selection; record the evidence
  for every platform selection.
- Use the public `[create]` protocol in low-level custom operators so result
  lifecycle follows the receiver.
- Own terminal subscriptions with AbortSignals; do not capture a returned
  Subscription.
- Register producer cleanup with `subscriber.addTeardown()`.
- Use only platform ObservableValue inputs or explicit adapters.
- State concurrency limits, queue/drop policy, recovery scope, retry bounds,
  replay/reset policy, and Promise settlement bounds.
- Keep Subject writes private unless public mutation is the API.
- Preserve a sound controller shape: either a class with public command
  methods/read-only Observables or a closure-backed factory returning a
  readonly `[command, observable]` tuple.
- Use domain-named transformations and intermediate Observables when a long
  Symbol chain hides policy.

## Mechanical output still needs semantic review

```ts
import { debounce } from 'rxjs/debounce';
import { switchMap } from 'rxjs/switch-map';
const result = source[debounce](200)[switchMap](load);
```

Review whether `source` remains producer-per-direct-subscription, whether
`load` accepts cancellation, whether replacement is correct, and where request
errors should be recovered. If the unit is later platform-promoted, re-review
the chain before replacing exact Symbols with native methods.

## Prefer transformations for domain policy

```ts
import { pipe } from 'rxjs/pipe';

const accepted = () => (source: Observable<Event>) => source.filter((event) => event.accepted);

const toPayload = () => (source: Observable<Event>) => source.map((event) => event.payload);

const payloads = events[pipe](accepted(), toPayload());
```

Do not recreate RxJS 7 `OperatorFunction` types or string `.pipe`. Define an
external exact Symbol only when a fluent public operator is the intended API.

## Review against the authoring skill

Before accepting a migration unit, apply the `write-rxjs-9` rules for
lifecycle, common patterns, concurrency, errors, sharing/state, resources, and
custom operators. Then apply `review-rxjs-9` to the final diff. The migration
engine proves only its candidate transformation, not production quality.

Do not convert a functional tuple controller into a class, or a class into a
factory, as incidental migration cleanup. Both are valid. A class can share
prototype methods and may reduce per-instance function allocation; a factory
can be more compact and composable. Change the public shape only with caller
evidence and review.
