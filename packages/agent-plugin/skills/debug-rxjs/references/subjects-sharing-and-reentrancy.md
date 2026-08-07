# Subjects, sharing, and reentrancy debugging

## Subject state

Record Subject creation, every write, observer add/remove, error/completion,
and late subscription. Confirm live/current/replay/final-value semantics match
the Subject type and version.

Look for public callers that accidentally complete/error shared state or emit
without passing validation.

## Sharing and reset

Count source connections and connector instances. Exercise:

- overlapping subscribers;
- late subscriber;
- one observer leaving;
- zero ref count;
- source error and completion; and
- later subscriber after each reset state.

In RxJS 9, a platform Observable already shares its active producer and a late
concurrent observer joins from now. `[shareReplay]` cannot make the platform
initializer rerun for that observer. Do not debug that contract as though it
were RxJS 7 `shareReplay`.

## Reentrant feedback

```ts
subject.subscribe((value) => {
  events.push(`seen:${value}`);
  if (value < 2) subject.next(value + 1);
});
```

Record exact nested call order, subscriber snapshots, closed/active state, and
resource teardown. Compare with a scheduled/delayed version only as an
experiment; scheduling changes behavior.

## Mutable state identity

If state appears stuck, check whether the same object is mutated and re-emitted
through `distinctUntilChanged`. If it updates too often, check whether
equivalent objects are reallocated. Fix the state/comparator contract, not the
symptom downstream.
