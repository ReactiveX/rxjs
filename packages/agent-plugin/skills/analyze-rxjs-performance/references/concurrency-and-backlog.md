# Concurrency and backlog analysis

Measure at least:

- source arrival rate;
- inner service time;
- active inner count;
- pending queue/buffer size and retained bytes;
- cancellation/drop count;
- completion/error rate; and
- end-to-end latency percentiles.

## Policies have different costs

- Queueing (`concatMap` in RxJS 7 or platform `.flatMap()` in RxJS 9) is the
  safe, easy-to-reason-about default; backlog grows when arrival exceeds
  service rate.
- Overlap (`mergeMap` / `[mergeMap]`) trades resources for throughput; a
  concurrency cap does not itself bound the pending queue. Use it for measured
  parallelization, not as a generic queue replacement.
- Ignore (`exhaustMap` / `[exhaustMap]`) can lock an action such as “Place
  order” until active work settles; verify dropped actions are safe.
- Replacement (`switchMap` / `.switchMap()` / `[switchMap]`) is powerful for
  streaming-source changes, disposable reads, and process start/stop, but can
  waste underlying operations that do not honor cancellation.

Do not recommend replacement as a throughput optimization for writes. A
server-side deletion may finish after its success observation is canceled,
leaving a client view that never applied that deletion.

## Backlog math

If sustained arrival rate exceeds sustainable completion rate, no operator
spelling removes the mismatch. Choose a domain policy:

- reject excess work;
- coalesce to latest state;
- sample/debounce/throttle;
- drop by priority/age;
- bound the queue and surface overload;
- apply upstream flow control; or
- increase service capacity.

Do not recommend “increase concurrency” without measuring the downstream
system; it can increase contention and tail latency.

## Cancellation must reach the resource

Observation cancellation can remove an inner subscriber while a Promise,
request, worker, or database operation continues. Instrument the underlying
resource signal/cancel call. Otherwise a “latest only” pipeline can still run
all old work and merely discard results.

## Completion and stuck slots

A never-completing inner can permanently occupy a queue/concurrency slot. A
recovery branch that never completes can do the same. Inspect active inner age
and terminal paths, not only counts.
