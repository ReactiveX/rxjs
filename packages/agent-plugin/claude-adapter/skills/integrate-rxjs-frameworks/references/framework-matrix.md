# Framework integration matrix

Pinned beta.1 guidance: Angular 22.1, React 19.2, Vue 3.5, Svelte 5.56, and
SolidJS 1.9.

## Angular 22.1

Use `AsyncPipe`, lifecycle-bound subscriptions, or the framework's RxJS/signal
interop according to ownership. Reuse a signal created from an Observable;
avoid repeated bridges. Create DOM/browser sources only in the browser.
Angular 22.1's package contract is RxJS `^6.5.3 || ^7.4.0`; RxJS 9 examples
are exploratory until that contract changes.

## React 19.2

Never subscribe during render. Keep Observable identity stable, subscribe in an
effect with cleanup, or implement the `useSyncExternalStore` contract for a
true external store. Provide a server snapshot and avoid browser sources during
SSR. Guard against stale closures and resubscription caused by unstable inputs.

## Vue 3.5

Own subscriptions in component/effect scope and clean up with scope disposal.
Use refs/computed values for view state and keep stream side effects outside
render evaluation. Avoid creating a new stream on every reactive read.

## Svelte 5.56 and SolidJS 1.9

Use their lifecycle cleanup primitives and stable resource identity. Delay DOM
or browser event sources until client lifecycle. Treat runes/signals as the
view-state boundary, not an automatic substitute for stream cancellation or
higher-order concurrency.

## Universal rules

State server/client ownership, hydration value, subscription cleanup, error
surface, completion behavior, cancellation, and whether multiple components
share a producer. Test mount/unmount, remount, SSR, and concurrent consumers.
