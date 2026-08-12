# RxJS

[![CI](https://img.shields.io/github/actions/workflow/status/ReactiveX/rxjs/ci_main.yml?branch=master&style=flat-square&label=CI)](https://github.com/ReactiveX/rxjs/actions/workflows/ci_main.yml?query=branch%3Amaster)
[![Release readiness](https://img.shields.io/github/actions/workflow/status/ReactiveX/rxjs/release-readiness.yml?branch=master&style=flat-square&label=release%20readiness)](https://github.com/ReactiveX/rxjs/actions/workflows/release-readiness.yml?query=branch%3Amaster)
[![Observable WPT](https://img.shields.io/github/actions/workflow/status/ReactiveX/rxjs/observable-wpt.yml?branch=master&style=flat-square&label=Observable%20WPT)](https://github.com/ReactiveX/rxjs/actions/workflows/observable-wpt.yml?query=branch%3Amaster)
[![npm stable](https://img.shields.io/npm/v/rxjs/latest?style=flat-square&label=npm%20stable)](https://www.npmjs.com/package/rxjs?activeTab=versions)
[![npm next](https://img.shields.io/npm/v/rxjs/next?style=flat-square&label=npm%20next)](https://www.npmjs.com/package/rxjs?activeTab=versions)
[![npm downloads](https://img.shields.io/npm/dm/rxjs?style=flat-square&label=downloads)](https://www.npmjs.com/package/rxjs)
[![Apache 2.0](https://img.shields.io/npm/l/rxjs?style=flat-square&label=license)](LICENSE.txt)

[![Observable: platform native](https://img.shields.io/badge/Observable-platform--native-2563eb?style=flat-square)](docs/rxjs-next/ARCHITECTURE.md#native-selection-and-polyfill-boundary)
[![Extensions: Symbol keyed](https://img.shields.io/badge/extensions-Symbol--keyed-db2777?style=flat-square)](docs/rxjs-next/ARCHITECTURE.md#symbol-extension-model)

RxJS is a library for composing asynchronous and event-based programs with
Observable values. This repository contains the platform-based next generation
of RxJS, planned for release as **RxJS 9**.

> RxJS 9 is prerelease work in development. The planned first beta is
> `9.0.0-beta.0`, but it has not been published to npm yet. The `next` tag still
> points to the earlier RxJS 8 prerelease, while RxJS 7 remains the production
> `latest` line and continues to be maintained.

## Why RxJS 9? What happened to RxJS 8?

RxJS 8 was real work, not a skipped release. Development began years ago and
was paused while the Web Platform Observable proposal was finalized. The new
implementation is a platform-based generation rather than a continuation of
that paused RxJS 8 branch, so it starts at version 9 to make the architectural
break unmistakable and avoid presenting the old RxJS 8 work as the released
product.

## What is different in RxJS 9?

- RxJS uses the native web-platform `Observable` when one exists and installs
  a conforming fallback only when needed.
- RxJS operators and factories are exact, module-owned Symbols. They do not add
  string-named RxJS methods to the platform API.
- Platform Observable behavior and producer-per-subscription behavior are
  explicit, separate contracts. Use `ColdObservable` when each direct
  subscription must create its own producer.
- Cancellation is built on `AbortSignal` and the platform Subscriber lifecycle.
- Published JavaScript is ESM-only. Current Node can bridge `require()` to the
  same ESM files; there is no duplicate CommonJS build.

## Preview the RxJS 9 API

The following example shows the planned beta API. Until `9.0.0-beta.0` is
published, do not use npm's `next` tag to install RxJS 9.

```ts
import { ColdObservable } from 'rxjs';
import { map } from 'rxjs/map';

const source = new ColdObservable<number>((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});

source[map]((value) => value * 2).subscribe(console.log);
```

Import the Symbol and call it with bracket syntax. A platform method such as
`observable.map(project)` remains the platform contract;
`observable[map](project)` is the separately versioned RxJS contract.

## Packages and documentation

| Package                     | Purpose                                                  | Documentation                                                                                                                |
| --------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `rxjs`                      | Symbol extensions and intentional RxJS primitives        | [Package guide](packages/rxjs/README.md) · [API](packages/rxjs/docs/API.md) · [RxJS 7 migration](packages/rxjs/MIGRATION.md) |
| `@rxjs/observable-polyfill` | Conditional platform Observable fallback                 | [Package guide](packages/observable-polyfill/README.md)                                                                      |
| `@rxjs/test`                | Implementation-neutral virtual-time and marble testing   | [Package guide](packages/test/README.md)                                                                                     |
| `@rxjs/migrate`             | Deterministic migration engine and canonical agent Skill | [Package guide](packages/migrate/README.md)                                                                                  |

Release support, budgets, and exact environment gates are documented in the
[`rxjs` package](packages/rxjs/docs/RELEASE_GATES.md). The irreversible npm
publication process is the public [secure release runbook](docs/RELEASE_PROCESS.md).
The [RxJS 9 security-assurance document](packages/rxjs/docs/SECURITY_ASSURANCE.md)
explains the release evidence, verification commands, sole-maintainer model,
and OpenSSF Scorecard in context.
Repository-wide design records live in
[`docs/rxjs-next`](docs/rxjs-next/PROJECT_CHARTER.md).

## Supported environments

The planned beta supports Node 22.13+ and Node 24 as blocking lanes, with Node
26 in an advisory lane. Current Chrome, Firefox, desktop Safari, Mobile Safari,
Deno, Bun, and Webpack 5 are blocking. Every supported consumer receives the
same ESM implementation, so Deno and Bun support adds no runtime-specific
package or application-bundle code.

## Contributing

Requires Node 22.13+ and pnpm 10.34.5. Run commands from the repository root.

```sh
pnpm install
pnpm --filter rxjs exec vitest --run src
pnpm --filter rxjs run test:package
pnpm run release:check
```

Start with the [repository contribution guide](CONTRIBUTING.md) and the
[`rxjs` package contribution guide](packages/rxjs/CONTRIBUTING.md). The active
execution queue is [`PROJECT_PLAN.md`](docs/rxjs-next/PROJECT_PLAN.md).

The complete source-pinned RxJS 7 corpus intentionally retains reviewed
lifecycle and compatibility divergences, so it is migration evidence rather
than a blanket RxJS 9 compatibility gate. Focused source, package, runtime,
browser, performance, and WPT commands are the release gates.

## Community and governance

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contribution guidelines](CONTRIBUTING.md)
- [Apache 2.0 License](LICENSE.txt)
- [Issues](https://github.com/ReactiveX/rxjs/issues)
- [Discussions](https://github.com/ReactiveX/rxjs/discussions)
