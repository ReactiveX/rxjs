# Behavior-preserving optimization patterns

## Stabilize pipeline identity

```ts
// Bad: each render builds and often subscribes to a fresh pipeline.
function render() {
  return input$.pipe(map(expensive), shareReplay(1));
}

// Better when the component instance is the owner.
const result$ = input$.pipe(map(expensive), shareReplay({ bufferSize: 1, refCount: true }));
```

Verify reset/retention requirements before adopting this RxJS 7 example.

## Bound active work

```ts
// Bad for bursty external I/O.
const results$ = ids$.pipe(mergeMap(load));

// Candidate with measured service capacity.
const results$ = ids$.pipe(mergeMap(load, 8));
```

This does not bound the pending queue. Add a domain overload policy if needed.

RxJS 9 uses `[mergeMap](load, { concurrent: 8 })`.

Start from sequential `concatMap` (RxJS 7) or platform `.flatMap()` (RxJS 9)
unless profiling and the downstream service justify parallelization. Increasing
concurrency changes ordering and resource use; it is not a free speedup.

## Avoid duplicate calculation

```ts
// Bad: each branch repeats a costly pure transform.
const labels$ = values$.pipe(map(parse), map(toLabel));
const totals$ = values$.pipe(map(parse), map(toTotal));

// Candidate when both consumers intentionally share the same parsed stream.
const parsed$ = values$.pipe(map(parse), share());
```

Review late subscribers, producer sharing, and error/reset behavior. Sharing is
not a free memoization switch.

## Coalesce replaceable input

```ts
const results$ = search$.pipe(debounceTime(150), distinctUntilChanged(), switchMap(searchApi));
```

Use only when intermediate search terms have no independent value. Confirm the
underlying request honors cancellation. Do not apply this pattern to
state-changing work whose every success/error must update client state.

## Reduce retained replay payload

Project large response objects to the stable state consumers need before
placing them in a replay/current-state boundary. Preserve identity/equality
semantics and make lost detail intentional.

## Reject semantic shortcuts

Do not replace queueing with latest-only, remove error handling, share a cold
source globally, or drop replay merely for a favorable benchmark without owner
approval and updated contract tests.
