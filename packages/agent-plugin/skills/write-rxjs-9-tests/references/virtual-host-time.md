# Virtual host time with `@rxjs/test`

`rxTest` redirects supported scheduling APIs in the realm for the callback's
complete async lifetime. This lets RxJS work and ordinary application host-
timer work share deterministic virtual time.

## Timers and clocks

`setTimeout`, `setInterval`, `Date`, `Date.now`, and `performance.now` follow
virtual time. Configure an epoch with `startTime` while elapsed context time
still begins at zero.

```ts
await rxTest(
  async ({ advanceTo, now }) => {
    const values: number[] = [];
    setTimeout(() => values.push(Date.now()), 12);

    await advanceTo(12);
    expect(now()).toBe(12);
    expect(values).toEqual([1_012]);
  },
  { startTime: 1_000 }
);
```

## Direct controls

- `schedule(work, delay, { signal })` returns a cancellable virtual task.
- `advanceBy(duration)` moves relative time.
- `advanceTo(time)` moves to an absolute timestamp.
- `flush()` drains finite work and evaluates current expectations.
- `now()` reports elapsed virtual milliseconds.

## Animation and idle opportunities

Call `animate(plan)` or `idle(plan, options)` once at time zero before work
depends on those opportunities. Assert `requestAnimationFrame` and
`requestIdleCallback` ordering rather than restoring scheduler arguments.

## Microtasks and signals

Microtasks run between same-time timer callbacks according to the test realm.
`AbortSignal.timeout` follows virtual time. Test the actual ordering when a
pipeline mixes Promises, timers, and synchronous emissions.

## Safety bounds

Use `maxVirtualTime` and `maxTaskExecutions` to diagnose never-ending or self-
scheduling work. `rxTest` rejects nested calls, serializes access to its realm,
restores globals after success/failure, and fails when observations or finite
work remain open unexpectedly.
