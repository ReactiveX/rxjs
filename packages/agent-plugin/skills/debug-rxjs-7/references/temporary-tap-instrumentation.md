# Temporary tap instrumentation

## Insert a named probe

Use `tap` at the last point where a value is known to exist and the first point
where it is missing. Include lifecycle callbacks when cancellation or completion
matters.

```ts
import { tap } from 'rxjs';

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

const debugged$ = source$.pipe(
  tap({
    subscribe: () => record('source', 'subscribe'),
    next: (value) => record('source', 'next', { id: value.id }),
    error: (error) => record('source', 'error', error),
    complete: () => record('source', 'complete'),
    unsubscribe: () => record('source', 'unsubscribe'),
    finalize: () => record('source', 'finalize'),
  })
);
```

In RxJS 7, `unsubscribe` on a `TapObserver` means explicit unsubscription; it
does not run for source error or completion. `finalize` runs for every
finalization path. A `tap` callback that throws changes the stream into an
error, so diagnostic callbacks must not throw.

## Bracket the suspected boundary

Place probes on both sides of filtering, recovery, sharing, or a custom
operator. For a higher-order chain, log the outer input and create a separately
identified probe inside the projection. Count inner subscribe, terminal event,
explicit unsubscribe, and resource cancellation; a missing result alone does
not prove the underlying work stopped.

Use `console.log` for a quick inspection, but prefer a small in-memory event
array when order matters. Console rendering, object expansion, stringification,
source maps, and DevTools itself can be expensive.

## Avoid a debugging heisenbug

- Do not log large payloads or stringify recursive objects.
- Snapshot only fields needed for the hypothesis.
- Keep the probe synchronous if the original stage is synchronous; do not add a
  Promise or timer merely to log.
- Repeat fast failures several times and compare event sequences.
- Re-run with the probe disabled and then removed.

Once the cause is proved, delete the `tap`, helper, ids, and debug-only imports.
Preserve the insight as an assertion in a deterministic test. Do not ship a
permanently noisy diagnostic pipeline unless observability is an explicit API
requirement.
