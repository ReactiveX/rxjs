# Temporary inspect and tap instrumentation

## Prefer the native platform probe when it fits

For an already-platform Observable, `.inspect()` observes the lifecycle without
importing an RxJS operator module:

```ts
let sequence = 0;
const events: Array<Record<string, unknown>> = [];
const record = (stage: string, kind: string, detail?: unknown) => {
  events.push({
    sequence: sequence++,
    at: performance.now(),
    stage,
    kind,
    detail,
  });
};

const debugged = source.inspect({
  subscribe: () => record('source', 'subscribe'),
  next: (value) => record('source', 'next', { id: value.id }),
  error: (error) => record('source', 'error', error),
  complete: () => record('source', 'complete'),
  abort: (reason) => record('source', 'abort', reason),
});
```

`abort` runs for cancellation before a source terminal event. An inspector
callback that throws can error the inspected stream; an `abort` callback error
is host-reported. Keep every diagnostic callback non-throwing.

Calling `.inspect()` on a `ColdObservable` returns a platform Observable and
therefore crosses the direct cold construction boundary. Do not use it when the
bug depends on preserving producer-per-subscription behavior.

## Use the exact RxJS tap Symbol when required

`[tap]` preserves the receiver through `[create]` and exposes
`subscribe`, `unsubscribe`, and `finalize`:

```ts
import { tap } from 'rxjs/tap';

const debugged = source[tap]({
  subscribe: () => record('source', 'subscribe'),
  next: (value) => record('source', 'next', { id: value.id }),
  error: (error) => record('source', 'error', error),
  complete: () => record('source', 'complete'),
  unsubscribe: () => record('source', 'unsubscribe'),
  finalize: () => record('source', 'finalize'),
});
```

Import the exact `tap` value used for installation. A new `Symbol('tap')` and
`Symbol.for('tap')` are different keys and must not be used as substitutes.
As in RxJS 7, a `tap` callback that throws changes the stream into an error.

Bracket the suspected operator and instrument projected inners separately.
Record the underlying resource abort as well as observer cancellation.

## Remove the intervention

Prefer a compact in-memory event array over logging large objects. Do not add a
Promise, timer, or scheduler merely to log. Repeat fast failures, run once with
the probe disabled, then remove the probe, helper, ids, and debug-only import.
Turn the proven ordering or lifecycle requirement into a deterministic test.
