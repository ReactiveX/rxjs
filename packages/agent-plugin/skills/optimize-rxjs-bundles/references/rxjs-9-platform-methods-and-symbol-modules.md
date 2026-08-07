# RxJS 9 platform methods and Symbol modules

## Prefer the platform surface

```ts
// Preferred when platform semantics and lifecycle fit.
const labels = values.filter(isValid).map(toLabel);
```

A conforming native Observable already owns these methods, so this form does
not import RxJS `filter` or `map` extension modules. The fallback supplies the
platform contract where native Observable is absent. Measure the consumer's
actual targets and bundler rather than claiming a universal byte count.

Node currently relies on the fallback; network bundle size is often not the
primary constraint there. Still prefer the platform contract unless behavior
requires otherwise so code aligns with eventual native support.

## Exact Symbols are intentional side effects

```ts
import { distinctUntilChanged } from 'rxjs/distinct-until-changed';

const stable = values.map(toLabel)[distinctUntilChanged]();
```

An exact extension subpath installs and types its Symbol on the active
Observable prototype. The module is side-effectful by design and must not be
deleted as “unused” merely because the imported binding appears only in a
computed property access.

Use an exact Symbol when the platform lacks the capability, semantics differ,
or `ColdObservable` construction must persist. For example, do not replace
exact `[takeUntil]` with platform `.takeUntil()` when notifier-error behavior
must remain RxJS-compatible.
