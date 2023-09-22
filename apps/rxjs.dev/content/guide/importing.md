# Importing instructions

There are different ways you can {@link guide/installation install} RxJS. Using/importing RxJS depends on
the used RxJS version, but also depends on the used installation method.

[Pipeable operators](https://v6.rxjs.dev/guide/v6/pipeable-operators) were introduced in RxJS version
5.5. This enabled all operators to be exported from a single place. This new export site was introduced
with RxJS version 6 where all pipeable operators could have been imported from `'rxjs/operators'`. For
example, `import { map } from 'rxjs/operators'`.

## New in RxJS v7.2.0

<span class="informal">**With RxJS v7.2.0, most operators have been moved to `{@link api#index 'rxjs'}`
export site. This means that the preferred way to import operators is from `'rxjs'`, while
`'rxjs/operators'` export site has been deprecated.**</span>

For example, instead of using:

```ts
import { map } from 'rxjs/operators';
```

**the preferred way** is to use:

```ts
import { map } from 'rxjs';
```

Although the old way of importing operators is still active, it will be removed in one of the next major
versions.

Click {@link #how-to-migrate here to see} how to migrate.

## Export sites

RxJS v7 exports 6 different locations out of which you can import what you need. Those are:

- `{@link api#index 'rxjs'}` - for example: `import { of } from 'rxjs';`
- `{@link api#operators 'rxjs/operators'}` - for example: `import { map } from 'rxjs/operators';`
- `{@link api#ajax 'rxjs/ajax'}` - for example: `import { ajax } from 'rxjs/ajax';`
- `{@link api#fetch 'rxjs/fetch'}` - for example: `import { fromFetch } from 'rxjs/fetch';`
- `{@link api#webSocket 'rxjs/webSocket'}` - for example: `import { webSocket } from 'rxjs/webSocket';`
- `{@link api#testing 'rxjs/testing'}` - for example: `import { TestScheduler } from 'rxjs/testing';`

### How to migrate?

While nothing has been removed from `'rxjs/operators'`, it is strongly recommended doing the operator
imports from `'rxjs'`. Almost all operator function exports have been moved to `'rxjs'`, but only a
couple of old and deprecated operators have stayed in the `'rxjs/operators'`. Those operator functions
are now mostly deprecated and most of them have their either static operator substitution or are kept as
operators, but have a new name so that they are different to their static creation counter-part (usually
ending with `With`). Those are:

| `'rxjs/operators'` Operator                             | Replace With Static Creation Operator | Replace With New Operator Name |
| ------------------------------------------------------- | ------------------------------------- | ------------------------------ |
| [`combineLatest`](/api/operators/combineLatest)         | {@link combineLatest}                 | {@link combineLatestWith}      |
| [`concat`](/api/operators/concat)                       | {@link concat}                        | {@link concatWith}             |
| [`merge`](/api/operators/merge)                         | {@link merge}                         | {@link mergeWith}              |
| [`onErrorResumeNext`](/api/operators/onErrorResumeNext) | {@link onErrorResumeNext}             | {@link onErrorResumeNextWith}  |
| [`race`](/api/operators/race)                           | {@link race}                          | {@link raceWith}               |
| [`zip`](/api/operators/zip)                             | {@link zip}                           | {@link zipWith}                |

`partition`, the operator, is a special case, as it is deprecated and you should be using the `partition` creation function exported from `'rxjs'` instead.

For example, the old and deprecated way of using [`merge`](/api/operators/merge) from `'rxjs/operators'`
is:

```ts
import { merge } from 'rxjs/operators';

a$.pipe(merge(b$)).subscribe();
```

But this should be avoided and replaced with one of the next two examples.

For example, this could be replaced by using a static creation {@link merge} function:

```ts
import { merge } from 'rxjs';

merge(a$, b$).subscribe();
```

Or it could be written using a pipeable {@link mergeWith} operator:

```ts
import { mergeWith } from 'rxjs';

a$.pipe(mergeWith(b$)).subscribe();
```

Depending on the preferred style, you can choose which one to follow, they are completely equal.

Since a new way of importing operators is introduced with RxJS v7.2.0, instructions will be split to
prior and after this version.

### ES6 via npm

If you've installed RxJS using {@link guide/installation#es6-via-npm ES6 via npm} and installed version
is:

#### v7.2.0 or later

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

#### v7.1.0 or older

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

### CDN

If you installed a library {@link guide/installation#cdn using CDN}, the global namespace for rxjs is
`rxjs`.

#### v7.2.0 or later

```js
const { range, filter, map } = rxjs;

range(1, 200)
  .pipe(
    filter((x) => x % 2 === 1),
    map((x) => x + x)
  )
  .subscribe((x) => console.log(x));
```

#### v7.1.0 or older

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
