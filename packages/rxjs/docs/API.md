# RxJS 9 API and import guide

RxJS 9 separates the platform Observable contract from RxJS capabilities.
Import the root for intentional core primitives and import each operator or
factory from its own subpath.

## Root exports

```ts
import { AsyncSubject, ColdObservable, ConnectableObservable, Subject, behaviorSubject, connectable, replaySubject } from 'rxjs';
```

The root also exports notifications and public errors, including
`Notification`, `TimeoutError`, `EmptyError`, `NotFoundError`,
`SequenceError`, and `ArgumentOutOfRangeError`. Advanced code can extend
`PerSubscriptionSubjectBase` when it needs observer-local setup without
claiming that a Subject is cold.

Importing `rxjs` conditionally initializes the platform Observable surface. It
does not install every RxJS operator.

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

RxJS 9 does not install `.pipe`, publish RxJS 7 pipeable operator functions,
or restore `OperatorFunction`.

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

Subscriptions accept `{ signal: AbortSignal }`. Operators own upstream work
through the downstream Subscriber lifecycle, and cancellation does not become
completion. Teardown functions and `subscriber.addTeardown()` participate in
the same platform lifecycle.

## Environment and distribution

The package requires Node 22.13+ and publishes ESM only. Node `require()` uses
the supported `require(esm)` bridge and resolves the same module files as
`import`. Current browser, Deno, Bun, and Webpack support does not select
runtime-specific code. See [release gates](RELEASE_GATES.md) for the exact
matrix and budgets.
