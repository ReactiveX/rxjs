# RxJS 9 API and import guide

RxJS 9 separates the platform Observable contract from RxJS capabilities.
This branch also contains a review-gated pipeable pilot at the root; the
existing Symbol catalog remains available from its current subpaths.

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

Importing `rxjs` conditionally initializes the platform Observable surface. It
does not install every Symbol operator. The experimental `map`, `filter`,
`take`, and `toArray` root exports are ordinary pipeable functions and do not
patch operator keys. The experimental `subscribe` export is a terminal
composition function.

## Pipeable pilot

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

The pilot exposes additive deep imports at `rxjs/rx`, `rxjs/to-array`, and
`rxjs/subscribe`. Operators whose ordinary subpaths still name exact Symbols
are also available under `rxjs/pipeable/map`, `rxjs/pipeable/filter`, and
`rxjs/pipeable/take`. Matching additive Symbol aliases exist at
`rxjs/symbol/map`, `rxjs/symbol/filter`, and `rxjs/symbol/take`; the established
Symbol subpaths remain unchanged while the final layout is under review.

## Symbol operators

```ts
import 'rxjs';
import { filter } from 'rxjs/filter';
import { map } from 'rxjs/map';
import { switchMap } from 'rxjs/switch-map';

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

Factories such as `timer` are static Symbols:

```ts
import { timer } from 'rxjs/timer';

Observable[timer](1000).subscribe(console.log);
```

The `pipe` Symbol supports instance and static composition:

```ts
import { map } from 'rxjs/map';
import { pipe } from 'rxjs/pipe';

const doubled = source[pipe]((values) => values[map]((value) => value * 2));
const normalized = Observable[pipe]([1, 2], (values) => values[map](String));
```

The existing Symbol form does not install `.pipe`. The review-gated root pilot
does publish `rx`, three pipeable source operators, Observable-returning
`toArray`, a lite `subscribe` terminal, and `OperatorFunction`; it does not yet
convert the full catalog.

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
