# Testing concurrency, sharing, and errors in RxJS 7

## Higher-order policies

For `switchMap`, test an overlapping inner and assert the first subscription
ends when the second begins. For `concatMap`, assert one active inner, order,
and that queued input waits. For bounded `mergeMap`, assert the maximum active
count and buffered release. For `exhaustMap`, include a trigger that is
deliberately ignored.

Test completion with active inner work; most higher-order outputs wait for
accepted inners after the outer completes.

## Recovery scope

Prove that an inner failure does not terminate a long-lived outer interaction:

```ts
scheduler.run(({ cold, hot, expectObservable }) => {
  const refresh = hot('  a---b---|');
  const failed = cold('   -#');
  const success = cold('      -x|', { x: 'ready' });

  const result = refresh.pipe(switchMap((value) => (value === 'a' ? failed : success).pipe(catchError(() => of('failed')))));

  expectObservable(result).toBe('-f---x--|', { f: 'failed', x: 'ready' });
});
```

Also test the final error when retry is exhausted, cancellation during delay,
and exact source subscription count.

## Sharing and ref counting

For `share`/`shareReplay`, cover:

- overlapping subscribers use one source subscription;
- a late subscriber sees the intended live/replayed values;
- one subscriber leaving does not disconnect while another remains;
- zero ref count disconnects or retains according to policy;
- error and completion reset exactly as configured; and
- later subscription restarts or receives retained terminal state as intended.

Use source subscription assertions plus direct late-observer tests when replay
and reentrancy are easier to see imperatively.

## Subjects

Test live values, late subscriber behavior, reentrant feedback, explicit
completion/error, and late terminal subscribers. For `BehaviorSubject`, test
the required current value; for `ReplaySubject`, test size/time retention; for
`AsyncSubject`, test final value only on completion.

Do not expose a writable Subject merely to make a test easy. Exercise the
public read/control boundary.
