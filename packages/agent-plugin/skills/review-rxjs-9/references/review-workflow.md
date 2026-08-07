# RxJS 9 review workflow

For every source and derived Observable, record:

- platform constructor or `ColdObservable` receiver;
- producer start, concurrent joining, final-observer close, and restart;
- exact imported Symbols and public subpaths;
- cancellation owner and joined signals;
- ObservableValue input category;
- ordering, concurrency, and buffering;
- error, completion, and teardown behavior;
- Subject/replay/reset ownership; and
- tests that demonstrate those claims.

Trace setup upstream and notifications downstream. Follow every higher-order
inner, notifier, combination input, retry/repeat activation, recovery source,
and custom resource.

## Review reachable edge cases

Check ordinary values, source error, completion, owner abort, final concurrent
observer removal, later restart, synchronous setup failure, callback throw,
and downstream reentrancy. For lifecycle-selecting APIs, compare platform and
producer-per-direct-subscription receivers.

## Classify findings

- **Confirmed bug:** reachable behavior contradicts an accepted requirement.
- **Risk:** a plausible scenario depends on missing evidence or undocumented
  intent.
- **Design tradeoff:** behavior is valid but costs memory, work, cancellation,
  or API flexibility.
- **Readability:** policy is correct but difficult to verify.

Do not flag platform sharing merely because RxJS 7 behaved differently. Do
flag code, docs, or tests that claim independent production when the receiver
actually shares one active producer.

## Finding format

Include line, scenario, actual behavior, impact, smallest safe fix, and the
test needed. Example:

> `clock-service.ts:18` — Both dashboard subscribers observe this same platform
> Observable concurrently, so only one producer initializer runs. The code
> stores observer-specific mutable state in that initializer and documents
> independent clocks. Use `ColdObservable` if independent clocks are required,
> or move state to the shared producer contract; test two overlapping
> subscribers and a later restart.
