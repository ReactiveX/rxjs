# Version 6 Release Notes And Migration Guide

## (NOTE: We're Still RC right now, just getting ready, this doc still applies)

As this is a major version release, we have a few breaking changes we need to make sure every knows about, and we need to let all of you know how to migrate your apps to v6 as smoothly as possible.

## Helpful Tips For Migration

To get started using v6 with your existing v5 code, please try the following steps:

1. Update to the latest `5.5.X` version of RxJS. This will uncover any errors that might be a result of bugs in your code
  exposed by bug fixes. In particular a bug was fixed in `5.5.6` that stopped *some* errors thrown synchronously in operators like `mergeMap`
  from being properly propagated. (They were swallowed). So get pasted `5.5.6` right away to make sure those issues are covered.
2. Install rxjs 6 via npm or yarn (e.g. `npm i -S rxjs@rc`) (TODO: Update this after rc is over)
3. Install `rxjs-compat` via npm or yarn (e.g. `npm i -S rxjs-compat@rc`) (TODO: Update this after rc is over) - This library will enable imports from locations that are removed in
  v6, as well as provide the ability to use the `rxjs/add/operator/`-style imports. At this point, the app should be working for most of you.
4. TypeScript Users: Try installing and running `rxjs-lint` with `tslint --fix`. This will automagically going through and update your code to be v6 compliant. You
  may need to run it more than once. More information can be found here: https://github.com/reactivex/rxjs-tslint
5. LAST DITCH: If steps 2-3 DO NOT work... you can try `rxjs@forward-compat`, (a.k.a `5.6.0-forward-compat`). This package is almost exactly the same as
  v5.5, only it exports from `rxjs` just like v6 does, so importing the kitchen sink like some people did in v5 is the only thing that will break.
6. If you are STILL having problems. Please file an issue with any error messages or reproduction you can provide.

Major Changes are as follows:

## Consolidated Exports

There are now fewer entry points to the library. Instead of importing your RxJS types from all over
the library, you'll import from (generally) two locations: `rxjs` and `rxjs/operators`, there are a few more, but those are the main two.

Main export points:

- `rxjs`: All classes (`Observable`, `Subject`, etc), creation methods (`from`, `interval`, `concat`, `merge` etc), schedulers, utilities and helpers can be found here.
- `rxjs/operators`: All operators can be found here (`map`, `filter`, `mergeMap`, etc).

Other export points:

- `rxjs/testing`: The `TestScheduler` and friends can be found here
- `rxjs/ajax`: This is the new home for the rxjs AJAX implementation
- `rxjs/webSocket`: This is the home for the rxjs web socket implementation.


### Import Migration Table

<table>
  <thead>
    <tr>
      <th></th>
      <th>v6</th>
      <th>v5.5</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        any operator, such as <code>mergeMap</code>
      </td>
      <td>
        <pre>import { mergeMap } from 'rxjs/operators';</pre>
      </td>
      <td>
        <pre>import { mergeMap } from 'rxjs/operators/mergeMap';
import 'rxjs/add/operator/mergeMap';
import { mergeMap } from 'rxjs/operator/mergeMap';</pre>
      </td>
    </tr>
    <tr>
      <td>creation methods like <code>fromEvent</code> or <code>interval</code></td>
      <td><pre>import { fromEvent } from 'rxjs';</pre></td>
      <td><pre>import { fromEvent } from 'rxjs/observable/fromEvent';
import 'rxjs/add/observable/fromEvent';</pre></td>
    </tr>
    <tr>
      <td>schedulers like <code>async</code> are now <code>asyncScheduler</code></td>
      <td><pre>import { asyncScheduler } from 'rxjs';</pre></td>
      <td><pre>import { async } from 'rxjs/scheduler/async';</pre></td>
    </tr>
    <tr>
      <td>utilities like <code>pipe</code> and <code>noop</code> </td>
      <td><pre>import { pipe } from 'rxjs';</pre></td>
      <td><pre>import { pipe } from 'rxjs/util/pipe';</pre></td>
    </tr>
  </tbody>
</table>



### Moved Or Restricted Internal Implementation Details

There were many types exposed before that were really internal implementation details that people were using freely. Most notable
of these were the exposed `Observable` classes, such as `ErrorObservable` or `ArrayObservable` that many people were using. Unfortunately,
we never intended for these classes to be used directly. Instead, their creation function counterparts should be used, as that was the
original intention.

#### Moved Observable Types

| v6                            | v5                            |
|-------------------------------|-------------------------------|
| `from`                        | `ArrayLikeObservable`         |
| `of`                          | `ArrayObservable`             |
| `bindCallback`                | `BoundCallbackObservable`     |
| `bindNodeCallback`            | `BoundNodeCallbackObservable` |
| `defer`                       | `DeferObservable`             |
| `empty` or `EMPTY` (constant) | `EmptyObservable`             |
| `throwError`                  | `ErrorObservable`             |
| `forkJoin`                    | `ForkJoinObservable`          |
| `fromEvent`                   | `FromEventObservable`         |
| `fromEventPattern`            | `FromEventPatternObservable`  |
| `from`                        | `FromObservable`              |
| `generate`                    | `GenerateObservable`          |
| `iif`                         | `IfObservable`                |
| `interval`                    | `IntervalObservable`          |
| `from`                        | `IteratorObservable`          |
| `NEVER` (constant)            | `NeverObservable`             |
| `pairs`                       | `PairsObservable`             |
| `from`                        | `PromiseObservable`           |
| `range`                       | `RangeObservable`             |
| `of`                          | `ScalarObservable`            |
| `timer`                       | `TimerObservable`             |
| `using`                       | `UsingObservable`             |

#### Removed `fromPromise`

Just use `from`. The reason is that any use of an operator/method that accepts an observable or something that can be observed (like a `Promise` or `Array`, etc), already
imports most of the `from` implementation anyhow. `fromPromise` just increased the API surface area.


## Unhandled Errors Are No Longer Thrown Synchronously

All uncaught errors are no being thrown a new callstack via "host report errors". This basically means unhandled errors are thrown in a `setTimeout`. The main
reason for doing this is to prevent a really nasty set of bugs calls "producer interfence", in which unhandled, synchronous errors thrown after a multicast would
break the mulicast for all listeners.

This means that some code that relied on synchronous error handling will now be broken. This includes, things like:

```ts
try {
    source$.subscribe(() => {
       throw new Error('bad');
    });
} catch (err) {
  // this will no longer ne hit.
}
```

or

```ts
expect(source$.pipe(x => { throw new Error('bad'); }))
  .toThrow(new Error(bad));

// Will throw, but it will no longer pass.
```

## New Operator

`errorIfEmpty<T>(errorFactory: () => any): Observable<T>` - If the source observable completes without emitting a value, the `errorFactory` will be called and the returned error will be emitted as an error from the resulting `Observable`. This operator was developed to mirror `defaultIfEmpty`, and to enable creating smaller `first` and `last` operators.

## Deprecations

### ResultSelectors

Result selectors on operators like `mergeMap`, `switchMap`, etc, are deprecated and will be removed in version 7.

#### mergeMap

with resultSelector (v 5.x). NOTE: The concurrency limit argument is still optional, it is only shown here to be thorough.

```ts
source.pipe(
  mergeMap(fn1, fn2, concurrency)
)
```

the same functionality without resultSelector, achieved with inner map.

```ts
source.pipe(
  mergeMap((a, i) => fn1(a, i).pipe(
    map((b, ii) => fn2(a, b, i, ii))
  )),
  concurrency
)
```

#### mergeMapTo

with resultSelector (v 5.x)

```ts
source.pipe(
  mergeMapTo(a$, resultSelector)
)
```

without resultSelector

```ts
source.pipe(
  mergeMap((x, i) => a$.pipe(
    map((y, ii) => resultSelector(x, y, i, ii))
  )
)
```

#### concatMap

with resultSelector (v 5.x)

```ts
source.pipe(
  concatMap(fn1, fn2)
)
```

the same functionality without resultSelector, achieved with inner map

```ts
source.pipe(
  concatMap((a, i) => fn1(a, i).pipe(
    map((b, ii) => fn2(a, b, i, ii))
  )
)
```

#### concatMapTo

with resultSelector (v 5.x)

```ts
source.pipe(
  concatMapTo(a$, resultSelector)
)
```

without resultSelector

```ts
source.pipe(
  concatMap((x, i) => a$.pipe(
    map((y, ii) => resultSelector(x, y, i, ii))
  )
)
```

#### switchMap

with resultSelector (v 5.x)

```ts
source.pipe(
  switchMap(fn1, fn2)
)
```

the same functionality without resultSelector, achieved with inner map

```ts
source.pipe(
  switchMap((a, i) => fn1(a, i).pipe(
    map((b, ii) => fn2(a, b, i, ii))
  )
)
```

#### switchMapTo

with resultSelector (v 5.x)

```ts
source.pipe(
  switchMapTo(a$, resultSelector)
)
```

without resultSelector

```ts
source.pipe(
  switchMap((x, i) => a$.pipe(
    map((y, ii) => resultSelector(x, y, i, ii))
  )
)
```

#### exhaustMap

with resultSelector (v 5.x)

```ts
source.pipe(
  exhaustMap(fn1, fn2)
)
```

the same functionality without resultSelector, achieved with inner map

```ts
source.pipe(
  exhaustMap((a, i) => fn1(a, i).pipe(
    map((b, ii) => fn2(a, b, i, ii))
  )
)
```

#### first

with resultSelector (v5)

```ts
source.pipe(
  first(predicate, resultSelector, defaultValue)
)
```

without resultSelector (if you're not using the index in it):

```ts
source.pipe(
  first(predicate, defaultValue),
  map(resultSelector)
)
```

without resultSelector (if you ARE using the index in it)

```ts
source.pipe(
  map((v, i) => [v, i]),
  first(([v, i]) => predicate(v, i)),
  map(([v, i]) => resultSelector(v, i)),
)
```

#### last

with resultSelector (v5)

```ts
source.pipe(
  last(predicate, resultSelector, defaultValue)
)
```

without resultSelector (if you're not using the index in it):

```ts
source.pipe(
  last(predicate, defaultValue),
  map(resultSelector)
)
```

without resultSelector (if you ARE using the index in it)

```ts
source.pipe(
  map((v, i) => [v, i]),
  last(([v, i]) => predicate(v, i)),
  map(([v, i]) => resultSelector(v, i)),
)
```

#### forkJoin

with resultSelector

```ts
forkJoin(a$, b$, c$, resultSelector)

// or

forkJoin([a$, b$, c$], resultSelector)
```

without resultSelector

```ts
forkJoin(a$, b$, c$).pipe(
  map(x => resultSelector(...x))
)

// or

forkJoin([a$, b$, c$]).pipe(
  map(x => resultSelector(...x))
)
```

#### zip

with resultSelector

```ts
zip(a$, b$, c$, resultSelector)

// or

zip([a$, b$, c$], resultSelector)
```

without resultSelector

```ts
zip(a$, b$, c$).pipe(
  map(x => resultSelector(...x))
)

// or

zip([a$, b$, c$]).pipe(
  map(x => resultSelector(...x))
)
```

#### combineLatest

with resultSelector

```ts
combineLatest(a$, b$, c$, resultSelector)

// or

combineLatest([a$, b$, c$], resultSelector)
```

without resultSelector

```ts
combineLatest(a$, b$, c$).pipe(
  map(x => resultSelector(...x))
)

// or

combineLatest([a$, b$, c$]).pipe(
  map(x => resultSelector(...x))
)
```

#### fromEvent

with resultSelector

```ts
fromEvent(button, 'click', resultSelector)
```

without resultSelector

```ts
fromEvent(button, 'click').pipe(
  map(resultSelector)
)
```


### never and empty

`never()` is deprecated and you should use `NEVER`, which is a constant. `empty()` without a scheduler is also deprecated in favor of `EMPTY` which is a constant.

