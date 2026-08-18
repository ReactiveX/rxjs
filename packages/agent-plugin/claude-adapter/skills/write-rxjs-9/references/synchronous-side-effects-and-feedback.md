# Synchronous side effects, reentrancy, and feedback in RxJS 9

## Contents

- [Assume a call can reenter](#assume-a-call-can-reenter)
- [Subject-primed feedback machines](#subject-primed-feedback-machines)
- [Define the terminal controls](#define-the-terminal-controls)
- [Bound and test the loop](#bound-and-test-the-loop)

## Assume a call can reenter

Platform Observable and Subject notifications may be synchronous. `subscribe`,
`Subject.next`, `Subject.error`, `Subject.complete`, operator callbacks, and
subscriber handlers can run user code before the initiating call returns.

Treat every call into application or user-supplied code as a possible reentry
boundary. It may directly or indirectly write to the same Subject, dispatch an
event that reaches the source, subscribe again, abort the current owner, or
terminate the chain. Code after `subject.next(value)` runs after all nested
synchronous work, not before it.

Commit state invariants before publishing:

```ts
function publishState(next: State): void {
  currentState = next;
  stateChanges.next(next); // A downstream handler may call publishState again.
}
```

Do not expose half-updated state across the notification boundary:

```ts
function publishState(next: State): void {
  stateChanges.next(next); // Bad: reentrant code still sees the old state.
  currentState = next;
}
```

An operator such as `[tap]` does not make a side effect passive or safe. A
logger, renderer, store dispatch, event emitter, or callback can synchronously
reenter even when it does not visibly call the Subject in the same function.
State inside a platform pipeline belongs to its shared active producer, so
concurrent observers may see the consequence of the same reentrant transition.

## Subject-primed feedback machines

A Subject can form the input and feedback edge of a reactive machine—the
“snake eating its tail” pattern. Subscribe before the first input because a
plain Subject does not retain an unobserved seed. Then prime the machine once:

```ts
import { Subject } from 'rxjs';

const cycleInput = new Subject<void>();
const machineOwner = new AbortController();

const machine = cycleInput
  .asObservable()
  .map(() => readCycleInput())
  .flatMap((input) => runCycle(input).toArray());

machine.subscribe(
  {
    next(results) {
      handleResults(results);

      if (shouldContinue(results)) {
        cycleInput.next();
      } else {
        cycleInput.complete();
      }
    },
    error: reportMachineError,
  },
  { signal: machineOwner.signal }
);

cycleInput.next(); // Prime only after the machine has subscribed.
```

The `asObservable()` view keeps the writable feedback port private and gives
the platform methods an ordinary Observable receiver. Only the machine
controls the Subject terminal state and the next cycle.

The finite inner cycle is collected with its platform `.toArray()` Promise,
which `.flatMap()` accepts as an `ObservableValue`. Calling `.toArray()` on the
Subject-rooted machine would wait for the machine input itself to complete, so
no result would be available to trigger the next cycle.

Sequential platform `.flatMap()` is the safe baseline when every cycle must
finish. `.switchMap()` or exact `[switchMap]()` is valid only when a new input
should replace the active cycle. A reentrant `cycleInput.next()` can otherwise
abort an inner while its notification is still on the stack. Use `[mergeMap]`
only for intentional parallel cycles and `[exhaustMap]` only when inputs during
an active cycle must be ignored.

## Define the terminal controls

`cycleInput.complete()` cleanly closes the input side. A sequential flattener
finishes already accepted work before the machine output completes.
`cycleInput.error(error)` faults the input and cancels active work through the
error path. Aborting `machineOwner` is owner cancellation; it stops this
observation and its upstream work but does not itself put the Subject into a
completed or errored state for other observers.

Keep the Subject private and expose named `start`, `complete`, `error`, or
domain-specific commands. Ensure exactly one part of the design owns the
feedback write: if `handleResults` can indirectly request another cycle, an
additional unconditional `cycleInput.next()` may double-trigger the machine.

## Bound and test the loop

For a fully synchronous loop, every feedback write can add another JavaScript
stack frame unless the chosen operator queues it. Require a reachable stop
condition, bounded queue/parallelism, and explicit behavior for error,
completion, and owner abort. Test nested enter/exit order, state visibility
during callbacks, one prime, repeated cycles, and both Subject terminal paths.
Add a host scheduling boundary only when delayed behavior is part of the
contract; it changes ordering, cancellation, and error delivery.
