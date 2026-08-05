# Migrating from RxJS 7 to RxJS 9

RxJS 9 is a new platform-based generation of RxJS. It extends the active
web-platform `Observable` with exact Symbol-keyed capabilities instead of
shipping the RxJS 7 Observable, Subscription, pipeable-operator, or scheduler
runtime. The first planned prerelease is `9.0.0-beta.0`.

This is a semantic migration, not a package-version bump. Before changing
imports, decide which producer, sharing, cancellation, and timing behavior each
affected pipeline must preserve.

## The safe migration path

1. **Make the RxJS 7 baseline green.** Run the existing build and test suite.
   Add characterization tests for repeated subscriptions, sharing, cancellation,
   teardown, late Subject observers, timing, and errors when those behaviors are
   not already protected.
2. **Inventory affected surfaces.** Find imports from `rxjs`,
   `rxjs/operators`, `rxjs/testing`, deep imports, scheduler usage, captured
   `Subscription` values, custom subscribables, and Observable subclasses.
3. **Choose a lifecycle for every pipeline.** Record one of the target
   contracts below. Do not infer it from an operator name or from the word
   “cold.”
4. **Apply only proven mechanical changes.** The canonical migration Skill and
   `@rxjs/migrate` can perform the bounded mappings in the engine's versioned
   registry. Everything else remains a reviewed source change.
5. **Review the semantic boundaries.** Pay particular attention to concurrent
   observers, late joins, last-observer cancellation, restart after ref-count
   closure, host timing, teardown order, and input conversion.
6. **Finish with evidence.** Re-run the build, types, focused tests, and the full
   behavioral suite. Record every intentional difference and every unsupported
   surface that remains.

For an agent-led repository migration, install and invoke the canonical Skill
described in
[`@rxjs/migrate`](https://github.com/ReactiveX/rxjs/tree/master/packages/migrate).
The deterministic engine
is deliberately subordinate to the reviewed lifecycle decisions in this
workflow.

## Choose the target lifecycle first

| Target                    | Use it when                                                                  | Contract to verify                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Platform Observable       | Concurrent observers should share one active producer                        | The first observer starts work, later observers join it, the final observer aborts it, and a later observer starts a new run |
| `ColdObservable`          | Every direct `subscribe()` must create independent producer work             | Each direct subscription owns its producer and cancellation; exact RxJS Symbol results retain the cold construction contract |
| Subject family            | The producer exists before observers subscribe                               | Fanout, current or replayed state, terminal behavior, and late observers match the selected intentional Subject API          |
| Unsupported or unresolved | The required RxJS 7 behavior has no accepted target or insufficient evidence | Stop before target installation or migration writes and ask for a design decision or stronger characterization tests         |

The platform Observable should not be labeled permanently hot or cold. Its
first subscription creates the active producer, concurrent subscriptions join
that producer, and a later subscription after ref-count closure creates a new
one. Sharing, replay, ref counting, and producer-creation timing are separate
properties.

## Operator imports and composition

RxJS 7 pipeable operators become exact Symbol imports and Symbol-keyed calls.
The root package does not install the operator catalog.

```ts
// RxJS 7
import { filter, map } from 'rxjs/operators';

const names = users.pipe(
  filter((user) => user.active),
  map((user) => user.name)
);
```

```ts
// RxJS 9
import { filter } from 'rxjs/filter';
import { map } from 'rxjs/map';

const names = users[filter]((user) => user.active)[map]((user) => user.name);
```

The platform and RxJS forms can coexist. For example,
`source.map(project)` is the platform contract while
`source[map](project)` is the RxJS contract. Importing the RxJS Symbol must not
replace the platform string-named method.

RxJS 9 does not accept the RxJS 7 callback `thisArg` parameter on `every`,
`filter`, `find`, `findIndex`, `map`, or `partition`. Capture state with a
closure or bind the callback explicitly:

```ts
const offset = 10;
const closedOver = source[map]((value) => value + offset);

const context = { offset: 10 };
const bound = source[map](function (value) {
  return value + this.offset;
}.bind(context));
```

Use the exact `pipe` Symbol only when deliberate multi-step composition is
clearer than direct Symbol chaining:

```ts
import { map } from 'rxjs/map';
import { pipe } from 'rxjs/pipe';

const names = users[pipe]((source) => source[map]((user) => user.name));
```

RxJS 9 does not publish `.pipe`, RxJS 7 pipeable operator functions, or the
`OperatorFunction` type family.

## Cancellation and teardown

`subscribe()` returns `undefined`. Own cancellation with an
`AbortController`, and pass its signal in the subscription options.

```ts
const controller = new AbortController();

source.subscribe(
  {
    next: (value) => consume(value),
    error: (error) => report(error),
  },
  { signal: controller.signal }
);

controller.abort('view disposed');
```

Inside a producer, register cleanup with `subscriber.addTeardown()` instead of
returning teardown logic:

```ts
const ticks = new Observable<number>((subscriber) => {
  let value = 0;
  const handle = setInterval(() => subscriber.next(value++), 1000);
  subscriber.addTeardown(() => clearInterval(handle));
});
```

Platform teardown callbacks run in reverse insertion order. The final
observer's cancellation closes the shared producer; cancelling one of several
observers does not.

## Input conversion and realms

Operator inputs use the active realm's platform `Observable.from` contract.
Do not assume RxJS 7's broad `ObservableInput` support:

- arbitrary objects with a lowercase `subscribe()` method are not accepted;
- legacy `Symbol.observable` and `@@observable` interop are not accepted;
- foreign-realm Observables are not transparently bridged;
- each window, iframe, worker, or server isolate initializes independently.

Wrap unsupported inputs explicitly in the active realm only after defining who
owns cancellation, terminal delivery, and errors.

## Subjects and producer-per-subscription work

The intentional Subject surface is not a compatibility alias layer:

- `Subject` and `AsyncSubject` are classes;
- `behaviorSubject(value)` and `replaySubject(config)` are lowercase factories;
- `PerSubscriptionSubjectBase` is an advanced abstract base for specialized hot
  Subjects with observer-local setup;
- `ColdObservable` is the explicit producer-per-direct-subscription type.

Every Subject instance is hot because its producer exists before subscription.
The per-subscription hook on the advanced base does not make the Subject itself
cold.

## Scheduling and testing

RxJS 9 does not publish the RxJS 7 scheduler system or general scheduler
arguments. Runtime capabilities use host timers, animation frames, and narrow
clock providers where documented. Use `@rxjs/test` to virtualize the supported
host APIs in deterministic tests.

When migrating marble tests, choose the source model explicitly:

- `cold()` creates independent producer work per subscription;
- `hot()` creates a Subject-like absolute-timeline producer before observers;
- `observable()` exercises the platform shared/ref-counted lifecycle.

Removing a scheduler argument is never a mechanical edit unless the specific
capability and timing claim have already been classified and tested.

## What may be automated

The `@rxjs/migrate` default registry currently proves a bounded set of direct,
unshadowed mappings. The engine itself is the versioned authority; its README
lists the currently supported subset. A migration tool may proceed only when a
mapping is both:

- a `replace` entry in the unsupported-surface catalog; and
- backed by a completed entry in the migration-evidence ledger.

It must stop for `manual review`, `unsupported`, `test only`, or `removed`
entries. A successful transform is not proof of a completed migration.

## Detailed references

- [Migration evidence ledger](docs/MIGRATION_EVIDENCE_LEDGER.md): every
  prioritized RxJS 7 operator, factory, value, type status, lifecycle,
  cancellation model, evidence set, and migration action.
- [Unsupported RxJS 7 surfaces](docs/UNSUPPORTED_RXJS_7_SURFACES.md): imports,
  types, schedulers, interop protocols, and deprecated aliases that require
  replacement, manual review, or removal.
- [`@rxjs/migrate`](https://github.com/ReactiveX/rxjs/tree/master/packages/migrate):
  the canonical Skill, deterministic
  engine, safe-stop behavior, and supported mechanical subset.
- [Compatibility policy](https://github.com/ReactiveX/rxjs/blob/master/docs/rxjs-next/COMPATIBILITY.md):
  the repository
  rules behind the migration evidence and intentional divergences.

## Migration completion checklist

- The RxJS 7 baseline and characterization tests were green before migration.
- Every affected pipeline has an explicit lifecycle target.
- Imports use supported package roots or exact Symbol subpaths; no deep import
  remains.
- Cancellation uses `AbortSignal`; no code expects `subscribe()` to return a
  `Subscription`.
- Repeated subscriptions, sharing, late joins, last-observer cancellation, and
  restart behavior are tested where relevant.
- Scheduler and timing changes have explicit behavioral evidence.
- Custom inputs, Subjects, teardown order, and error handling were reviewed.
- The target build, types, focused tests, and full behavioral suite pass.
- Intentional divergences and unsupported surfaces are recorded without a
  compatibility-runtime claim.
