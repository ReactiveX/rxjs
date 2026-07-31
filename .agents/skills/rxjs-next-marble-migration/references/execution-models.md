# Execution models

## ColdObservable compatibility

Use the cold model when the claim requires one producer execution per
subscription. Each observer gets a timeline relative to its own subscription,
and subscription logs represent individual observer lifetimes.

This is the closest baseline for ordinary RxJS 7 cold Observable marble tests.
It is not the platform lifecycle.

## Platform Observable

The platform Observable changes producer state over its lifetime and should not
receive one blanket hot/cold label:

- the first observer activates producer work;
- concurrent observers join that work;
- a late observer sees only later notifications;
- one observer can abort without stopping remaining observers;
- the last observer leaving cancels producer work;
- a later observer starts a fresh activation.

Use the `observable()` marble helper for this lifecycle. Its subscription log
describes producer activation windows, not raw observer count.

When constructing a platform Observable directly, use the global:

```ts
const source = new Observable<number>((subscriber) => {
  // producer
});
```

Do not import `Observable` from a polyfill. This lets the same platform case run
against the active fallback or a native implementation.

## Polyfill and native modes

Run the same platform cases against both constructors where possible.
Constructor selection and Symbol installation happen at module evaluation, so
use isolated processes, workers, windows, or iframes:

1. **Polyfill mode:** initialize the fallback in a realm without an active
   native constructor, then load RxJS extensions and tests.
2. **Native mode:** confirm the realm already provides `Observable`, preserve
   it, then load RxJS extensions and tests.

If no native constructor exists, report native mode as skipped. Never install
the fallback and describe that run as native.

## Choosing mode applicability

Run a case in both cold and platform modes when its behavioral claim is
independent of producer multiplicity—for example, a single observer's pure
value transformation.

Keep a case cold-only when it specifically requires independent executions or
legacy subscription behavior.

Add or rewrite a platform case when concurrent observers, late joins, ref
counting, restart, signal cancellation, or producer subscription logs affect
the outcome.
