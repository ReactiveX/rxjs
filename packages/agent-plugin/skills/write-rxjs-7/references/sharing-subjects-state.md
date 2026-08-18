# Sharing, Subjects, and state in RxJS 7

Sharing is a lifetime and retention policy, not a routine optimization. Before
multicasting, decide:

1. whether subscribers should share one producer;
2. when that producer starts and stops;
3. which past notifications late subscribers receive;
4. what happens after error or completion; and
5. whether retained values have a bounded lifetime.

## Make the reset policy visible

Use `share` when the lifecycle needs to be explicit:

```ts
const profile$ = defer(() => api.loadProfile()).pipe(
  share({
    connector: () => new ReplaySubject<Profile>(1),
    resetOnError: true,
    resetOnComplete: false,
    resetOnRefCountZero: true,
  })
);
```

This example shares an in-flight request, replays one successful result while
the shared subject remains alive, permits a fresh attempt after an error, and
disconnects when the last subscriber leaves before completion. Confirm those
semantics match the product; do not copy the configuration mechanically.

Avoid adding replay as a vague cache:

```ts
// Bad: retention, reset, and producer-lifetime requirements are unexplained.
const profile$ = api.loadProfile().pipe(shareReplay(1));
```

`shareReplay({ bufferSize: 1, refCount: true })` is appropriate when its exact
RxJS 7 reset behavior is the desired contract. Reach for configurable `share`
when error, completion, or ref-count resets need independent control.

## Keep write authority narrow

Expose an Observable rather than a writable Subject:

```ts
class SearchController {
  private readonly queryInput = new Subject<string>();

  readonly query$ = this.queryInput.asObservable();

  setQuery(query: string): void {
    this.queryInput.next(query.trim());
  }
}
```

Avoid publishing the Subject itself:

```ts
// Bad: every consumer can bypass validation, terminate the stream, or inject
// state from an arbitrary lifetime.
readonly query$ = new Subject<string>();
```

A closure-backed factory is equally valid when a class is unnecessary:

```ts
function createQueryInput() {
  const input = new Subject<string>();
  const setQuery = (query: string) => input.next(query.trim());
  return [setQuery, input.asObservable()] as const;
}
```

Review the same contract in either form: the Subject stays private, the command
validates writes, and the Observable is read-only. Prefer a class when shared
prototype methods, nominal identity, or a broader object API are useful;
prefer the tuple factory for a small composable command/result boundary.

Name Subjects for the fact that they accept input (`queryInput`, `destroyed`,
`refreshRequested`) rather than adding `Subject` to every domain name.

## Choose a state representation deliberately

- Use a plain value when no reactive subscription is required.
- Use a derived Observable when state can be computed from existing sources.
- Use `scan` for event-driven transitions with an explicit reducer.
- Use `BehaviorSubject` when synchronous current-value access and a required
  initial value are genuinely part of the API.
- Use `ReplaySubject` when replaying a bounded notification history is the API.
- Use `AsyncSubject` for one final value on completion, not as a general cache.

Prefer a state machine over scattered imperative writes:

```ts
type Event = { type: 'incremented' } | { type: 'reset'; value: number };

const count$ = events$.pipe(
  scan((count, event) => {
    switch (event.type) {
      case 'incremented':
        return count + 1;
      case 'reset':
        return event.value;
    }
  }, 0),
  distinctUntilChanged()
);
```

Avoid using a `BehaviorSubject` as a mutable variable with a broadcast side
effect when the transitions matter:

```ts
// Bad under reentrancy or concurrent event sources: read-modify-write policy
// is distributed across callers.
count.next(count.value + 1);
```

## Watch retention and identity

Replay buffers retain object graphs. Bound both buffer size and, when useful,
time. Do not place unbounded `ReplaySubject` instances or `shareReplay` caches
on application-long singletons without an explicit memory budget.

`distinctUntilChanged` compares by `===` by default. Mutating and re-emitting
the same object can suppress an important transition; continually allocating
equivalent objects can cause needless work. Prefer immutable state transitions
and a comparison policy that matches the domain.

## Do not share away required isolation

A cold producer gives each direct subscription its own execution. Sharing it
can couple cancellation, retries, side effects, and timing between otherwise
independent callers. Confirm shared identity is part of the API before adding
`share` or `shareReplay`.
