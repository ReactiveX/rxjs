# RxJS 9 review testing evidence

Match tests to the lifecycle claim:

- **Platform sharing:** two overlapping observers, one initializer, late join,
  one observer abort, final observer abort, and later restart.
- **Cold production:** two direct subscriptions, distinct producer runs and
  teardowns.
- **Symbol identity:** exact imported key works; same-description key does not;
  string method remains separate.
- **Construction:** platform and `ColdObservable` receivers produce their
  intended runtime lifecycle.
- **Cancellation:** owner abort reaches the actual resource; late continuations
  do not notify.
- **Terminal order:** teardown/abort occurs before reentrant error or complete
  callbacks where required.
- **Input conversion:** each supported category plus refusal/adaptation of a
  legacy arbitrary subscribable.
- **Sharing/replay:** late direct observer, connector reset, zero ref count,
  completion, error, and platform replay limitation.
- **Custom operator:** values, source terminals, owner abort, callback throw,
  setup throw, reentrancy, and per-activation state.
- **Native/fallback:** focused parity in both available environments for any
  platform-semantic claim.

Use `@rxjs/test` with the source model that matches the contract: cold, hot, or
platform lifecycle. A cold marble test does not prove active-producer sharing.
A platform value assertion with one observer does not prove ref counting or
late-join behavior.

Do not require model-backed evaluation. These are deterministic code, type,
fixture, and lifecycle tests.
