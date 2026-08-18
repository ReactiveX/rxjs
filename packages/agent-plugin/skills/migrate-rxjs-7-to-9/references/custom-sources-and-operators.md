# Custom sources and operators migration

Custom code carries hidden lifecycle assumptions and should never be migrated
as a textual wrapper change.

## Custom Observable checklist

For each `new Observable` or subclass, record:

- whether direct subscribers currently get independent producers;
- started resources and teardown order;
- synchronous setup/emission;
- child subscription ownership;
- error and completion behavior;
- `subscriber.closed` checks and late asynchronous work; and
- public subclass/constructor assumptions.

Default to `ColdObservable`, replace returned teardown with `addTeardown`, pass
signals to resources, use `subscriber.active`, and test concurrent observers
plus reentrancy. Promote to a platform Observable only after compatible
sharing or repository-wide single-subscriber evidence is recorded.

## Prefer public transformation composition

An RxJS 7 custom pipeable operator built from public operators should usually
become an ordinary RxJS 9 source-to-source transformation composed through the
exact `[pipe]` Symbol:

```ts
import { filter } from 'rxjs/filter';

const valid = () => (source: ColdObservable<Reading>) => source[filter]((reading) => reading.valid);
```

Do not recreate `.pipe` or the RxJS 7 `OperatorFunction` type family. Prefer
the exact Symbol while the receiver follows the cold default. After a reviewed
platform promotion, prefer `source.filter(...)` when its contract fits to
avoid the extension import.

## Low-level public operator migration

A public fluent RxJS 9 extension should export an exact module-owned Symbol,
augment `Observable<T>` under that key, and construct through public
`this[create](...)`. It must link source observation with
`subscriber.signal`, catch user callback and setup errors, forward terminal
notifications, and keep state per activation unless sharing is intentional.

Do not import RxJS internals such as `operate`, `OperatorSubscriber`, or `lift`
machinery. Do not install a string-named method. Do not use `Symbol.for`
without an explicit namespaced protocol covering duplicate installation,
version compatibility, property overwrite/refusal, and cross-realm behavior.
Otherwise incompatible copies can silently share and replace the same
prototype property while their declarations claim different contracts.

## Required characterization and target tests

Test values, source error, source completion, explicit RxJS 7 unsubscribe,
target owner abort, user callback throw, synchronous source/setup, downstream
reentrancy, per-subscription/activation state, teardown order, Symbol collision
isolation, and platform/ColdObservable receiver lifecycle.

If the source behavior relies on undocumented RxJS 7 internals and no public
target contract can express it, mark the unit unsupported and ask for a design
decision.
