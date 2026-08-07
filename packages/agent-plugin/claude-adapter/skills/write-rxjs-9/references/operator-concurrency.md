# Operator concurrency in RxJS 9

Choose a higher-order policy from what should happen when a new outer value
arrives while inner work is active.

| Requirement        | RxJS 9 form                              | New value while active            | Primary risk                           |
| ------------------ | ---------------------------------------- | --------------------------------- | -------------------------------------- |
| Replace stale work | `[switchMap](project)`                   | abort oldest active work          | cancellation of work that must finish  |
| Queue work         | `[mergeMap](project, { concurrent: 1 })` | buffer until prior work completes | unbounded queue growth                 |
| Overlap with a cap | `[mergeMap](project, { concurrent: n })` | buffer beyond `n`                 | resource pressure and retained backlog |
| Ignore while busy  | `[exhaustMap](project)`                  | drop new value                    | missed intent                          |

There is no separate RxJS 7-style `concatMap` pipeable contract. Queueing is
the `mergeMap` Symbol with `concurrent: 1`.

## Replacement

```ts
import { switchMap } from 'rxjs/switch-map';

const detail = selectedIds[switchMap]((id) => repository.load(id));
```

RxJS 9 cancellation is signal-based. `switchMap` aborts the controller for the
oldest active inner when it reaches its concurrency limit. With the default
`concurrent: 1`, that is the familiar latest-only policy.

`switchMap` also accepts `{ concurrent: n }`: up to `n` inners may be active;
when another begins, the oldest active inner is aborted. Use this only when
“keep the newest N” is truly the requirement.

## Queueing and overlap

```ts
import { mergeMap } from 'rxjs/merge-map';

const orderedWrites = writes[mergeMap](persist, { concurrent: 1 });
const boundedReads = reads[mergeMap](load, { concurrent: 6 });
```

`mergeMap` buffers outer values after the concurrency cap is reached. The cap
bounds active work, not the pending buffer. If the input is unbounded, add a
backpressure, coalescing, rejection, or dropping policy at the domain boundary.

Avoid the default `Infinity` for unconstrained external I/O:

```ts
// Bad: a burst can create one request per value with no resource ceiling.
const results = inputs[mergeMap](queryRemoteService);
```

## Ignoring while active

```ts
import { exhaustMap } from 'rxjs/exhaust-map';

const submitted = submitClicks[exhaustMap](() => submitForm(snapshotForm()));
```

This is appropriate when a repeated click during an active submission is
redundant. It is wrong when every click represents durable work. The optional
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
import { catchError } from 'rxjs/catch-error';

const results = queries[switchMap]((query) =>
  api.search(query)[catchError]((error) => Observable.from([{ kind: 'failed' as const, error }]))
);
```

Placing `[catchError]` after `[switchMap]` replaces the entire outer stream
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
