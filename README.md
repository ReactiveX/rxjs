<img src="doc/asset/Rx_Logo_S.png" alt="RxJS Logo" width="86" height="86"> RxJS: Reactive Extensions For JavaScript
======================================


[![CircleCI](https://circleci.com/gh/ReactiveX/rxjs/tree/master.svg?style=svg)](https://circleci.com/gh/ReactiveX/rxjs/tree/master)
[![npm version](https://badge.fury.io/js/%40reactivex%2Frxjs.svg)](http://badge.fury.io/js/%40reactivex%2Frxjs)
[![Join the chat at https://gitter.im/Reactive-Extensions/RxJS](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Reactive-Extensions/RxJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# RxJS 7 (alpha)

### FOR 6.X PLEASE GO TO [THE 6.x BRANCH](https://github.com/ReactiveX/rxjs/tree/6.x)

Reactive Extensions Library for JavaScript. This is a rewrite of [Reactive-Extensions/RxJS](https://github.com/Reactive-Extensions/RxJS) and is the latest production-ready version of RxJS. This rewrite is meant to have better performance, better modularity, better debuggable call stacks, while staying mostly backwards compatible, with some breaking changes that reduce the API surface.

[Apache 2.0 License](LICENSE.txt)

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contribution Guidelines](CONTRIBUTING.md)
- [Maintainer Guidelines](doc/maintainer-guidelines.md)
- [Creating Operators](doc/operator-creation.md)
- [API Documentation (WIP)](https://rxjs.dev/)

## Versions In This Repository

- [master](https://github.com/ReactiveX/rxjs/commits/master) - This is all of the current, unreleased work, which is against v6 of RxJS right now
- [stable](https://github.com/ReactiveX/rxjs/commits/stable) - This is the branch for the latest version you'd get if you do `npm install rxjs`

## Important

By contributing or commenting on issues in this repository, whether you've read them or not, you're agreeing to the [Contributor Code of Conduct](CODE_OF_CONDUCT.md). Much like traffic laws, ignorance doesn't grant you immunity.

## Installation and Usage

### ES6 via npm

```sh
npm install rxjs
```

It's recommended to pull in the Observable creation methods you need directly from `'rxjs'` as shown below with `range`. And you can pull in any operator you need from one spot, under `'rxjs/operators'`.

```ts
import { range } from 'rxjs';
import { map, filter } from 'rxjs/operators';

range(1, 200).pipe(
  filter(x => x % 2 === 1),
  map(x => x + x)
).subscribe(x => console.log(x));
```

### CDN

For CDN, you can use [unpkg](https://unpkg.com/):

https://unpkg.com/rxjs/bundles/rxjs.umd.min.js

The global namespace for rxjs is `rxjs`:

```js
const { range } = rxjs;
const { map, filter } = rxjs.operators;

range(1, 200).pipe(
  filter(x => x % 2 === 1),
  map(x => x + x)
).subscribe(x => console.log(x));
```

## Goals

- Smaller overall bundles sizes
- Provide better performance than preceding versions of RxJS
- To model/follow the [Observable Spec Proposal](https://github.com/zenparsing/es-observable) to the observable
- Provide more modular file structure in a variety of formats
- Provide more debuggable call stacks than preceding versions of RxJS

## Building/Testing

- `npm run build_all` - builds everything
- `npm test` - runs tests
- `npm run test_no_cache` - run test with `ts-node` set to false

## Performance Tests

Run `npm run build_perf` or `npm run perf` to run the performance tests with `protractor`.

Run `npm run perf_micro [operator]` to run micro performance test benchmarking operator.

## Adding documentation
We appreciate all contributions to the documentation of any type. All of the information needed to get the docs app up and running locally as well as how to contribute can be found in the [documentation directory](./docs_app).
