# Testing concurrency, sharing, and errors in RxJS 7

## Higher-order domain contracts

Do not re-test RxJS's flattening operators in application tests. Drive the
public feature and prove its contract: every successful deletion updates the
view, a duplicate “Place order” click is blocked until settlement, stale search
results cannot render, or declared parallel work stays within the
application's resource limit. Use inner subscription windows only when they
are necessary evidence for that behavior.

For a custom operator, test the operator's own documented ordering,
cancellation, terminal behavior, and teardown. If it delegates to `concatMap`,
`mergeMap`, `exhaustMap`, or `switchMap`, do not duplicate the library's tests
unless the wrapper adds or promises behavior at that boundary.

Test completion with active inner work; most higher-order outputs wait for
accepted inners after the outer completes.

## Recovery scope

Prove that an inner failure does not terminate a long-lived outer interaction:

```ts
scheduler.run(({ cold, hot, expectObservable }) => {
  const refreshMarbles = '  a---b---|';
  const failedMarbles = '       -#';
  const successMarbles = '          -x|';
  const expectedMarbles = ' -f---x--|';
  const refresh = hot(refreshMarbles);
  const failed = cold(failedMarbles);
  const success = cold(successMarbles, { x: 'ready' });

  const result = refresh.pipe(switchMap((value) => (value === 'a' ? failed : success).pipe(catchError(() => of('failed')))));

  expectObservable(result).toBe(expectedMarbles, { f: 'failed', x: 'ready' });
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

For a controller API, run the same behavior contract whether the boundary is a
class method plus Observable property or a readonly `[command, observable]`
tuple returned by a factory. Test encapsulation through public behavior; do not
reach into the private Subject.
