# RxJS Next testing design

## Status and recommendation

RxJS Next provides a framework-neutral virtual-time test API from
`@rxjs/test`:

```ts
import { rxTest } from '@rxjs/test';

await rxTest(({ cold, expectObservable }) => {
  expectObservable(cold('--a--|')).toBe('--a--|');
});
```

`rxTest` owns the scheduler instance, temporarily redirects supported host
scheduling APIs, drains deterministic work, evaluates assertions, restores the
realm in every exit path, and returns `Promise<void>`.

The API is deliberately function-first. The RxJS 7 manual-mode
`TestScheduler`, mutable `frameTimeFactor`, `maxFrames`, and static parsing
methods are not public.

## Source models

Testing needs to express both RxJS 7 compatibility behavior and the platform
Observable lifecycle. One ambiguous `cold` helper would make tests misleading,
so the context exposes three source models.

Here “hot” and “cold” refer only to producer creation relative to
subscription. Cold means the subscription creates the producer. Hot means the
producer already exists before the subscription. Sharing, multicasting,
replay, and ref counting are separate lifecycle properties.

### `cold`

`cold()` creates a producer during every subscription, matching the RxJS 7
producer-per-subscription model:

- every observer starts an independent copy of the diagram;
- messages are relative to that observer's subscription;
- completion, error, or AbortSignal cancellation closes its log;
- concurrent observers do not share production.

This is explicit test/compatibility behavior and does not change the main
platform Observable. The fixture is a named subclass of `ColdObservable`;
RxJS Symbol operators derive ordinary `ColdObservable` instances through the
shared `[create]` protocol.

### `hot`

`hot()` creates its subject-like absolute-timeline producer when the helper is
called, before any observer subscribes:

- the diagram is scheduled once relative to test time;
- observing does not start, stop, or restart the producer;
- late observers see only future notifications;
- `^` establishes time zero and permits negative-time history;
- `next`, `error`, and `complete` remain available for manual control.

The fixture subclasses the active `globalThis.Observable` constructor so it
works with either a preserved native implementation or the fallback. Its
`[create]` protocol returns an ordinary instance of that active constructor,
so operator results do not inherit the fixture's absolute-time broadcast
machinery.

### `observable`

`observable()` follows the platform lifecycle:

- the first observer creates and activates the producer and starts the diagram;
- concurrent observers share the active producer;
- individual observers can abort independently;
- the final observer leaving cancels pending producer work;
- later observation starts a fresh activation;
- its `subscriptions` log records producer activation windows, not raw observer
  count.

It is constructed directly from the active `globalThis.Observable`; it does
not select, replace, or import a fallback constructor.

## Public API

The authoritative declarations and doc comments are in
`packages/test/src/types.ts`. The root entry point exports the following
surface:

```ts
/**
 * Runs an RxJS test with native scheduling APIs redirected to deterministic
 * virtual time for the callback's complete async lifetime.
 *
 * The returned Promise resolves only after the callback, finite virtual work,
 * and registered expectations have completed and the realm has been restored.
 */
export function rxTest(callback: RxTestCallback, config?: RxTestConfig): Promise<void>;

/** A virtual duration. Numbers are milliseconds. */
export type TestDuration = number | `${number}ms` | `${number}s` | `${number}m`;

/**
 * Animation or idle opportunities expressed as marble markers or absolute
 * virtual millisecond timestamps.
 */
export type TestTimingPlan = string | readonly number[];

/** Values substituted for ordinary markers in a marble diagram. */
export type MarbleValues<T> = Readonly<Record<string, T>> | readonly T[];

/** The callback executed inside an isolated `rxTest` virtual-time realm. */
export type RxTestCallback = (context: RxTestContext) => void | PromiseLike<void>;

/** Assertion adapter used for observable and subscription expectations. */
export type RxTestAssertDeepEqual = (actual: unknown, expected: unknown, info: RxTestAssertionInfo) => void | PromiseLike<void>;

/** Metadata describing the assertion currently being evaluated. */
export interface RxTestAssertionInfo {
  /** The kind of recorded data being compared. */
  readonly kind: 'observable' | 'subscriptions';
  /** The expected marble expression, when one was supplied. */
  readonly marbles?: string | readonly string[];
}

/** Configuration for one `rxTest` execution. */
export interface RxTestConfig {
  /**
   * Custom deep-equality assertion. The default throws
   * `RxTestAssertionError` and works without a test-framework adapter.
   */
  assertDeepEqual?: RxTestAssertDeepEqual;
  /**
   * Epoch used by virtual `Date`. Context time and `performance.now()` still
   * begin at zero.
   * @default 0
   */
  startTime?: number | string | Date;
  /**
   * Largest virtual timestamp that may be entered.
   * @default Infinity
   */
  maxVirtualTime?: TestDuration;
  /**
   * Callback execution limit used to diagnose self-scheduling loops.
   * @default 100000
   */
  maxTaskExecutions?: number;
  /**
   * Default `IdleDeadline.timeRemaining()` budget.
   * @default 50
   */
  idleBudget?: TestDuration;
}

/** Work scheduled directly through `RxTestContext.schedule`. */
export type ScheduledTestWork = () => void | PromiseLike<void>;

/** Options for directly scheduled test work. */
export interface TestScheduleOptions {
  /** Cancels the task when aborted. */
  readonly signal?: AbortSignal;
}

/** A cancellable virtual task. */
export interface ScheduledTestTask {
  /** Absolute due time in virtual milliseconds. */
  readonly dueTime: number;
  /** Aborted on cancellation, test completion, or test failure. */
  readonly signal: AbortSignal;
  /** Cancels the task. Repeated calls have no effect. */
  cancel(reason?: unknown): void;
}

/** Options applied to an idle-opportunity plan. */
export interface TestIdleOptions {
  /** Overrides the configured idle budget for this plan. */
  readonly budget?: TestDuration;
}

/** A recorded next, error, or completion notification. */
export type TestNotification<T> =
  | { readonly kind: 'N'; readonly value: T }
  | { readonly kind: 'E'; readonly error: unknown }
  | { readonly kind: 'C' };

/** An Observable notification and its absolute virtual timestamp. */
export interface TestMessage<T = unknown> {
  readonly frame: number;
  readonly notification: TestNotification<T>;
}

/**
 * A producer or observer lifetime. Legacy field names are retained, but each
 * frame is one virtual millisecond.
 */
export interface TestSubscriptionLog {
  readonly subscribedFrame: number;
  readonly unsubscribedFrame: number;
}

/** Properties common to marble-created test sources. */
export interface TestSource<T> extends Observable<T> {
  readonly kind: 'cold' | 'hot' | 'observable';
  readonly messages: readonly TestMessage<T>[];
  readonly subscriptions: readonly TestSubscriptionLog[];
}

/** An RxJS 7-style producer-per-subscription test source. */
export interface TestColdObservable<T> extends TestSource<T> {
  readonly kind: 'cold';
}

/** A platform-lifecycle source whose log records active producer windows. */
export interface TestPlatformObservable<T> extends TestSource<T> {
  readonly kind: 'observable';
}

/** A subject-like source controlled by an absolute marble timeline. */
export interface TestHotObservable<T> extends TestSource<T> {
  readonly kind: 'hot';
  readonly active: boolean;
  next(value: T): void;
  error(error: unknown): void;
  complete(): void;
}

/** Matchers for a recorded Observable. */
export interface ObservableExpectation<T> {
  /** Compares recorded notifications with a marble diagram. */
  toBe(marbles: string, values?: MarbleValues<T>, error?: unknown): void;
  /** Compares with another Observable recorded through the same window. */
  toEqual(expected: Observable<T>): void;
}

/** Matcher for observer or producer-activation logs. */
export interface SubscriptionExpectation {
  /** Compares the live logs with one or more subscription diagrams. */
  toBe(marbles: string | readonly string[]): void;
}

/** Factories, assertions, and virtual-time controls available inside `rxTest`. */
export interface RxTestContext {
  /** Aborted when the test completes or fails. */
  readonly signal: AbortSignal;

  /**
   * Creates an RxJS 7-style cold source: subscription creates an independent
   * producer and timeline for every observer.
   */
  cold<T = string>(marbles: string, values?: MarbleValues<T>, error?: unknown): TestColdObservable<T>;

  /** Creates a subject-like source whose diagram is absolute test time. */
  hot<T = string>(marbles: string, values?: MarbleValues<T>, error?: unknown): TestHotObservable<T>;

  /**
   * Creates a platform source. The first observer creates its active producer,
   * concurrent observers share it, and observation after ref-count closure
   * creates a new producer.
   */
  observable<T = string>(marbles: string, values?: MarbleValues<T>, error?: unknown): TestPlatformObservable<T>;

  /** Returns the timestamp of the single `|` in a timing diagram. */
  time(marbles: string): number;
  /** Returns elapsed virtual milliseconds since the test began. */
  now(): number;

  /** Schedules work on the virtual task queue. */
  schedule(work: ScheduledTestWork, delay?: TestDuration, options?: TestScheduleOptions): ScheduledTestTask;

  /** Registers an observable-output expectation. */
  expectObservable<T>(actual: Observable<T>, subscriptionMarbles?: string | null): ObservableExpectation<T>;

  /** Registers an expectation against a test source's live logs. */
  expectSubscriptions(actual: readonly TestSubscriptionLog[]): SubscriptionExpectation;

  /** Declares animation-frame opportunities. May be called once at time zero. */
  animate(plan: TestTimingPlan): void;
  /** Declares idle opportunities. May be called once at time zero. */
  idle(plan: TestTimingPlan, options?: TestIdleOptions): void;
  /** Drains finite virtual work and evaluates current expectations. */
  flush(): Promise<void>;
  /** Advances by a relative duration and drains work due through that time. */
  advanceBy(duration: TestDuration): Promise<void>;
  /** Advances to an absolute virtual timestamp. */
  advanceTo(time: TestDuration): Promise<void>;
}

/** Error thrown by the built-in deep-strict assertion adapter. */
export class RxTestAssertionError extends Error {
  readonly name: 'RxTestAssertionError';
  readonly actual: unknown;
  readonly expected: unknown;
  readonly assertion: RxTestAssertionInfo;
}
```

The default assertion is cycle-aware deep-strict equality and throws
`RxTestAssertionError`. `assertDeepEqual` can delegate to Jest, Vitest, Chai,
Node assert, or another framework and can return a Promise.

## Marble grammar

Each normal frame is one virtual millisecond.

Grammar parsing is implemented in the internal, pure
`packages/test/src/marble-parser.ts` module. It has no virtual-clock, host,
Observable, or assertion dependencies and is unit-tested independently from
the `rxTest` integration. The low-level parser is not currently a public
package export; exposing it can be decided separately without coupling the
runtime to that decision.

| Syntax                | Meaning                                  |
| --------------------- | ---------------------------------------- |
| whitespace            | ignored                                  |
| `-`                   | advance one millisecond                  |
| `a`, `1`, `🙂`, `@`   | emit a value and advance one millisecond |
| `(...)`               | emit grouped notifications synchronously |
| `\|`                  | complete                                 |
| `#`                   | error                                    |
| `^`                   | hot zero point or subscription           |
| `!`                   | unsubscription in a subscription diagram |
| `12ms`, `20s`, `1.5m` | explicit time progression                |

An `expectObservable` subscription window is half-open: a notification at the
exact `!` frame is excluded, and the observation's `AbortSignal` is cancelled
before ordinary source work scheduled for that frame.

At a shared virtual timestamp, observation boundaries run first, observation
starts run second, and ordinary source work runs afterward. Consequently, a
time-zero expectation observes a hot time-zero notification, while an
unsubscription at a notification's frame still excludes that notification.

Whitespace inside a marble string is formatting-only and never advances
virtual time. It can compensate when source-code layout places opening quotes
in different columns. The important alignment point for hot diagrams is `^`,
because it marks virtual frame zero.

In this incorrect example, the shorter identifier moves the second opening
quote two columns left, but three in-string spaces overcompensate. Its `^` is
one column too far right:

```ts
const quotePositionedRight = '--^---a--b--c--|';
const paddedInsideString = '   --^---x--y--z--|';
```

The correct example uses exactly two ignored in-string spaces, so both `^`
markers—and therefore the timelines after frame zero—align vertically:

```ts
const quotePositionedRight = '--^---a--b--c--|';
const paddedInsideString = '  --^---x--y--z--|';
```

Spaces outside the quotes affect only where the literal appears in source and
are never passed to the parser. Spaces inside the quotes shift the visible
marble tokens for source alignment, but the parser discards them, so they add
no frames. Padding must therefore match the source-column offset exactly.

Duration tokens are recognized at a diagram boundary or when separated by
whitespace. `a 12ms b` contains a duration; `a12msb` contains ordinary value
markers. Synchronous groups preserve the RxJS 7 rule that the text width
advances time even though the notifications share one timestamp.

`time()` accepts whitespace, frames, duration tokens, and exactly one `|`. It
returns the timestamp of that completion marker.

## Animation and idle plans

`animate` and `idle` accept either absolute millisecond arrays or marble
timelines:

```ts
animate([4, 9, 14]);
animate('----@----@----@');

idle([6, 12], { budget: 5 });
idle('------@-----@');
```

Any ordinary marker creates an opportunity. Completion, error, subscription,
unsubscription, and grouping markers are rejected.

At an animation opportunity, callbacks already queued by
`requestAnimationFrame` run as one insertion-ordered batch. Requests created
during that batch wait for the next opportunity.

At an idle opportunity, queued callbacks receive a deterministic
`IdleDeadline`. A callback whose `timeout` expires first runs with
`didTimeout === true` and `timeRemaining() === 0`.

Both helpers may be called once and before virtual time advances. Pending frame
or idle callbacks with no remaining opportunity reject the test.

## Virtual host contract

During the complete callback-and-drain lifetime, `rxTest` captures and patches:

- `setTimeout` and `clearTimeout`;
- `setInterval` and `clearInterval`;
- `requestAnimationFrame` and `cancelAnimationFrame`;
- `requestIdleCallback` and `cancelIdleCallback`;
- `setImmediate` and `clearImmediate` when the realm provides them;
- `AbortSignal.timeout`;
- `Date`, `Date.now`, and `performance.now`;
- `queueMicrotask`, delegating to the native queue while tracking completion;
- `reportError`, so unhandled Observable errors reject the test.

Animation, idle, and `reportError` APIs are installed temporarily when absent.
Node timer handles support `ref`, `unref`, `hasRef`, `refresh`, numeric
coercion, and `Symbol.dispose`.

Every own-property descriptor and reference is restored in reverse patch
order. Restoration runs after success, callback failure, scheduled failure,
assertion failure, or limit failure. A restoration error is combined with the
primary error using `AggregateError`.

Supported RxJS scheduling code must resolve host functions when it schedules
work. Capturing `setTimeout`, `requestAnimationFrame`, or another host function
before `rxTest` installs virtual time bypasses the test boundary and is not
supported.

RxJS Next platform-layer code makes that boundary explicit with late
`globalThis.*` access. It does not use RxJS-owned provider delegates for host
scheduling. The same patched realm functions therefore govern library work and
ordinary application scheduling during `rxTest`.

## Async execution and completion

An async body can wait on virtual time without manually advancing it:

```ts
await rxTest(async ({ now }) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 25));
  expect(now()).toBe(25);
});
```

The engine alternates due virtual tasks and native microtask checkpoints until
the body settles. It then drains finite work and evaluates expectations.
Manual `flush`, `advanceBy`, and `advanceTo` are asynchronous so Promise
microtasks complete in the correct order.

The Promise rejects for:

- an uncancelled self-scheduling loop that reaches `maxTaskExecutions`;
- a task beyond `maxVirtualTime`;
- pending frame or idle work with no opportunity;
- a registered expectation without a matcher;
- a callback, scheduled callback, returned Promise, unhandled error, assertion,
  or cleanup failure.

Detached Promise chains cannot be discovered reliably by JavaScript. Promise
work that matters to test completion must be returned or awaited. Captured
pre-test timers, `MessageChannel`, `postMessage`, real I/O, and imported
`node:timers/promises` functions are not virtualized.

Every scheduling primitive adopted by a supported RxJS operator becomes part
of the `@rxjs/test` gate. A future operator using another host API must add its
virtual adapter in the same change.

## Concurrency

Top-level `rxTest` calls in one realm are serialized FIFO because they patch
realm-global APIs. Separate workers or windows remain independent.

The lock uses the deliberately shared, versioned
`Symbol.for('@rxjs/test/realm-lock/v1')` key. This is not an Observable
extension Symbol; shared identity is required so duplicate test-package copies
cannot patch the same realm concurrently. The lock property is non-enumerable
and removed after the queue empties.

Nested `rxTest` calls are unsupported. Synchronous nesting is diagnosed
immediately.

## Examples

### Framework-neutral marble test

```ts
import { rxTest } from '@rxjs/test';

it('records the source', () =>
  rxTest(({ cold, expectObservable, expectSubscriptions }) => {
    const source = cold('--a--b--|', {
      a: 'first',
      b: 'second',
    });

    expectObservable(source).toBe('--a--b--|', {
      a: 'first',
      b: 'second',
    });
    expectSubscriptions(source.subscriptions).toBe('^-------!');
  }));
```

### Native timer mixed with an Observable

```ts
test('virtualizes application timers', () =>
  rxTest(({ expectObservable }) => {
    const result = new Observable<string>((subscriber) => {
      const handle = setTimeout(() => {
        subscriber.next('ready');
        subscriber.complete();
      }, 12);
      subscriber.addTeardown(() => clearTimeout(handle));
    });

    expectObservable(result).toBe('12ms (a|)', { a: 'ready' });
  }));
```

### RxJS 7 producer-per-subscription behavior versus platform sharing

```ts
it('makes the lifecycle explicit', () =>
  rxTest(({ cold, observable, expectObservable, expectSubscriptions }) => {
    const legacy = cold('--a--|');
    expectObservable(legacy).toBe('--a--|');
    expectObservable(legacy, '---^').toBe('-----a--|');
    expectSubscriptions(legacy.subscriptions).toBe(['^----!', '---^----!']);

    const platform = observable('--a--b--|');
    expectObservable(platform).toBe('--a--b--|');
    expectObservable(platform, '---^').toBe('-----b--|');
    expectSubscriptions(platform.subscriptions).toBe('^-------!');
  }));
```

### Custom assertion adapter

```ts
await rxTest(
  ({ cold, expectObservable }) => {
    expectObservable(cold('--a|')).toBe('--a|');
  },
  {
    assertDeepEqual(actual, expected) {
      expect(actual).toEqual(expected);
    },
  }
);
```

## Packaging and verification

`@rxjs/test` is a separate development-time package with a peer dependency on
the matching `rxjs` release. It imports the public `ColdObservable` used by
`cold()`. That RxJS entry conditionally installs the fallback only when the
realm has no Observable and preserves an existing native constructor, avoiding
a second Observable identity.

The package builds browser, webpack, ESM, and CommonJS dialects through the
repository's normal `tshy` pipeline. Its source tests are excluded from
published output.

Focused verification includes direct parser cases for alignment whitespace,
durations, messages, groups, hot carets, subscriptions, timing plans, Unicode
markers, and invalid grammar. Integration cases cover all three source models,
ref-count restarts, `toBe`, `toEqual`, subscription logs, native timers, Node
handles, clocks, microtasks, animation, idle callbacks, AbortSignal timeouts,
cancellation, custom assertions, cleanup, serialization, nested-call
diagnostics, and execution/time limits.

## Ported RxJS 7 evidence

The repository keeps migrated RxJS 7 marble evidence under
`packages/rxjs/test/ported`, outside the `@rxjs/test` package API. Its generated
manifest pins the source revision and retains the original and mechanically
converted source for all 2,338 registrations expanded from 2,201 physical test
declarations. This includes parameterized variants and source-skipped evidence.
Every record has a unique case ID and exactly one disposition, including
missing capabilities and cases that only protect the former scheduler harness.

The executable evidence is 147 ordinary, formatted Vitest `.spec.ts` files for
each of the cold and platform modes. A one-time migration produced them; the
repository now owns them as normal source. Each file imports `describe`, `it`,
`rxTest`, and the public RxJS Symbols it uses; every test calls `rxTest(...)`
directly. File-level comments record the source repository, exact revision,
and historic RxJS 7 path.
Missing APIs and unavailable harness facilities fail as ordinary tests with
source-linked diagnostics; they are not skipped or represented only as
metadata.

Each mode runs in its own Vitest process so its constructor is active before
Symbol extensions load:

- cold mode installs the fallback as the platform base, while `cold()` and
  explicit cold factories use `ColdObservable` without replacing the global;
- polyfill mode uses the platform fallback;
- native mode preserves the ambient Observable and skips when none exists.

Platform tests construct from the global `Observable` and never import the
fallback constructor. Dedicated platform cases prove shared activation,
individual observer cancellation, ref-count restart, and global construction
where legacy producer-per-subscription expectations would be misleading.

An exact migrated case may receive the internal port mode only when its
subscription-multiplicity assertion intentionally differs between the RxJS 7
cold lifecycle and the shared platform lifecycle. The checked-in cold branch
must retain the original subscription evidence; the platform branch may change
only the affected lifecycle expectation, such as two concurrent observers
sharing one upstream subscription. Mode-aware rewrites must not hide value,
error, completion, or cancellation mismatches, and they must not make the
platform implementation producer-per-subscription.

The default cold and polyfill gates register all 2,338 source cases as ordinary
tests. Known implementation, capability, conversion, lifecycle, source-skip,
and duplicate dispositions do not alter Vitest semantics: a test that throws
fails the file and the command. The historical verified-pass baselines remain
available for evidence reporting and deliberate JSON audit recording, but they
cannot quarantine, skip, or invert a default result. Dedicated platform
lifecycle cases separately assert sharing and ref counting.

The normal commands use Vitest's public built-in `default` reporter unchanged.
Failures therefore print the real checked-in filename and line number, which
editors and terminals can open directly. The CI audit uses Vitest's built-in
verbose reporter. The audit tools associate those results with manifest case IDs
through the static migration report and declaration order, keeping machine IDs
out of human test names while still validating complete, non-duplicated
coverage.

Operator imports are role-aware. An RxJS 7 pipeable call such as
`source.pipe(operator(arg1, arg2))` becomes a runtime invocation of its mapped
exported Symbol as `source[targetSymbol](...adaptedArgs)`. Exact mappings keep
the arguments; unified mappings record their adapter explicitly, such as
`bufferCount(size) → source[buffer]({ maxSize: size })`. Static creation
functions resolve separately on `Observable[factorySymbol]` or through an
explicit ambient-platform construction. The generated `RxJS-7-parity.md` map
and `capability-registry.json` record present, partial, unified, platform, and
missing surfaces.

```sh
pnpm --filter rxjs run test:unit
pnpm --filter rxjs run test:unit:native
pnpm --filter rxjs run test:unit:audit
pnpm --filter rxjs run test:unit:audit:polyfill
pnpm --filter rxjs run test:unit:audit:check
pnpm --filter rxjs run test:unit:report
pnpm --filter rxjs run test:unit:parity:check
```

Detailed counts, duplicates, missing capabilities, and unsupported-case
rationales are in `RXJS_7_MARBLE_TEST_PORT_NOTES.md`.

The audit commands retain ordinary Vitest failure semantics. The CI-only
`test:unit:audit:check` command captures the verbose per-case result stream and
requires the exact reviewed cold and polyfill passing case-ID sets. It fails for
incomplete collection, unknown or duplicate IDs, new failures, and unexpected
passes; updating a baseline therefore remains an explicit evidence-review
action. Clean CI builds the observable-polyfill runtime dependency before the
audit so source imports resolve through the same package boundary contributors
use locally.

Reusable authoring support lives in the independently publishable
`@rxjs/migrate` package. Its semantic transform is independent of test-runner
syntax; Mocha/Chai-to-Vitest is the first adapter, and callers may preserve or
replace it. P0.M1 also included a dry-run-first CLI, portable Skill assets, and
read-only source-content MCP tools. Under D-046, the accepted product is the
deterministic engine plus one canonical Skill and thin harness adapters; P0.M3
removes the MCP prototype. None participates in test collection or execution
after migrated files are accepted. Mechanical fixture evidence and agent
workflow evidence remain separate gates.
