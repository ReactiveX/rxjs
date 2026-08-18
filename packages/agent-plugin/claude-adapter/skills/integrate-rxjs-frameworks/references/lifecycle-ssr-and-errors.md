# Framework-neutral lifecycle, SSR, and errors

## Ownership map

For every terminal subscription, name the owner: component instance, effect
scope, route/request, service, application, or test. Cleanup must reach the
actual child observation and resource. A component must not cancel a
service/application producer it does not own; it should detach only its own
observer.

Keep Observable identity stable for that owner. Recreating a class or readonly
tuple factory each render/reactive read also recreates its private Subject,
producer, and command closures.

## SSR and hydration

- Do not touch `window`, DOM EventTargets, browser timers, or sockets during a
  server render unless the framework explicitly provides them.
- Define the server snapshot/initial state and make the client hydrate from a
  compatible value.
- Scope request-specific producers to the request; never leak one user's hot
  state through a process-global singleton.
- Decide whether server completion/errors are rendered, serialized, retried,
  or reported.

## Error and completion surfaces

Framework error boundaries usually do not catch asynchronous Observable errors
or observer callback throws automatically. Convert recoverable failures into
explicit view state at the correct inner scope, or report terminal errors to an
owned channel. Completion may mean “loaded,” “disconnected,” or nothing; do
not infer a UI state without a domain contract.

## RxJS 9 method choice

Prefer platform methods in UI pipelines when their contracts fit, reducing
browser extension bytes. Use exact Symbols for missing/different behavior or
to preserve `ColdObservable` construction. Source method choice does not
replace framework lifecycle cleanup.
