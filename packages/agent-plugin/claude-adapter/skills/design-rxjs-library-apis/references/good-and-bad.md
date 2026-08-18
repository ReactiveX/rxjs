# Good and bad public API shapes

## Expose capability, not mutation

```ts
// Good
declare function createQueue(): readonly [enqueue: (job: Job) => void, results: Observable<Result>];

// Bad: callers can inject, error, or complete shared internals.
declare const jobs: Subject<Job>;
```

## Make cancellation ownership true

```ts
// Good RxJS 9 boundary
declare function watch(options: { signal: AbortSignal }): Observable<Event>;

// Bad: accepts a signal but the internal socket outlives it.
declare function watch(options?: { signal?: AbortSignal }): Observable<Event>;
```

## Avoid ambiguous dual-major contracts

```ts
// Good: import path selects the contract.
import { connect } from 'library/rxjs9';

// Bad: return type hides whether subscribe returns Subscription or undefined.
declare function connect(): any;
```

## Prefer platform methods in RxJS 9

```ts
// Good when platform semantics and lifecycle fit.
const labels = values.map(toLabel);

// Needlessly adds an extension module in that same scenario.
const labels = values[map](toLabel);
```

The Symbol form becomes good when its contract differs or a `ColdObservable`
result must remain cold. API review should state that reason.
