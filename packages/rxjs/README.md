# `rxjs` 9 beta

RxJS 9 extends the web-platform Observable with exact Symbol-keyed operators
and factories, plus a small set of intentional RxJS primitives. It uses a
native `Observable` when one exists and otherwise initializes the separately
published `@rxjs/observable-polyfill` fallback.

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

## Use an operator

```ts
import { ColdObservable } from 'rxjs';
import { map } from 'rxjs/map';
import { pipe } from 'rxjs/pipe';
import { scan } from 'rxjs/scan';

const source = new ColdObservable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});

source[pipe](
  (values) => values[map]((value) => value * 2),
  (values) => values[scan]((total, value) => total + value, 0)
).subscribe(console.log); // 2, 6, 12
```

Each operator subpath exports its exact Symbol and installs only that
capability. Importing the root does not install the operator catalog.

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
const { map } = require('rxjs/map');
```

The bridge requires Node 22.13 or newer. It is not a CommonJS build and does
not support legacy CommonJS resolvers.

## Documentation

- [Security assurance and release verification](docs/SECURITY_ASSURANCE.md)
- [API and import guide](docs/API.md)
- [Migrate from RxJS 7](MIGRATION.md)
- [Unsupported RxJS 7 surfaces](docs/UNSUPPORTED_RXJS_7_SURFACES.md)
- [Migration evidence ledger](docs/MIGRATION_EVIDENCE_LEDGER.md)
- [Release environments and budgets](docs/RELEASE_GATES.md)
- [Beta.0 approval record](docs/PRERELEASE_APPROVAL.md)
- [Contributing to the package](CONTRIBUTING.md)

The package export map in [`package.json`](package.json) is authoritative for
available public subpaths.
