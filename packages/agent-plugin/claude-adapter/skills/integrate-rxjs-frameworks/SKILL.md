---
name: integrate-rxjs-frameworks
description: Integrate RxJS with Angular 22.1, React 19.2, Vue 3.5, Svelte 5.56, SolidJS 1.9, or framework-neutral component lifecycles, SSR, cancellation, and external stores. Use for framework integration rather than core RxJS implementation.
---

# Integrate RxJS Frameworks

Confirm the framework, exact version, RxJS major, rendering mode, and owner
lifecycle. Keep stream work outside rendering until it has state the view
should consume.

- Angular 22.1: prefer framework lifecycle ownership and RxJS interop APIs.
  Angular 22.1 declares RxJS `^6.5.3 || ^7.4.0`; do not claim official RxJS 9
  compatibility until Angular changes that peer contract.
- React 19.2: use stable Observable identity and an effect cleanup or a correct
  external-store adapter. Avoid subscriptions during render and protect SSR
  from browser-only source creation.
- Vue 3.5: bind subscriptions to component/effect scope disposal and make
  refs/computed values the view-state boundary.
- Svelte 5.56 and SolidJS 1.9: use their cleanup primitives, create browser
  resources only in client lifecycle, and keep subscription identity stable.
- Across frameworks: define cancellation, error delivery, completion, sharing,
  hydration, and server/client ownership explicitly.

Read the [framework matrix](references/framework-matrix.md) for integration
rules and [validated framework versions](references/framework-versions.md)
when a compatibility claim depends on an exact pin.
