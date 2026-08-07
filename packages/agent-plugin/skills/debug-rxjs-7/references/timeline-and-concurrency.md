# Timeline and concurrency

## A stack is not a timeline

An RxJS 7 stack records only the currently executing synchronous path.
Subscription setup generally travels from the consumer upstream, while a
synchronous notification travels from the source downstream. A scheduler,
Promise, event, timer, or network callback starts a later stack that may no
longer contain the original subscription site.

Use breakpoints for local synchronous questions:

- Which branch did this projector take?
- What value caused this predicate or observer callback to throw?
- Did this custom source register its teardown before emitting?
- Which caller made this particular subscription?

Use an ordered event log for temporal questions:

- Which request completed first?
- Was an inner unsubscribed before it emitted?
- Did two subscribers create two cold producer runs?
- Did a retry or framework remount create the duplicate?
- Did a reentrant `Subject.next` occur inside the same call?

Pausing at a breakpoint serializes work and changes scheduling. That can make a
race disappear. Timeline logging allows concurrency to continue, though the log
also has a smaller timing cost.

## Record enough identity

Give each subscription, producer activation, outer value, inner, and resource a
stable id. Record a monotonic timestamp and an always-increasing sequence
number; the sequence number disambiguates events with the same clock value.

Record values as small immutable snapshots. Browser consoles may display a
live object after it has mutated, and synchronous inspection or serialization
can materially perturb a fast stream.

## Preserve the reproduction contract

Keep source temperature, synchrony, cancellation, and late-subscriber behavior.
Replacing a shared event stream with `of(...)` or a cold HTTP fake can erase
the failure. Vary one dimension at a time:

1. synchronous versus delayed delivery;
2. one versus overlapping input;
3. one versus two subscribers;
4. completion versus explicit unsubscription;
5. inner versus outer error; and
6. current subscriber versus a late subscriber.
