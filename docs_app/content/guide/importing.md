# Importing instructions

There are different ways you can {@link guide/installation install} RxJS. Using/importing RxJS depends on
the used RxJS version, but also depends on the used installation method.

# Export sites

RxJS v7 exports 6 different locations out of which you can import what you need. Those are:

- `{@link api#index 'rxjs'}` (for example: `import { of } from 'rxjs'`)
- `{@link api#operators 'rxjs/operators'}` (for example: `import { map } from 'rxjs/operators'`)
- `{@link api#ajax 'rxjs/ajax'}` (for example: `import { ajax } from 'rxjs/ajax'`)
- `{@link api#fetch 'rxjs/fetch'}` (for example: `import { fromFetch } from 'rxjs/fetch'`)
- `{@link api#webSocket 'rxjs/webSocket'}` (for example: `import { webSocket } from 'rxjs/webSocket'`)
- `{@link api#testing 'rxjs/testing'}` (for example: `import { TestScheduler } from 'rxjs/testing'`)

A new way of importing {@link guide/operators operators} is introduced with RxJS v7.2.0.

# What's changed in RxJS v7.2.0?

[Pipeable operators](https://v6.rxjs.dev/guide/v6/pipeable-operators) were introduced in RxJS version
5.5. This enabled all operators to be exported from a single place. This new export site was introduced
with RxJS version 6 where all pipeable operators could have been imported from `'rxjs/operators'`. For
example, `import { map } from 'rxjs/operators'`.

With RxJS v7.2.0, most operators have been moved to `{@link api#index 'rxjs'}` export site. This means
that preferred way to import operators is from `'rxjs'`.

For example, instead of using: `import { map } from 'rxjs/operators'`, the preferred way is to use:
`import { map } from 'rxjs'`. Although old way of importing operators is still active, it will soon
become deprecated.

## What stayed in `'rxjs/operators'`?

Only couple of old and mostly deprecated operators have stayed in the `'rxjs/operators'`. Those
operators are now mostly deprecated and most of them have their either static operator substitution
or are kept as operators, but have a new name so that they are different to their static creation
counter-part (usually ending with `With`). Those are:

| `'rxjs/operators'` Operator                             | Replace With Static Creation Operator | Replace With New Operator Name |
| ------------------------------------------------------- | ------------------------------------- | ------------------------------ |
| [`combineLatest`](/api/operators/combineLatest)         | {@link combineLatest}                 | {@link combineLatestWith}      |
| [`concat`](/api/operators/concat)                       | {@link concat}                        | {@link concatWith}             |
| [`merge`](/api/operators/merge)                         | {@link merge}                         | {@link mergeWith}              |
| [`onErrorResumeNext`](/api/operators/onErrorResumeNext) | {@link onErrorResumeNext}             | -                              |
| [`partition`](/api/operators/partition)                 | {@link partition}                     | -                              |
| [`race`](/api/operators/race)                           | {@link race}                          | {@link raceWith}               |
| [`zip`](/api/operators/zip)                             | {@link zip}                           | {@link zipWith}                |

For example, usage of a static creation {@link merge} operator:

```ts
import { merge } from 'rxjs';

merge(a$, b$).subscribe();
```

could be written as (using a pipeable operator):

```ts
import { mergeWith } from 'rxjs';

a$.pipe(mergeWith(b$)).subscribe();
```

Depending on the preferred style, you can choose which one to follow, they are completely equal.

Since a new way of importing operators is introduced with RxJS v7.2.0, instructions will be split to
prior and after this version.

## ES6 via npm

If you've installed RxJS using {@link guide/installation#es6-via-npm ES6 via npm} and installed version
is:

### v7.2.0 or later

Import only what you need:

```ts
import { of, map } from 'rxjs';

of(1, 2, 3).pipe(map((x) => x + '!!!')); // etc
```

To import the entire set of functionality:

```ts
import * as rxjs from 'rxjs';

rxjs.of(1, 2, 3).pipe(rxjs.map((x) => x + '!!!')); // etc;
```

To use with a globally imported bundle:

```js
const { of, map } = rxjs;

of(1, 2, 3).pipe(map((x) => x + '!!!')); // etc
```

If you installed RxJS version:

### v7.1.0 or older

Import only what you need:

```ts
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

of(1, 2, 3).pipe(map((x) => x + '!!!')); // etc
```

To import the entire set of functionality:

```ts
import * as rxjs from 'rxjs';
import * as operators from 'rxjs';

rxjs.of(1, 2, 3).pipe(operators.map((x) => x + '!!!')); // etc;
```

To use with a globally imported bundle:

```js
const { of } = rxjs;
const { map } = rxjs.operators;

of(1, 2, 3).pipe(map((x) => x + '!!!')); // etc
```

## CDN

If you installed a library {@link guide/installation#cdn using CDN}, the global namespace for rxjs is
`rxjs`.

### v7.2.0 or later

```js
const { range, filter, map } = rxjs;

range(1, 200)
  .pipe(
    filter((x) => x % 2 === 1),
    map((x) => x + x)
  )
  .subscribe((x) => console.log(x));
```

### v7.1.0 or older

```js
const { range } = rxjs;
const { filter, map } = rxjs.operators;

range(1, 200)
  .pipe(
    filter((x) => x % 2 === 1),
    map((x) => x + x)
  )
  .subscribe((x) => console.log(x));
```
