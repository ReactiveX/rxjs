# Migrating from RxJS 7 to RxJS 9

> **Recommended workflow:** install the official
> [`@rxjs/agent-plugin`](https://www.npmjs.com/package/@rxjs/agent-plugin) and use its
> `migrate-rxjs-7-to-9` skill. Its read-only MCP can analyze and preview
> deterministic changes from explicit source text; it cannot read or write
> your repository. Review all lifecycle choices before applying a preview.

RxJS 9 is a new platform-based generation of RxJS. It extends the active
web-platform `Observable` with exact Symbol-keyed capabilities instead of
shipping the RxJS 7 Observable, Subscription, pipeable-operator, or scheduler
runtime. The current synchronized target is `9.0.0-beta.1`.

This is a semantic migration, not a package-version bump. Before changing
imports, decide which producer, sharing, cancellation, and timing behavior each
affected pipeline must preserve.

## The safe migration path

1. **Make the RxJS 7 baseline green.** Run the existing build and test suite.
   Add characterization tests for repeated subscriptions, sharing, cancellation,
   teardown, late Subject observers, timing, and errors when those behaviors are
   not already protected.
2. **Inventory every public surface.** Find imports from `rxjs`,
   `rxjs/operators`, `rxjs/ajax`, `rxjs/fetch`, `rxjs/webSocket`, and
   `rxjs/testing`, plus deep imports, scheduler usage, captured `Subscription`
   values, custom subscribables, and Observable subclasses.
3. **Start with the behavior-preserving lifecycle.** An ordinary RxJS 7
   `Observable` maps one-for-one to an RxJS 9 `ColdObservable`: every direct
   subscription creates and owns its producer work. Treat the platform
   lifecycle as a reviewed optimization, not the default.
4. **Apply only proven mechanical changes.** The plugin catalogs every public
   RxJS 7 operator, function, type, and value, while its deterministic engine
   rewrites only the smaller fixture-proved subset. Everything else follows
   its cataloged guided, replacement, review, or unsupported path.
5. **Review the semantic boundaries.** Pay particular attention to concurrent
   observers, late joins, last-observer cancellation, restart after ref-count
   closure, host timing, teardown order, and input conversion.
6. **Finish with evidence.** Re-run the build, types, focused tests, and the full
   behavioral suite. Record every intentional difference and every unsupported
   surface that remains.

For an agent-led repository migration, install `@rxjs/agent-plugin` and invoke
its `migrate-rxjs-7-to-9` skill. Its deterministic engine is deliberately
subordinate to the reviewed lifecycle decisions in this workflow.

## Choose the target lifecycle first

| Target                    | Use it when                                                                  | Contract to verify                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `ColdObservable`          | Default for every ordinary RxJS 7 Observable-producing unit                  | Each direct subscription owns its producer and cancellation; exact RxJS Symbol results retain the cold construction contract |
| Platform Observable       | Evidence permits one active producer to be shared                            | The first observer starts work, later observers join it, the final observer aborts it, and a later observer starts a new run |
| Subject family            | The producer exists before observers subscribe                               | Fanout, current or replayed state, terminal behavior, and late observers match the selected intentional Subject API          |
| Unsupported or unresolved | The required RxJS 7 behavior has no accepted target or insufficient evidence | Stop before target installation or migration writes and ask for a design decision or stronger characterization tests         |

Promotion from `ColdObservable` to the platform `Observable` is reasonable
when either of these claims is proved:

- the RxJS 7 unit already uses `share`, `shareReplay`, `publish`, `multicast`,
  `refCount`, or another sharing boundary whose connector, reset, replay, and
  cancellation behavior fits the platform lifecycle; or
- the unit has only one subscriber at a time across the whole repository, so
  producer sharing cannot change observable behavior.

A single `.subscribe()` call in one file is only a candidate, not proof. Check
templates, framework bindings, helper functions, exported consumers,
`retry`/`repeat`, and indirect subscriptions. When RxJS 7 sharing is explicit,
do not mechanically retain or remove it: characterize the sharing contract and
then decide whether the platform lifecycle replaces that boundary.

The platform Observable should not be labeled permanently hot or cold. Its
first subscription creates the active producer, concurrent subscriptions join
that producer, and a later subscription after ref-count closure creates a new
one. Sharing, replay, ref counting, and producer-creation timing are separate
properties.

## Operator imports and composition

On the safe cold path, RxJS 7 pipeable operators become exact Symbol imports
and Symbol-keyed calls. The root package does not install the operator catalog.

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

After a receiver has been deliberately promoted to the platform lifecycle,
prefer a native platform method such as `.map()`, `.filter()`, `.take()`,
`.drop()`, `.flatMap()`, or `.switchMap()` whenever its semantics fit. Those
methods avoid an RxJS extension import and can reduce browser bundle size. Do
not use this optimization on the cold-default path: an exact Symbol is what
retains `ColdObservable` construction.

RxJS 9 does not accept the RxJS 7 callback `thisArg` parameter on `every`,
`filter`, `find`, `findIndex`, `map`, or `partition`. Capture state with a
closure or bind the callback explicitly:

```ts
const offset = 10;
const closedOver = source[map]((value) => value + offset);

const context = { offset: 10 };
const bound = source[map](
  function (value) {
    return value + this.offset;
  }.bind(context)
);
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
import { ColdObservable } from 'rxjs';

const ticks = new ColdObservable<number>((subscriber) => {
  let value = 0;
  const handle = setInterval(() => subscriber.next(value++), 1000);
  subscriber.addTeardown(() => clearInterval(handle));
});
```

`ColdObservable` teardown belongs to each direct subscription. Platform
teardown callbacks run in reverse insertion order; on a platform Observable,
the final observer's cancellation closes the shared producer while cancelling
one of several observers does not.

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

When migrating marble tests, default RxJS 7 cold sources and ordinary
Observable-producing code to `cold()`. Choose another source model only when
the migration contract requires it:

- `cold()` creates independent producer work per subscription;
- `hot()` creates a Subject-like absolute-timeline producer before observers;
- `observable()` exercises the platform shared/ref-counted lifecycle.

Removing a scheduler argument is never a mechanical edit unless the specific
capability and timing claim have already been classified and tested.

## What may be automated

The agent plugin's generated migration surface catalog covers every named
public export from the six RxJS 7.8.2 package entry points listed above. For
each surface it reports the target, cold and platform paths, disposition,
lifecycle rule, platform-method candidate, and evidence status. This is
complete guidance coverage, not a claim that every migration is mechanical.

The deterministic engine currently proves only a bounded set of direct,
unshadowed mappings. Its versioned capability registry is authoritative for
automatic edits. A migration tool may proceed mechanically only when the
capability is fixture-proved, its arity and overload preconditions match, and
the relevant evidence-ledger entry is complete. It must stop for manual-review,
unsupported, test-only, removed, shadowed, or otherwise unproved constructs. A
successful transform is not proof of a completed migration.

## Detailed references

- [Migration evidence ledger](docs/MIGRATION_EVIDENCE_LEDGER.md): every
  prioritized RxJS 7 operator, factory, value, type status, lifecycle,
  cancellation model, evidence set, and migration action.
- [Unsupported RxJS 7 surfaces](docs/UNSUPPORTED_RXJS_7_SURFACES.md): imports,
  types, schedulers, interop protocols, and deprecated aliases that require
  replacement, manual review, or removal.
- [`@rxjs/agent-plugin`](https://github.com/ReactiveX/rxjs/tree/master/packages/agent-plugin):
  the canonical migration skill, complete generated surface catalog,
  read-only MCP, safe-stop behavior, and supported mechanical subset.
- [`@rxjs/migrate`](https://github.com/ReactiveX/rxjs/tree/master/packages/migrate):
  the final compatible legacy API and CLI during the beta.1 transition.
- [Compatibility policy](https://github.com/ReactiveX/rxjs/blob/master/docs/rxjs-next/COMPATIBILITY.md):
  the repository
  rules behind the migration evidence and intentional divergences.

## Migration completion checklist

- The RxJS 7 baseline and characterization tests were green before migration.
- Every ordinary RxJS 7 Observable-producing unit uses the cold default or has
  recorded evidence for platform promotion.
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
