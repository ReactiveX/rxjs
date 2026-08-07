---
name: integrate-rxjs-frameworks
description: Integrate RxJS 7 or RxJS 9 with Angular 22.1, React 19.2, Vue 3.5, Svelte 5.56, SolidJS 1.9, or framework-neutral component lifecycles, SSR, hydration, cancellation, stable source identity, external stores, and error boundaries. Use for framework integration rather than core RxJS implementation.
---

# Integrate RxJS Frameworks

Confirm the framework version, RxJS major, server/client rendering mode,
producer lifecycle, and component/service owner before choosing an adapter.
Keep subscriptions out of render/computed evaluation and keep source identity
stable for the intended owner.

Angular 22.1 declares RxJS `^6.5.3 || ^7.4.0`. Its RxJS 7 integrations are the
official path; do not claim official RxJS 9 compatibility until Angular's peer
contract changes. RxJS 9 Angular examples are explicit exploratory adapters.

For RxJS 9 framework code, prefer platform methods when their contracts fit.
Use exact Symbols for missing/different behavior or `ColdObservable` lifecycle.
Treat a class controller and a closure factory returning a readonly tuple as
equally valid inputs; integrate through their public command/Observable
capabilities.

## Load the relevant framework reference

- [Angular 22.1](references/angular-22.md)
- [React 19.2](references/react-19.md)
- [Vue 3.5](references/vue-3.md)
- [Svelte 5.56 and SolidJS 1.9](references/svelte-5-and-solid-1.md)
- [Framework-neutral lifecycle and SSR](references/lifecycle-ssr-and-errors.md)
- [Good and bad integration examples](references/good-and-bad.md)
- [Validated framework versions](references/framework-versions.md)
