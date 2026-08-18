# Errors, completion, and Promise consumers in RxJS 9

An Observable sends zero or more values followed by at most one terminal
notification. Cancellation closes observation without sending `error` or
`complete` to the observer.

## Recover only where the interaction can continue

```ts
const state = refreshes.switchMap(() =>
  repository
    .load()
    .map((value) => ({ kind: 'ready' as const, value }))
    .catch((error) => Observable.from([{ kind: 'failed' as const, error: toDisplayError(error) }]))
);
```

Avoid an outer recovery boundary when later refreshes must remain possible:

```ts
// Bad for a persistent interaction: the first failure replaces and completes
// the whole refresh stream.
const state = refreshes.switchMap(() => repository.load()).catch(() => Observable.from([]));
```

Do not turn every error into an ordinary value. Preserve the error channel when
the caller owns recovery or needs to distinguish failure from empty data.

## Retry creates another source activation

```ts
import { retry } from 'rxjs/retry';

const config = loadConfig()[retry]({
  count: 2,
  delay: (_error, retryCount) => Observable.from(wait(retryCount * 250)),
  resetOnSuccess: true,
});
```

Retry repeats source side effects. Use it only when repeating is safe or
protected by idempotency. Keep `count` finite for remote work and consider
whether `resetOnSuccess: true` is intended: a successful value restores the
retry budget.

Avoid the unbounded default on a permanently failing synchronous source:

```ts
// Bad: can resubscribe without a stopping condition.
const config = loadConfig()[retry]();
```

## Completion controls coordination

- `[mergeMap](..., { concurrent: 1 })` advances queued work when an inner
  completes.
- `[forkJoin]` waits for every accepted input to complete and requires values
  according to its contract.
- `[repeat]` creates another activation after completion.
- The platform `last()` Promise cannot settle until completion.
- A never-completing source can hold a queue, join, or Promise indefinitely.

Review completion separately from “no more values expected right now.”

## Distinguish Observable operators from Promise consumers

RxJS exposes exact `[first]` and `[last]` Symbols that return Observables. The
platform also exposes string-named `first()` and `last()` methods that return
Promises. Choose by the boundary you need:

```ts
import { first } from 'rxjs/first';

const firstValidStream = values[first](isValid); // Observable<Value>
const firstValidValue = await firstValidStream.first(); // Promise<Value>
```

Bound Promise consumers with an operator, a subscription signal, or both:

```ts
import { timeout } from 'rxjs/timeout';

const value = await source[timeout]({ first: 5_000 }).first({
  signal: request.signal,
});
```

Avoid awaiting `last()` on an application-long stream or `first()` on a stream
that may remain silent without a timeout or owner signal.

## Understand error ownership

- Producer setup exceptions become source errors.
- Errors thrown by operator user callbacks become output errors when the
  operator follows the public construction contract.
- Errors thrown by observer callbacks are reported to the host; they are not
  sent upstream and cannot be recovered by `.catch(...)` or `[catchError]`.
- An error sent after a Subscriber has closed is a host-reporting concern, not
  a second terminal notification.

Every terminal subscription needs an error policy appropriate to its owner.
Keep recoverable errors inside composition; use a terminal error callback for
reporting or fatal boundary behavior.
