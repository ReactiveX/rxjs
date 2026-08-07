# RxJS 9 platform methods and extensions

## Platform methods first

Prefer `.map()`, `.filter()`, `.flatMap()`, `.switchMap()`, and other platform
methods when their semantics and receiver lifecycle fit. In browser-native
implementations this avoids importing RxJS extension modules and their bundle
bytes. Node currently uses the fallback, but the same API remains aligned with
native Observable support.

Use an exact RxJS Symbol for capabilities absent from the platform, intentional
semantic differences, or preservation of a `ColdObservable` result lifecycle.

## Publishing a fluent operator

First prefer an ordinary source-to-source transformation. If fluent syntax is
the public library API, export a module-owned exact `Symbol()`, augment
`Observable<T>` under that key, install it from the public module, and construct
through `[create]`. Define user-callback errors, cancellation, terminals,
concurrency, and receiver lifecycle.

Do not use `Symbol.for()` merely to make physical copies share identity. A
global registry key lets unrelated packages or incompatible versions address
and overwrite the same prototype slot while declarations still appear valid.
It is acceptable only with a public protocol covering a namespaced key,
duplicate installation, version negotiation, property overwrite/refusal,
cross-realm behavior, and multi-copy tests.
