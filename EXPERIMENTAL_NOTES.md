## Differences

- `of` has no scheduler argument
- `from` has no scheduler argument
- `Observable` instances are now `typeof` `"function"`.
- `lift` is no longer on `Observable`
- `materialize`: `Notification` is no longer a class. `hasValue` and `hasError` are no longer properties, instead users would check `'error' in notification` if they were worried about falsiness mismatches.
- All `Scheduler`-related functionality is moved to another package
- `timestamp` - no longer accepts a `Scheduler`, instead, zones-based testing will be required to test
timestamp.
- `forEach`
  - `nextHandler` is always called on a microtask now.
  - optional subscription argument to allow users to cancel/abort/unsubscribe a
    forEach'ed observable. When `unsubscribe` is called, the resulting promise will
    reject with an `Error` that has the `name` `"AbortError"`, this is to somewhat
    align it with the behavior of `fetch` and `AbortSignal`.
- `next` (Name to be bikeshedded)... this is a equivalent to Rx5's `of(...values, asapScheduler)`.
  given this is one of the primary
- `concatWith` is basically the old `concat` *operator*, just with a better name.
- `endWith` has no scheduler argument
- `startWith` has no scheduler argument
