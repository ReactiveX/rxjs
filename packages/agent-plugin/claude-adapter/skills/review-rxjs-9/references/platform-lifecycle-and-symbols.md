# Platform lifecycle and exact-Symbol review

## Verify the receiver lifecycle

A platform Observable shares one active producer: first observer starts it,
concurrent observers join from their subscription time, final observer removal
closes it, and later observation can restart it. A `ColdObservable` creates an
independent producer for every direct `subscribe()` call.

Flag code that stores observer-specific data in a platform producer initializer
or expects concurrent late observers to replay earlier values. Flag
`ColdObservable` when duplicated I/O or side effects were not intended.

Symbol operator results use the receiver's public `[create]` protocol. A
`ColdObservable` receiver remains producer-per-direct-subscription at runtime,
although the public return type is `Observable<T>`. A native string method on
a cold value crosses back to platform lifecycle.

## Verify platform-first method selection

```ts
const names = users.map((user) => user.name);
```

Prefer the string method when its platform contract fits. In a browser-native
implementation this avoids importing an RxJS extension module and its bundle
bytes. Node currently relies on the fallback, but platform-first authoring
still aligns code with eventual native support.

Use an exact Symbol when the platform lacks the capability, its semantics
differ, or a `ColdObservable` result must remain producer-per-subscription. The
imported exact Symbol is then the collision boundary. Flag:

- `Symbol('map')` substituted by description;
- `Symbol.for` without a namespaced identity, duplicate-install,
  version-compatibility, overwrite/refusal, and cross-realm protocol;
- string-named RxJS prototype additions;
- operator calls without the corresponding side-effecting public subpath
  import; and
- private `src/` or internal imports.

Do not treat `source.map(...)` and `source[map](...)` as mechanically
interchangeable. Review semantics and receiver lifecycle; then prefer the
platform form whenever those requirements fit.

Treat an ungoverned `Symbol.for()` key as a correctness risk, not a style
issue. Unrelated libraries or incompatible copies can address the same
prototype slot, and installation order can select behavior that disagrees with
the ambient types.

## Review construction and input normalization separately

Result construction uses `[create]`; inputs use the active realm's
`Observable.from`. Supported input categories are Observable, async iterable,
iterable, and Promise-like. Flag legacy arbitrary subscribables and foreign
interop assumptions rather than casting them through `ObservableValue`.

Review custom subclasses whose constructor cannot accept the standard
producer initializer. Subject types deliberately override construction to
return an immutable platform Observable result rather than another mutable
Subject.

## Native/fallback safety

RxJS must use a conforming native Observable when present and conditionally
supply its fallback otherwise. Require parity tests for code whose behavior
depends on constructor identity, realms, host callback reporting, or lifecycle
details. A passing fallback-only unit test is not proof of native conformance.
