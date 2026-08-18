# Subjects, sharing, and reentrancy

## Subjects and active producers

Record Subject construction, each write, observer add/remove, source activation,
error/completion, abort, and late subscription. Confirm live, current, replay,
or final-value semantics match the Subject type.

For a platform Observable, count active producer runs rather than assuming
RxJS 7 cold behavior. Overlapping observers share an active producer, one
observer leaving does not stop it while another remains, and a late observer
joins from now. A `ColdObservable` creates a producer per direct subscription.
An RxJS `[shareReplay]` wrapper cannot make an already-active platform
initializer replay its history independently to a late observer.

## Synchronous reentrancy

A Subject write and a synchronous initializer can re-enter the same chain
before the current callback exits:

```ts
subject.subscribe((value) => {
  events.push({ kind: 'enter', value });
  if (value < 2) subject.next(value + 1);
  events.push({ kind: 'exit', value });
});
```

Record callback entry and exit, exact nested order, subscriber `active` state,
observer snapshots, and indirect feedback through UI/service callbacks.
Scheduling is a behavior-changing experiment, not a neutral correction.

For a Subject-primed “snake eating its tail” machine, record pipeline
subscription, the single prime `next`, each finite inner result, side-effect
entry/exit, the tail write, and Subject error/completion versus owner abort.
Prime only after subscription. If a whole-machine `[toArray]` waits forever,
move collection to the finite inner when per-cycle arrays are intended.

“Maximum call stack size exceeded,” duplicate activations, or unexpected
`switchMap` replacement often reveals a direct or indirect synchronous
feedback path.
