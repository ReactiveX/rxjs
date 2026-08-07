# RxJS 9 target authoring rules

A migration is not complete merely because candidate source parses or type-
checks. The target must be idiomatic, reviewable RxJS 9 code.

## Required target shape

- Import each operator/factory Symbol from its exact public subpath.
- Invoke exact Symbol keys; do not patch string methods or manufacture a same-
  description Symbol.
- Select platform Observable or `ColdObservable` deliberately.
- Use the public `[create]` protocol in low-level custom operators so result
  lifecycle follows the receiver.
- Own terminal subscriptions with AbortSignals; do not capture a returned
  Subscription.
- Register producer cleanup with `subscriber.addTeardown()`.
- Use only platform ObservableValue inputs or explicit adapters.
- State concurrency limits, queue/drop policy, recovery scope, retry bounds,
  replay/reset policy, and Promise settlement bounds.
- Keep Subject writes private unless public mutation is the API.
- Use domain-named transformations and intermediate Observables when a long
  Symbol chain hides policy.

## Mechanical output still needs semantic review

```ts
import { debounce } from 'rxjs/debounce';
import { switchMap } from 'rxjs/switch-map';

const result = source[debounce](200)[switchMap](load);
```

Review whether `source` now shares one active producer, whether `load` accepts
cancellation, whether replacement is correct, and where request errors should
be recovered. Correct imports do not answer those questions.

## Prefer transformations for domain policy

```ts
import { filter } from 'rxjs/filter';
import { map } from 'rxjs/map';
import { pipe } from 'rxjs/pipe';

const accepted = () => (source: Observable<Event>) => source[filter]((event) => event.accepted);

const toPayload = () => (source: Observable<Event>) => source[map]((event) => event.payload);

const payloads = events[pipe](accepted(), toPayload());
```

Do not recreate RxJS 7 `OperatorFunction` types or string `.pipe`. Define an
external exact Symbol only when a fluent public operator is the intended API.

## Review against the authoring skill

Before accepting a migration unit, apply the `write-rxjs-9` rules for
lifecycle, common patterns, concurrency, errors, sharing/state, resources, and
custom operators. Then apply `review-rxjs-9` to the final diff. The migration
engine proves only its candidate transformation, not production quality.
