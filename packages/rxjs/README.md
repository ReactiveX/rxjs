# `rxjs` 9 beta

RxJS 9 extends the web-platform Observable with exact Symbol-keyed operators
and factories, plus an experimental complete functional facade and a small set
of intentional RxJS primitives. It uses a native `Observable` when one exists
and otherwise initializes the separately published
`@rxjs/observable-polyfill` fallback.

This is prerelease software. Install the current beta with:

```sh
npm install rxjs@next
```

RxJS 7 remains npm's `latest` line during the beta and continues to be
maintained.

## Why version 9?

Work on RxJS 8 began years ago and paused while Web Platform Observables were
finalized. RxJS 9 is a new platform-based generation, not a release of that
paused implementation. The version communicates that architectural break and
prevents the old RxJS 8 work from being mistaken for this product.

## Try the complete pipeable experiment

```ts
import { filter, map, rx, subscribe, take, toArray } from 'rxjs';

const subscription = rx(
  [1, 2, 3, 4],
  filter((value) => value % 2 === 0),
  map((value) => value * 10),
  take(2),
  toArray(),
  subscribe(console.log)
);

console.log(subscription.closed); // true after synchronous completion
```

This branch is evaluating 91 root-level source operators and 12 static
functions alongside the existing exact-Symbol catalog. Dual static/source
capabilities use names such as `merge` and `mergeWith`. Async-iteration
terminals remain `AsyncGenerator` results. Complete `rxjs/pipeable`,
`rxjs/static`, and `rxjs/symbol` barrels and focused deep imports are available;
established Symbol subpaths remain unchanged during final review.

## Choose the lifecycle deliberately

`new Observable(initializer)` follows the platform contract. Concurrent
observers share the active producer, the last observer leaving tears it down,
and a later observer starts it again.

`new ColdObservable(initializer)` creates one producer for every direct
subscription. Use it when producer-per-subscription behavior is part of the
application contract rather than assuming all Observables are cold.

Cancellation uses `AbortSignal`:

```ts
const controller = new AbortController();
source.subscribe(console.log, { signal: controller.signal });
controller.abort();
```

## ESM and Node `require()`

The package publishes one ESM implementation. Browser, Webpack, ESM import,
and Node's `require(esm)` bridge resolve the same files and exact Symbols.

```js
const { ColdObservable } = require('rxjs');
const { map } = require('rxjs/pipeable/map');
```

The bridge requires Node 22.13 or newer. It is not a CommonJS build and does
not support legacy CommonJS resolvers.

## Documentation

- [Security assurance and release verification](docs/SECURITY_ASSURANCE.md)
- [API and import guide](docs/API.md)
- [All-pipeable beta experiment](docs/PIPEABLE_EXPERIMENT.md)
- [Migrate from RxJS 7](MIGRATION.md)
- [Unsupported RxJS 7 surfaces](docs/UNSUPPORTED_RXJS_7_SURFACES.md)
- [Migration evidence ledger](docs/MIGRATION_EVIDENCE_LEDGER.md)
- [Release environments and budgets](docs/RELEASE_GATES.md)
- [Beta.0 approval record](docs/PRERELEASE_APPROVAL.md)
- [Contributing to the package](CONTRIBUTING.md)

The package export map in [`package.json`](package.json) is authoritative for
available public subpaths.
