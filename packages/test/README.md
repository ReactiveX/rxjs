# `@rxjs/test`

Implementation-neutral virtual-time and marble testing for RxJS 9 Observable
contracts.

```sh
npm install --save-dev @rxjs/test@next rxjs@next
```

```ts
import 'rxjs';
import { rxTest } from '@rxjs/test';
import { map } from 'rxjs/map';

await rxTest(({ cold, expectObservable }) => {
  const source = cold('-a-b-|', { a: 1, b: 2 });
  expectObservable(source[map]((value) => value * 10)).toBe('-a-b-|', {
    a: 10,
    b: 20,
  });
});
```

Use `cold()` only when the test deliberately needs one producer per direct
subscription. Use `observable()` when the contract should exercise the active
platform Observable constructor. The package never installs a platform
Observable for the consumer; import `rxjs` or
`@rxjs/observable-polyfill` first when the realm does not already provide one.

`rxTest` supplies scheduled work, hot/cold/platform sources, Observable and
subscription expectations, explicit time plans, and configurable deep-equality
assertions. Failures use `RxTestAssertionError` and include structured assertion
information.

The package requires Node 22.13+, publishes ESM only, and declares an exact peer
on the matching RxJS 9 prerelease train. The
[`rxjs` migration guide](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/MIGRATION.md)
explains how to review lifecycle choices when translating RxJS 7
`TestScheduler.run` tests.
