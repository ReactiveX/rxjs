# RxJS 9 API and import guide

RxJS 9 separates the platform Observable contract from RxJS capabilities.
This branch also contains a review-gated complete functional facade at the
root; the existing Symbol catalog remains available from its current subpaths
and the complete `rxjs/symbol` boundary.

## Root exports

```ts
import {
  AsyncSubject,
  ColdObservable,
  ConnectableObservable,
  Subject,
  behaviorSubject,
  connectable,
  filter,
  map,
  replaySubject,
  rx,
  subscribe,
  take,
  toArray,
} from 'rxjs';
```

The root also exports notifications and public errors, including
`Notification`, `TimeoutError`, `EmptyError`, `NotFoundError`,
`SequenceError`, and `ArgumentOutOfRangeError`. Advanced code can extend
`PerSubscriptionSubjectBase` when it needs observer-local setup without
claiming that a Subject is cold.

Importing `rxjs` conditionally initializes the platform Observable surface and
loads the implementation modules for the complete functional facade. Most of
those modules also install their exact Symbols; `map`, `filter`, and `take`
retain their separately reviewed function implementations. The experimental
`subscribe` export is a terminal composition function.

## Complete functional experiment

```ts
import { filter, map, rx } from 'rxjs';

const result = rx(
  [1, 2, 3, 4],
  filter((value) => value % 2 === 0),
  map((value) => value * 10)
);

result.subscribe(console.log); // 20, 40
```

Platform `toArray()` returns a Promise. The RxJS function intentionally stays
inside the Observable graph:

```ts
import { rx, subscribe, toArray } from 'rxjs';

const subscription = rx(
  [1, 2, 3],
  toArray(),
  subscribe((values) => console.log(values))
);

console.log(subscription.closed); // true after synchronous completion
```

The ambient platform declarations expose `ObservableInput`; the root exports
`UnaryFunction` and `OperatorFunction` as supporting types. Use
`OperatorFunction<T, T>` when an operator preserves its value type. See the
[all-pipeable experiment](PIPEABLE_EXPERIMENT.md) for the overload horizon,
checking-cost tradeoffs, and unresolved import layout.

The complete source-bound catalog is available from `rxjs/pipeable` and
per-capability paths such as `rxjs/pipeable/map` and
`rxjs/pipeable/merge-with`. Static functions are available from `rxjs/static`
and paths such as `rxjs/static/merge`. Exact Symbols are available from
`rxjs/symbol` and paths such as `rxjs/symbol/map`. Established Symbol subpaths
remain unchanged while the final ordinary-deep-import layout is under review.

## Symbol operators

```ts
import 'rxjs';
import { filter, map, switchMap } from 'rxjs/symbol';

const result = source[filter]((value) => value.active)[map]((value) => value.id);
```

Every public operator is a module-owned exact Symbol. Two independently
evaluated copies intentionally have different Symbol identities, allowing
version-skewed capabilities to coexist without overwriting one another.

When a platform string method has the same descriptive name, both forms
remain available:

```ts
observable.map(project); // platform contract
observable[map](project); // RxJS contract
```

The RxJS import never replaces the platform string method.

The public subpaths cover transformation, filtering, combination,
higher-order, timing, buffering/windowing, error recovery, sharing/connection,
query, and terminal capabilities. The complete authoritative list is the
[`exports` map](../package.json); migration status and behavioral evidence are
in the [generated ledger](MIGRATION_EVIDENCE_LEDGER.md).

## Factories and composition

Factories such as `timer` are ordinary root functions in the experiment and
remain static Symbols through the separate Symbol boundary:

```ts
import { timer } from 'rxjs';
import { timer as timerSymbol } from 'rxjs/symbol';

timer(1000).subscribe(console.log);
Observable[timerSymbol](1000).subscribe(console.log);
```

The root `pipe` function creates a reusable source-bound composition, while the
exact `pipe` Symbol retains instance and static composition:

```ts
import { map, pipe } from 'rxjs';
import { map as mapSymbol, pipe as pipeSymbol } from 'rxjs/symbol';

const double = pipe(map((value: number) => value * 2));
const doubled = double(source);
const normalized = Observable[pipeSymbol]([1, 2], (values) => values[mapSymbol](String));
```

Neither form installs `.pipe`. The review-gated root experiment publishes the
complete current source-bound catalog, static functions,
Observable-returning `toArray`, a lite `subscribe` terminal, and
`OperatorFunction`. Six dual capabilities use `*With` source-operator names;
the four async-iteration terminals retain exact `AsyncGenerator` results.

## Construction and input boundaries

Derived RxJS operators use the receiver's construction protocol. Compatible
subclasses can preserve their result constructor; `ColdObservable` selects its
producer-per-subscription result contract.

Inputs cross the active realm's platform `Observable.from` boundary. Arbitrary
objects with a `subscribe` method are not automatically accepted, and
transparent foreign-realm conversion is not claimed. Review the
[migration guide](../MIGRATION.md) before translating RxJS 7 inputs or
lifecycle assumptions.

## Cancellation and teardown

Platform subscriptions accept `{ signal: AbortSignal }`. Operators own upstream work
through the downstream Subscriber lifecycle, and cancellation does not become
completion. Teardown functions and `subscriber.addTeardown()` participate in
the same platform lifecycle.

The optional pipeable `subscribe(observer)` terminal returns a minimal
`Subscription` interface with `unsubscribe()` and a live `closed` getter. It is
backed by one AbortController and does not recreate RxJS 7's Subscription tree,
teardown aggregation, or `add`/`remove` methods.

## Environment and distribution

The package requires Node 22.13+ and publishes ESM only. Node `require()` uses
the supported `require(esm)` bridge and resolves the same module files as
`import`. Current browser, Deno, Bun, and Webpack support does not select
runtime-specific code. See [release gates](RELEASE_GATES.md) for the exact
matrix and budgets.
