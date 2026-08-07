# Higher-order, errors, and completion debugging

## Translate the operator into a timeline

- replacement: old inner canceled when newer input arrives;
- queue: new input waits for active inner completion;
- overlap: several inners active and results interleave;
- ignore: input during active inner is dropped.

Mark active and pending inners. Check whether underlying work actually observes
cancellation or only its result is suppressed.

## Recovery scope

Move diagnostic logging to both sides of `catchError`/`[catchError]`. Inner
recovery preserves the outer interaction; outer recovery replaces it. A
fallback such as `EMPTY` emits nothing and completes, which can look like a
randomly dead UI.

## Retry and repeat

Count activations and distinguish resubscription from continuation. Check:

- permanent synchronous failure loop;
- retry delay never emits;
- cancellation during delay;
- non-idempotent side effects repeated;
- retry budget reset after a successful value; and
- shared source state across retries.

## Stuck completion

Inspect `concat`/queueing, `forkJoin`, `lastValueFrom`/`last()`, `toArray`,
`reduce`, active windows/groups, and inners that never complete. A Subject may
be quiet but still active. Add terminal instrumentation at every branch.

## Error categories

Separate source errors, user callback/output errors, observer callback errors,
and errors after closure. Observer callback errors are host-reported; an
upstream recovery operator cannot catch them. A custom operator that fails to
catch a projector can misclassify the error.
