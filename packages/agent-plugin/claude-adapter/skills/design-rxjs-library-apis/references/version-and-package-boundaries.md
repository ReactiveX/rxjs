# Version and package boundaries

## Choose an honest support shape

RxJS 7 and RxJS 9 differ in producer lifecycle, `subscribe()` return value,
cancellation, accepted inputs, operator composition, and testing. Prefer one of:

1. one entry point with one supported major;
2. explicit versioned entry points such as `library/rxjs7` and
   `library/rxjs9`; or
3. a small adapter interface owned by the library that does not leak either
   subscription protocol.

Do not publish a union or `any`-based facade that promises both while silently
discarding `Subscription` or `AbortSignal` behavior.

## Peer dependency and runtime identity

Declare the tested peer range narrowly enough to mean something. Decide
whether the library expects the application’s RxJS instance or bundles its own
copy. For RxJS 9 extension modules, physical copies own distinct exact Symbols
unless a separately designed registry protocol says otherwise. Bundling a
second copy can therefore change both bytes and capability identity.

## Exports are part of the API

Export only supported public entry points. Test ESM resolution, types, runtime
side effects, and tree shaking from the packed artifact. Never direct consumers
to `src/`, generated internals, or workspace paths.

For dual-major support, make the import path reveal the contract. Include a
migration note explaining lifecycle and cancellation changes rather than
presenting the new path as an import-only rename.
