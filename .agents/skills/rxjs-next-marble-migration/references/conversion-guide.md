# Conversion guide

## Select the outer test-framework adapter

Framework preservation is the default adapter. Keep `describe`, `it`, `test`,
hooks, spies, and the assertion library already used by the project unless the
user selected a supported target framework.

Treat a framework migration as a separate adapter over the same converted test
body. For example, the first supported cross-framework path may translate
Mocha/Chai imports, hooks, assertions, and spies to Vitest while the core
conversion independently replaces `TestScheduler` and RxJS 7 composition.
Report an unsupported framework pair instead of guessing its globals,
assertions, spies, hooks, or configuration.

Regardless of the adapter, emit direct ordinary test declarations. Materialize
parameterized source cases into readable `it(...)` or `test(...)` declarations;
do not add a runtime loop, hidden registry, or generated location shim.

## File ownership and provenance

Use the target project's filename convention. Start every migrated file with a
short comment containing the source repository, exact revision, and source
path. The result is owned source code: it must not say to edit or rerun a
generator. Use case-level comments only to explain a semantic migration choice
such as a lifecycle selection or scheduler-to-host-time rewrite.

## TestScheduler wrapper

RxJS 7:

```ts
let scheduler: TestScheduler;

beforeEach(() => {
  scheduler = new TestScheduler(assertDeepEqual);
});

it('maps values', () => {
  scheduler.run(({ cold, expectObservable }) => {
    // case
  });
});
```

RxJS Next:

```ts
it('maps values', () =>
  rxTest(({ cold, expectObservable }) => {
    // case
  }));
```

Remove the scheduler variable, constructor, custom observable matcher, and
setup hook only when they have no other responsibility. Keep the project's
ordinary assertions.

## Helper mapping

| RxJS 7 run helper       | RxJS Next `rxTest` helper | Review                                          |
| ----------------------- | ------------------------- | ----------------------------------------------- |
| `cold()`                | `cold()`                  | Producer-per-subscription compatibility         |
| `hot()`                 | `hot()`                   | Subject-like absolute timeline                  |
| `expectObservable()`    | `expectObservable()`      | Cancellation uses the subscription marble's `!` |
| `expectSubscriptions()` | `expectSubscriptions()`   | `observable()` logs producer activation windows |
| `time()`                | `time()`                  | One normal frame is one virtual millisecond     |
| `animate()`             | `animate()`               | Declare opportunities before time advances      |
| `flush()`               | `await flush()`           | Make the `rxTest` callback `async`              |

When an old case uses TestScheduler methods outside `run`, direct scheduler
state, `frameTimeFactor`, `maxFrames`, or scheduler subclassing, classify it as
a harness rewrite or unsupported/obsolete before changing it.

## Pipeable composition

Start from the RxJS 7 call shape:

```ts
source.pipe(operator(arg1, arg2));
```

The ordinary exact-Symbol mapping is:

```ts
source[operator](arg1, arg2);
```

Convert only against Symbols that actually exist in the installed RxJS Next
surface. Do not assume the RxJS 7 export name and the Next Symbol name are
identical.

```ts
source.pipe(scan(reducer, seed));
```

becomes:

```ts
source[scan](reducer, seed);
```

A sequence:

```ts
source.pipe(map(project), filter(predicate));
```

becomes:

```ts
source[map](project)[filter](predicate);
```

Import the exported Symbols. Do not add string-named RxJS methods. For an
operator that also has a platform string method, keep the contracts distinct:

```ts
source.map(project); // platform contract
source[map](project); // RxJS contract
```

Never replace a missing operator with the platform method merely because the
name matches. Record it as a missing API.

## Unified capabilities and argument adapters

RxJS Next may consolidate several RxJS 7 operators behind one Symbol. Record
the mapping explicitly and adapt only the arguments the Next contract can
represent.

```ts
source.pipe(bufferCount(3));
```

becomes:

```ts
source[buffer]({ maxSize: 3 });
```

Other common mapping shapes include:

```ts
source.pipe(debounceTime(25));
source[debounce](25);

source.pipe(concatMap(project));
source[mergeMap](project, { concurrent: 1 });

source.pipe(switchAll());
source[switchMap]((inner) => inner);
```

Use a project-local capability table with at least:

| Field             | Meaning                                                            |
| ----------------- | ------------------------------------------------------------------ |
| RxJS 7 API        | Imported operator or function                                      |
| Next target       | Exact or unified Symbol, static Symbol, or ambient construction    |
| Argument adapter  | Mechanical transformation of supported arguments                   |
| Status            | Exact, partial unified, platform mapping, or missing               |
| Unsupported forms | Legacy overloads or scheduler arguments that cannot be represented |

Do not hide partial support. For example, `bufferCount(size)` can use
`[buffer]({ maxSize: size })`, while overlapping
`bufferCount(size, startBufferEvery)` remains a runnable parity case expected
to expose the unsupported behavior.

## Creation functions

Prefer a static RxJS Next Symbol when one exists. When the Next contract
intentionally uses the ambient platform constructor, write the construction
against global `Observable`:

```ts
of(a, b, c);
Observable.from([a, b, c]);

empty();
Observable.from([]);

firstValueFrom(source);
source.first();

lastValueFrom(source);
source.last();
```

Do not import `Observable` from a polyfill to make these mappings work.
Document missing scheduler, default-value, or overload behavior alongside the
executable mapping.

## Time-based operators

`rxTest` virtualizes supported host scheduling APIs. A scheduler argument can
be removed only when the RxJS Next API is documented to schedule through that
host boundary. Otherwise classify the case as compatibility-only, a harness
rewrite, or missing API.

Do not mechanically convert:

- scheduler identity assertions;
- direct inspection of scheduler queues or frames;
- custom scheduler subclasses;
- expectations whose only purpose is an RxJS 7 scheduler implementation
  detail.

## Errors and assertions

Preserve the original error object or value passed to `toBe`. Keep non-marble
assertions in their existing library. If `rxTest` uses a custom deep-equality
adapter, configure it once at the test boundary rather than rewriting every
expected message.

## Higher-order values

Keep inner marble sources as values when the test asserts a higher-order
Observable. Confirm that the Next matcher materializes test sources in the same
way. If operator sharing changes when an inner producer is activated, add a
separate platform expectation rather than changing the cold baseline.
