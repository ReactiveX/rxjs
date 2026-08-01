# `@rxjs/observable-polyfill`

Conditional fallback for the web-platform Observable and Subscriber contracts
used by RxJS 9.

```sh
npm install @rxjs/observable-polyfill@next
```

```ts
import '@rxjs/observable-polyfill';
```

The package preserves an existing callable `globalThis.Observable`. When the
realm has no implementation, it installs the RxJS fallback together with its
paired Subscriber and supported platform methods. It does not probe a native
implementation for conformance, replace it, or make the platform Observable
behave like an RxJS 7 cold Observable.

Use `getObservablePolyfillInfo()` when diagnostics need to distinguish the
RxJS fallback from a native or foreign constructor:

```ts
import { getObservablePolyfillInfo } from '@rxjs/observable-polyfill';

console.log(getObservablePolyfillInfo()); // metadata for the RxJS fallback, or undefined
```

Cancellation and teardown use `AbortSignal` and Subscriber lifecycle. The
package also conditionally supplies the supported `EventTarget.when()` surface
without replacing an existing callable implementation.

The package requires Node 22.13+ and publishes one ESM implementation for
browser, Webpack, import, and Node `require(esm)` resolution. Observable WPT is
pinned at an exact upstream revision under `test/wpt`; the strict gate requires
complete results and exact RxJS bundle identity in every fallback realm.

This package is the platform layer. RxJS operators and intentional
producer-per-subscription primitives belong to the
[`rxjs` package](https://github.com/ReactiveX/rxjs/tree/master/packages/rxjs).
