# RxJS 7 test strategy and style selection

## Use marbles when time is the API

`TestScheduler.run` is strongest for:

- operator notification timing;
- higher-order concurrency and cancellation;
- retries, repeats, delays, debounce/throttle, timeout;
- hot/cold subscription offsets;
- subscription windows and ref counting; and
- custom operators whose output timing is the contract.

Avoid forcing resource spies, complex framework state, or observer callback
errors into marble diagrams when a direct test is clearer.

## Use direct tests for imperative boundaries

Subject-driven or ordinary synchronous tests are often best for services,
state machines, reentrant updates, custom producer teardown, and public API
boundaries:

```ts
const input = new Subject<number>();
const values: number[] = [];
const subscription = serviceResult(input).subscribe((value) => values.push(value));

input.next(1);
input.next(2);
expect(values).toEqual([1, 2]);

subscription.unsubscribe();
```

Add an error handler when error behavior is not the subject of the test so an
unexpected error fails at the boundary rather than disappearing into host
reporting.

## Use fake timers for host/framework clocks

TestScheduler virtualizes RxJS scheduler work participating in its run mode.
It does not automatically make every Promise, DOM callback, framework queue,
animation frame, or third-party timer part of the same virtual clock. Use the
test framework's timer controls when the code under test uses those host APIs,
and verify what that timer implementation does with microtasks.

## Use bounded async tests last

Real async can be appropriate for actual integration with a browser API or
third-party system. Give it a deterministic completion/cancellation bound and
avoid “sleep then expect” timing. Prefer awaiting a visible completion signal
or controlling the dependency.

## Keep one reason to fail

Several focused cases produce better diagnosis than one diagram containing
values, error, retry, sharing, and cancellation simultaneously. Reuse a small
test helper only when it makes lifecycle assertions more visible.
