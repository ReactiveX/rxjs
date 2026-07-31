# Migration review checklist

- The provenance header names the source repository, exact SHA, and path.
- Each migrated test has a direct `await rxTest(...)` call in an ordinary test
  body with a local, readable name.
- Parameter loops and generator task arrays have been reduced to the selected
  case rather than copied as generated architecture.
- `cold()` is used only for producer-per-subscription evidence.
- `observable()` is used for shared platform lifecycle evidence.
- Operator calls use imported exact Symbols and reviewed argument adapters.
- Scheduler arguments were removed only for host-timed RxJS Next APIs.
- Multiple observations were reviewed for sharing, late joins, ref counting,
  cancellation, and restart.
- Unsupported assertions and APIs remain visible.
- The migrated file passes formatting, type checking, and its focused test.
