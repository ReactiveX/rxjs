# RxJS library API checklist

- Supported RxJS major/range and exact peer dependency.
- Public package paths and type-only versus runtime imports.
- Producer creation, sharing, restart, late subscription, replay, and terminal
  semantics.
- Cancellation owner and whether it composes with Subscription or AbortSignal.
- Accepted input categories and foreign-realm/custom-subscribable policy.
- Error channel versus thrown/rejected errors.
- Backpressure, queue, replacement, drop, and concurrency policy.
- SSR and browser-resource creation boundary.
- Public mutation/write authority.
- Declaration-consumer, runtime, multiple-consumer, cancellation, package, and
  version-matrix tests.

For dual-major libraries, prefer an adapter boundary or separate entry points
over conditionals that pretend the subscription return type, input ecosystem,
or producer lifecycle is identical.
