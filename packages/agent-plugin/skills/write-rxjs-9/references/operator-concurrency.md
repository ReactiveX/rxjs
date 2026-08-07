# Operator concurrency in RxJS 9

Start with platform `.flatMap()`: its sequential queue is the safest default,
is usually easiest to reason about, and needs no RxJS extension import. Choose
another policy only when requirements say what must happen if a new outer
value arrives while inner work is active.

| Requirement        | RxJS 9 form                              | New value while active            | Primary risk                           |
| ------------------ | ---------------------------------------- | --------------------------------- | -------------------------------------- |
| Queue work         | `.flatMap(project)`                      | buffer until prior work completes | unbounded queue growth                 |
| Overlap with a cap | `[mergeMap](project, { concurrent: n })` | buffer beyond `n`                 | resource pressure and retained backlog |
| Ignore while busy  | `[exhaustMap](project)`                  | drop new value                    | missed intent                          |
| Replace stale work | `.switchMap(project)`                    | abort active stale work           | cancellation of work that must finish  |

There is no separate RxJS 7-style `concatMap` pipeable contract. Platform
`.flatMap()` is sequential. The exact `[mergeMap](project, { concurrent: 1 })`
form is useful when a `ColdObservable` result must preserve its lifecycle.

## Replacement

```ts
const detail = selectedIds.switchMap((id) => repository.load(id));
```

RxJS 9 cancellation is signal-based. The platform `switchMap` method aborts
the active inner when a replacement arrives. Prefer this form for ordinary
latest-only work; it needs no RxJS operator extension import in a browser-native
implementation.

The exact RxJS `[switchMap]` extension also accepts `{ concurrent: n }`: up to `n` inners may be active;
when another begins, the oldest active inner is aborted. Use this only when
“keep the newest N” is truly the requirement.

```ts
import { switchMap } from 'rxjs/switch-map';

const newestThree = inputs[switchMap](load, { concurrent: 3 });
```

`switchMap` is especially useful for changing long-lived streaming sources,
discarding stale read-only requests, and starting/stopping reactive processes.
It is dangerous for state-changing work. If an endpoint deletes a record and
its success response drives the client view, a replacement can discard an
earlier success even though the server completes that deletion, leaving the
view out of sync.

## Queueing and overlap

```ts
import { mergeMap } from 'rxjs/merge-map';

const orderedWrites = writes.flatMap(persist);
const boundedReads = reads[mergeMap](load, { concurrent: 6 });
```

Use `[mergeMap]` for intentional parallelization. It buffers outer values after
the concurrency cap is reached. The cap
bounds active work, not the pending buffer. If the input is unbounded, add a
backpressure, coalescing, rejection, or dropping policy at the domain boundary.

Avoid the default `Infinity` for unconstrained external I/O:

```ts
// Bad: a burst can create one request per value with no resource ceiling.
const results = inputs[mergeMap](queryRemoteService);
```

## Locking an action while active

```ts
import { exhaustMap } from 'rxjs/exhaust-map';

const submitted = submitClicks[exhaustMap](() => submitForm(snapshotForm()));
```

This is appropriate for an ecommerce “Place order” button when another click
must be ignored until the active order attempt settles. It is wrong when every
click represents durable work. The optional
`concurrent` value means “accept up to N active, then ignore,” not queue.

## Input and completion semantics

Project functions may return an Observable, async iterable, iterable, or
Promise-like value. An arbitrary object with `subscribe()` is not sufficient.
Every policy waits for active accepted inner work before completing its output.

Promise cancellation deserves explicit review: aborting observation prevents
delivery, but cannot magically cancel a Promise whose underlying operation
does not accept a signal. Prefer factories that wire the inner subscriber's
signal to the actual resource.

## Recovery scope

Keep a recoverable inner failure inside the project so the outer interaction
can continue:

```ts
const results = queries.switchMap((query) => api.search(query).catch((error) => Observable.from([{ kind: 'failed' as const, error }])));
```

Placing `.catch(...)` after `.switchMap(...)` replaces the entire outer stream
after the first failure. That may be correct for a one-shot job and is usually
wrong for a long-lived UI interaction.

## Review questions

1. Which work may be canceled, queued, overlapped, or dropped?
2. Is `concurrent` finite, positive, and meaningful for the resource?
3. What bounds the pending buffer?
4. Does completion wait for a source that may never complete?
5. Does inner work observe cancellation, or only suppress its eventual value?
6. Is the error boundary inside or outside at the intended recovery scope?
7. What happens under synchronous inner completion and downstream reentrancy?
