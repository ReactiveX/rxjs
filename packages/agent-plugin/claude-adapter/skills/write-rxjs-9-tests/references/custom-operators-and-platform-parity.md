# Custom operators and platform parity tests

## Exact Symbol contract

For a public custom operator, test:

- the exported exact Symbol works;
- another `Symbol()` with the same description does not;
- no string-named method was installed;
- source error/completion are forwarded;
- user callback/setup throws become output errors;
- owner abort reaches upstream;
- synchronous/reentrant order is correct; and
- mutable state is isolated per activation.

## Receiver lifecycle preservation

Invoke the operator on both a platform Observable and `ColdObservable`.
Platform results should share one active producer; cold results should create
one producer per direct subscription. This proves the implementation used
public `[create]` rather than always constructing `new Observable`.

## Early termination

Use a synchronous source that counts work after each emission. An operator such
as `[take](1)` should cancel upstream before avoidable iterations continue.
Assert the work count and teardown order, not only the single delivered value.

## Native/fallback parity

When code claims web-platform behavior, run the same focused contract against:

- the packaged conforming fallback; and
- a supported conforming native Observable environment when available.

Keep realm setup isolated. Confirm RxJS does not replace the native
constructor. Test exact Symbols, shared activation, cancellation, terminal
order, and input conversion relevant to the feature.

Passing package tests is not WPT conformance. Do not use model-backed or paid
qualification as a release gate.
