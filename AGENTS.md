# RxJS Next repository guidance

This branch is the foundation for a new platform-based generation of RxJS, with
the working name **RxJS Next** and a probable release name of **RxJS 9**. It is
not an incremental RxJS 7 implementation.

Before making changes, read these documents in order:

1. `docs/rxjs-next/PROJECT_CHARTER.md`
2. `docs/rxjs-next/ARCHITECTURE.md`
3. `docs/rxjs-next/DECISIONS.md`
4. `docs/rxjs-next/PROJECT_PLAN.md`
5. `docs/rxjs-next/OPEN_QUESTIONS.md`
6. `docs/rxjs-next/COMPATIBILITY.md` when changing APIs or behavior

## Required working rules

- Treat the current code as an exploratory implementation, not the completed
  architecture. Preserve the distinction between current behavior, accepted
  direction, and proposals.
- Use the native web-platform `Observable` when it exists. A polyfill must not
  replace a conforming native implementation.
- Add RxJS behavior to the platform constructor or its prototype through
  exported Symbols. Do not add string-named RxJS methods to the platform
  `Observable` surface.
- Export corresponding RxJS Symbols even for operators that already have a
  platform string method, such as `map` and `filter`. Preserve both forms:
  `observable.map(project)` is the platform contract and
  `observable[map](project)` is the RxJS contract. The Symbol form may delegate
  or add functionality, but it must not replace the string method; document and
  test every intentional difference.
- Preserve the collision isolation of exact Symbol keys: unrelated code using
  the same descriptive name must not be able to overwrite an RxJS extension.
  Do not introduce `Symbol.for` keys without an accepted namespacing and
  duplicate-install decision.
- Keep platform semantics and RxJS 7 compatibility semantics in separate
  architectural layers. In particular, do not silently make the platform
  `Observable` behave like an RxJS 7 cold observable.
- Use `AbortSignal` and the platform `Subscriber` lifecycle as the cancellation
  foundation for the platform layer.
- Do not assume the old RxJS 7 tests can pass unchanged. Classify every migrated
  test according to the compatibility policy in `COMPATIBILITY.md`.
- Do not revive removed RxJS 7 internals in the platform package to make a test
  pass. Put compatibility behavior behind an explicit compatibility boundary.
- When implementing against the living Observable specification or Web
  Platform Tests, record the exact upstream revision used.
- Preserve RxJS 7 history. The old implementation remains an important source
  of behavioral tests, migration knowledge, and compatibility requirements.

## Project-plan discipline

`docs/rxjs-next/PROJECT_PLAN.md` is the active execution queue. Work on the
single item marked `NEXT` unless the user explicitly changes priorities or a
small prerequisite is required. Keep exactly one `NEXT` item, update the
completion evidence, and append a short session-log entry when completing a
plan item.

## Architecture-change discipline

Update the documentation in the same change when code alters any of these:

- package or import boundaries;
- native-versus-polyfill selection;
- Symbol identity or patch installation;
- subscription sharing, ref counting, cancellation, or teardown;
- subclass or realm behavior;
- compatibility guarantees;
- public exports;
- test or conformance gates.

Record durable decisions in `docs/rxjs-next/DECISIONS.md`. Move unresolved
questions into or out of `docs/rxjs-next/OPEN_QUESTIONS.md` as evidence changes.

## Verification

Run the narrowest relevant tests and build/type checks. Record failures
honestly; do not treat a passing unit test as proof of platform conformance.
The current known baseline is documented in `ARCHITECTURE.md`.
