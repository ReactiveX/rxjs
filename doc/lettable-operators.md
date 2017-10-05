# Lettable Operators

Starting in version 5.5 we have shipped "lettable operators", which can be accessed in `rxjs/operators` (notice the pluralized "operators"). These are meant to be a better approach for pulling in just the operators you need than the "patch" operators found in `rxjs/add/operator/*`.

**NOTE**: During 5.5 beta we will be bikeshedding a few of the names for operators that we had to give new names to due to keyword restrictions in javascript. 

These operators are:

1. `do` -> `tap`
2. `catch` -> `catchError`
3. `switch` -> `switchAll`
4. `finally` -> `finalize`


## Why?

Problems with the patched operators for dot-chaining are:

1. Any library that imports a patch operator will augment the `Observable.prototype` for all consumers of that library, creating blind dependencies. If the library removes their usage, they unknowingly break everyone else. With lettables, you have to import the operators you need into each file you use them in.
2. Operators patched directly onto the prototype are not "tree-shakeable" by tools like rollup or webpack. Lettable operators will be as they are just functions pulled in from modules directly.
3. Unused operators that are being imported in apps cannot be detected reliably by any sort of build tooling or lint rule. That means that you might import `scan`, but stop using it, and it's still being added to your output bundle. With lettable operators, if you're not using it, a lint rule can pick it up for you.
4. Functional composition is awesome. Building your own custom operators becomes much, much easier, and now they work and look just like all other operators from rxjs. You don't need to extend Observable or override `lift` anymore.

## What?

What is a lettable operator? Simply put, a function that can be used with the current `let` operator. It's the origin of the name, for better or worse. A lettable operator is basically any function that returns a function with the signature: `<T, R>(source: Observable<T>) => Observable<R>`.

There is a `pipe` method built into `Observable` now at `Observable.prototype.pipe` that сan be used to compose the operators in similar manner to what you're used to with dot-chaining (shown below).

There is also a `pipe` utility function at `rxjs/utils/pipe` that can be used to build reusable lettable operators from other lettable operators.

## Usage

You pull in any operator you need from one spot, under `'rxjs/operators'` (**plural!**). It's also recommended to pull in the Observable creation methods you need directly as shown below with `range`:

```ts
import { range } from 'rxjs/observable/range';
import { map, filter, scan } from 'rxjs/operators';

const source$ = range(0, 10);

source$.pipe(
  filter(x => x % 2 === 0),
  map(x => x + x),
  scan((acc, x) => acc + x, 0)
)
.subscribe(x => console.log(x))
```

## Build Your Own Operators Easily

You, in fact, could _always_ do this with `let`... but building your own operator is as simple as writing a function now. Notice, that you can compose your custom operator in with other rxjs operators seamlessly.

```ts
import { interval } from 'rxjs/observable/interval';
import { map, take, toArray } from 'rxjs/operators';

/**
 * an operator that takes every Nth value
 */
const takeEveryNth = (n: number) => <T>(source: Observable<T>) =>
  new Observable(observer => {
    let count = 0;
    return source.subscribe({
      next(x) {
        if (count++ % n === 0) observer.next(x);
      },
      error(err) { observer.error(err); },
      complete() { observer.complete(); }
    })
  });


interval(1000).pipe(
  takeEveryNth(2),
  map(x => x + x),
  takeEveryNth(3),
  take(3),
  toArray()
)
.subscribe(x => console.log(x));
// [0, 12, 24]
```

## Known Issues

In TypeScript 2.3 and lower, typings will need to be added to functions passed to operators, as types cannot be inferred prior to TypeScript 2.4. In TypeScript 2.4, types will infer via composition properly.

**TS 2.3 and under**

```ts
range(0, 10).pipe(
  map((n: number) => n + '!'),
  map((s: string) => 'Hello, ' + s),
).subscribe(x => console.log(x))
```

**TS 2.4 and up**

```ts
range(0, 10).pipe(
  map(n => n + '!'),
  map(s => 'Hello, ' + s),
).subscribe(x => console.log(x))
```
