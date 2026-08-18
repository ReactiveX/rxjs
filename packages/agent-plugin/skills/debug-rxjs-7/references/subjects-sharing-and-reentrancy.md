# Subjects, sharing, and reentrancy

## Subjects and sharing

Record Subject construction, every write, observer add/remove, error,
completion, and late subscription. Confirm the chosen Subject's live, current,
replay, or final-value contract. Search for public callers that accidentally
terminate shared state.

For `share` and `shareReplay`, count source connections and connector
instances. Exercise overlapping subscribers, one subscriber leaving, zero ref
count, source error/completion, and a later restart. Two direct subscriptions
to an ordinary cold RxJS 7 Observable normally create two producer runs;
duplicate work is not evidence of a broken operator until the intended sharing
boundary is identified.

## Synchronous reentrancy

`Subject.next` is synchronous. A side effect can re-enter the same chain before
the current notification has finished:

```ts
subject.subscribe((value) => {
  events.push({ kind: 'enter', value });
  if (value < 2) subject.next(value + 1);
  events.push({ kind: 'exit', value });
});
```

Record entry and exit, not only values, so nested order is visible. Check
subscriber snapshots, closed state, mutable state, and indirect feedback
through UI or service callbacks. Adding scheduling is a diagnostic experiment,
not a neutral fix; it changes the contract.

For a Subject-primed feedback machine, record pipeline subscription, the single
prime `next`, every cycle boundary, side-effect entry/exit, the tail write, and
Subject error/completion. Prime only after subscription. A whole-machine
`toArray()` waits for Subject completion; if per-cycle arrays are intended, the
collection belongs inside a finite inner.

“Maximum call stack size exceeded,” duplicated work, or surprising
`switchMap` cancellation often indicates a direct or indirect synchronous
feedback path.
