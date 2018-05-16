## Differences

- `Observable` instances are now `typeof` `"function"`.
- `lift` is no longer on `Observable`
- `materialize`: `Notification` is no longer a class. `hasValue` and `hasError` are no longer properties, instead users would check `'error' in notification` if they were worried about falsiness mismatches.
- All `Scheduler`-related functionality is moved to another package
- `timestamp` - no longer accepts a `Scheduler`, instead, zones-based testing will be required to test
timestamp.
