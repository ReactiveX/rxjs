# Timeline and concurrency

## Establish the lifecycle

Before reading output, record:

- whether `globalThis.Observable` is native or the RxJS fallback;
- whether the concrete source is a platform `Observable`,
  `ColdObservable`, or Subject;
- which stages use native string methods and which use exact RxJS Symbols; and
- which AbortController owns each subscription and resource.

An active platform Observable shares one producer among overlapping observers;
a late observer joins the active run from now. A direct `ColdObservable`
subscription creates an independent producer. A string method called on a
`ColdObservable` crosses to the platform lifecycle, while an RxJS Symbol
operator using `[create]` preserves the receiver's construction protocol.

## A stack is not a timeline

A stack captures only the current synchronous path. Source initialization and
synchronous notifications can appear together; a timer, Promise, event,
`queueMicrotask`, or host error report starts a later stack that may not contain
the original subscription call. Native and fallback platform implementations
also have different internal frame names.

Use breakpoints for local setup, branch, or thrown-callback questions. Use an
ordered log for activation sharing, observer joins/leaves, replacement,
parallel inners, abort propagation, restart, and reentrancy. Pausing serializes
concurrent work and can make a race disappear.

## Record enough identity

Give each producer activation, observer, outer input, inner, controller/signal,
and resource a stable id. Record an increasing sequence number, monotonic time,
event kind, and abort reason. Snapshot only the small fields needed for the
hypothesis; console object expansion may show later mutations.

Logging is still an intervention. `console.log`, formatting, source maps, and
DevTools can alter a fast event loop. Compare repeated runs, then reproduce
with logging disabled and removed.
