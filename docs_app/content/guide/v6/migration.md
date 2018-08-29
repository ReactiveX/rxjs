# RxJS v5.x to v6 Update Guide

RxJS v6 has arrived! While this is a major version change (from 5.x to 6.x), 
we've put in a lot of work to keep the hard breaking changes to a minimum. 
In most cases, this allows application and library developers to update incrementally 
and use RxJS v6 without any modifications to their code.

A backward-compatibility layer eases the update process, allowing you to keep your 
apps working while you address most code changes at your own pace. 
The overall process can be carried out in stages:

1. Update to the latest version of RxJS 5.5 and ensure that you've fixed any issues caused by bug fixes.

2. Install RxJS v6 along with the [backward-compatibility](#backwards-compatibility) package, `rxjs-compat`.

3. If your app is affected by the few [breaking changes](#breaking-changes) not covered by `rxjs-compat`, update the affected code according to the instructions provided below.

4. Eventually, you will want to [drop the compatibility layer](#drop-compat) to complete the update to RxJS v6. Doing so will significantly decrease the size of your apps. 

 To refactor TypeScript code so that it doesn't depend on rxjs-compat, you can use `rxjs-tslint`.

```sh
npm i -g rxjs-tslint
rxjs-5-to-6-migrate -p [path/to/tsconfig.json]
```

5. Before RxJS release v7, you will need to remove and replace all use of [deprecated functionality](#deprecations).

## Backwards compatibility

In order to minimize the impact of the upgrade, RxJS v6 releases with a sibling package,  `rxjs-compat`, which provides a compatibility layer between the v6 and v5 APIs.
Most developers with existing applications should upgrade by installing both `rxjs` and `rxjs-compat` at ^6.0.0:

`npm install rxjs@6 rxjs-compat@6 --save`

For details about this package, see https://www.npmjs.com/package/rxjs-compat.

The compatibility package increases the bundle size of your application, which is why we recommend removing it as soon as your application and dependencies have been updated. 
This size increase is exacerbated if you are using a version of Webpack before 4.0.0. 

For a full explanation of what you will have to update in order to remove `rxjs-compat`, see [Dropping the compatibility layer](#drop-compat). Note also that fully updating your application to v6 may expose existing type errors that were not previously shown. 

<a id="breaking-changes"></a>

## Breaking changes not covered by rxjs-compat

If you have installed `rxjs-compat`, there are only two breaking changes that you might need to address immediately. 

### Synchronous error handling

Synchronous error handling (placing a call to the `Observable.subscribe()` method within a `try/catch` block) is no longer supported. If it is used, it must be replaced with asynchronous error handling, using the `error` callback in the `Observable.subscribe()` method. See [examples](#ex-1).

### TypeScript prototype operators

If you are defining your own prototype operators in TypeScript and modifying the `Observable` namespace, you will need to change your operator code in order to get TypeScript to compile. See [examples](#ex-2). This is a relatively rare case, likely to affect only advanced TypeScript developers. 

<a id="ex-1"></a>
__Replacing synchronous error handling__
The following example shows code that subscribes to an observable within a `try/catch` block, in order to handle errors synchronously:

```ts
try {
  source$.subscribe(nextFn, undefined, completeFn);
} catch (err) {
  handleError(err);
}
```

The following code updates this to handle errors asynchronously by defining an error callback for  `Observable.subscribe()`:

```ts
source$.subscribe(nextFn, handleError, completeFn);
```

The next example shows a test that relies on synchronous error handling:

```ts
it('should emit an error on subscription', () => {
  expect(source$.subscribe()).toThrow(Error, 'some message');
});
```

The following code shows how to correct the test to use asynchronous error handling:

```ts
it('should emit an error on subscription', (done) => {
  source$.subscribe({
    error(err) {
      expect(err.message).toEqual('some message');
    }
  });
});
```

<a id="ex-2"></a>
__TypeScript user-defined prototype operators__

The following example shows the kind of changes you will need to make in user-defined prototype operators, in order for the TypeScript to compile correctly.

Here is an example of a user-defined prototype operator:

```ts
Observable.prototype.userDefined = function () {
  return new Observable((subscriber) => {
    this.subscribe({
      next(value) { subscriber.next(value); },
      error(err) { subscriber.error(err); },
      complete() { subscriber.complete(); },
   });
  });
};

source$.userDefined().subscribe();
```

To make this code compile correctly in v6, change it as shown here:

```ts
const userDefined = <T>() => (source: Observable<T>) => new Observable<T>((subscriber) => {
    source.subscribe({
      next(value) { subscriber.next(value); },
      error(err) { subscriber.error(err); },
      complete() { subscriber.complete(); },
   });
  });
});

source$.pipe(
  userDefined(),
)
.subscribe();
```

<a id="drop-compat"></a>

## Dropping the compatibility layer

If you use functionality that is removed from v6, but supported by the `rxjs-compat` package, you must refactor or rewrite code to complete the update to v6. The following areas of functionality depend on the compatibility layer:

* Import paths have changed. 
* Operator syntax has changed to use piping instead of chaining. 
* Classes that operate on observables have been replaced by functions.
* In functions that have the resultSelector parameter, the parameters have been deprecated in most cases, and removed for two functions. The ones that have been removed must be updated before you can remove the compatibility layer.

### Import paths

If you're a TypeScript developer, it's recommended that you use `rxjs-tslint` to refactor your import paths.

For JavaScript developers, the general rule is as follows:

1. **rxjs:** Creation methods, types, schedulers and utilities
```ts
import { Observable, Subject, asapScheduler, pipe, of, from, interval, merge, fromEvent, SubscriptionLike, PartialObserver } from 'rxjs';
```

2. **rxjs/operators**: All pipeable operators:
```ts
import { map, filter, scan } from 'rxjs/operators';
```

3. **rxjs/webSocket:** The web socket subject implementation
```ts
import { webSocket } from 'rxjs/webSocket';
```

4. **rxjs/ajax**: The Rx ajax implementation
```ts
import { ajax } from 'rxjs/ajax';
```

5. **rxjs/testing**: The testing utilities
```ts
import { TestScheduler } from 'rxjs/testing';
```

### Operator pipe syntax

The previous coding style of chaining operators has been replaced by piping the result of one operator to another. Pipeable operators were added in version 5.5. For a full discussion of the reasoning and changes required for pipeable operators, see [RxJS documentation](https://github.com/ReactiveX/rxjs/blob/91088dae1df097be2370c73300ffa11b27fd0100/doc/pipeable-operators.md). 

Before you can remove the compatibility layer, you must refactor your code to use only pipeable operators. For Typescript, the `tslint` tool automates the process to some extent, by applying the transform to well-typed code.

* See [Operator Pipe Syntax](#pipe-syntax) for details of how to refactor using [rxjs-tslint](https://github.com/reactivex/rxjs-tslint).

### Observable classes

All observable classes ([https://github.com/ReactiveX/rxjs/tree/5.5.8/src/observable](https://github.com/ReactiveX/rxjs/tree/5.5.8/src/observable)) have been removed from v6, in favor of existing or new operators that perform the same operations as the class methods. For example, `ArrayObservable.create(myArray)` can be replaced by `from(myArray)`, or the new operator `fromArray()`.

* `ConnectableObservable` is hidden from direct use in v6 and is accessible only through operators `multicast`, `publish`, `publishReplay`, and `publishLast`.

* `SubscribeOnObservable` is hidden from direct use in v6 and is accessible only through operator `subscribeOn`.

<table>
  <tr>
    <td>v6 creation function</td>
    <td>v5 class</td>
  </tr>
  <tr>
    <td>from</td>
    <td>ArrayLikeObservable</td>
  </tr>
  <tr>
    <td>of</td>
    <td>ArrayObservable</td>
  </tr>
  <tr>
    <td>bindCallback</td>
    <td>BoundCallbackObservable</td>
  </tr>
  <tr>
    <td>bindNodeCallback</td>
    <td>BoundNodeCallbackObservable</td>
  </tr>
  <tr>
    <td>defer</td>
    <td>DeferObservable</td>
  </tr>
  <tr>
    <td>empty or EMPTY (constant)</td>
    <td>EmptyObservable</td>
  </tr>
  <tr>
    <td>throwError</td>
    <td>ErrorObservable</td>
  </tr>
  <tr>
    <td>forkJoin</td>
    <td>ForkJoinObservable</td>
  </tr>
  <tr>
    <td>fromEvent</td>
    <td>FromEventObservable</td>
  </tr>
  <tr>
    <td>fromEventPattern</td>
    <td>FromEventPatternObservable</td>
  </tr>
  <tr>
    <td>from</td>
    <td>FromObservable</td>
  </tr>
  <tr>
    <td>generate</td>
    <td>GenerateObservable</td>
  </tr>
  <tr>
    <td>iif</td>
    <td>IfObservable</td>
  </tr>
  <tr>
    <td>interval</td>
    <td>IntervalObservable</td>
  </tr>
  <tr>
    <td>from</td>
    <td>IteratorObservable</td>
  </tr>
  <tr>
    <td>NEVER (constant)</td>
    <td>NeverObservable</td>
  </tr>
  <tr>
    <td>pairs</td>
    <td>PairsObservable</td>
  </tr>
  <tr>
    <td>from</td>
    <td>PromiseObservable</td>
  </tr>
  <tr>
    <td>range</td>
    <td>RangeObservable</td>
  </tr>
  <tr>
    <td>of</td>
    <td>ScalarObservable</td>
  </tr>
  <tr>
    <td>timer</td>
    <td>TimerObservable</td>
  </tr>
  <tr>
    <td>using</td>
    <td>UsingObservable</td>
  </tr>
</table>

### Result selectors removed or deprecated

Result selectors are a feature not many people use (in many cases they weren't documented), but were adding significant bloat to the codebase. If you use them, you will need to replace the discontinued `resultSelector` parameter with external result-selection code.

* The `resultSelector` parameter for `first()` and `last()` are *removed* in v6. If these are used, the code must be updated to run without the `rxjs-compat` package.

* The `resultSelector` parameter available for many mapping operators has been *deprecated* for v6 and the implementation re-written to be much smaller. They will continue to work without the compatibility package, but must be replaced before the v7 release. See [Deprecations](#deprecations).

See [Result Selector Migration](#result-selectors) for details of which operators are affected and how to move the result-selection functions out of the operator call.

<a id="deprecations"></a>

## Deprecations

Before RxJS releases v7, you will need to remove and replace all use of deprecated functionality. The following areas contain deprecated functionality:

* `Observable.if`  and `Observable.throw`
 These methods have been replaced by the static `iif()` and `throwError()` functions. Use [rxjs-tslint](https://github.com/reactivex/rxjs-tslint) to convert method calls with function calls. 
 
 See [Convert deprecated methods](#dep-methods) for details.

* "Creation" operators
 The following operators have been moved from `rxjs/operators` to `rxjs`, and their usage has changed:

 * `merge`
 * `concat`
 * `combineLatest`
 * `race`
 * `zip` 
 
 See [Convert deprecated methods](#dep-methods) for details.

* Result selectors

See [Result Selector Migration](#result-selectors) for details of which operators are affected and how to move the result-selection functions out of the operator call.

<a id="pipe-syntax"></a>

### HowTo: Convert to pipe syntax

Before converting dot-chained operators to pipeable operators, make sure you import all operators used from `rxjs/operators`. For example:

```
import { map, filter, catchError, mergeMap } from 'rxjs/operators';
``` 

The following operator names were changed because their dot-chained names are reserved words in JavaScript:

* `do` -> `tap`
* `catch` -> `catchError`
* `switch` -> `switchAll`
* `finally` -> `finalize`

To convert dot-chained operators to pipeable operators, wrap all operators in the `pipe()` method from the source observable, remove the dots, and add commas to pass each operation to `pipe()` as an argument.

For example, the following code uses chaining:

```ts
source
 .map(x => x + x)
 .mergeMap(n => of(n + 1, n + 2)
   .filter(x => x % 1 == 0)
   .scan((acc, x) => acc + x, 0)
 )
 .catch(err => of('error found'))
 .subscribe(printResult);
```

To convert to piping:

```ts
source.pipe(
 map(x => x + x),
 mergeMap(n => of(n + 1, n + 2).pipe(
   filter(x => x % 1 == 0),
   scan((acc, x) => acc + x, 0),
 )),
 catchError(err => of('error found')),
).subscribe(printResult); 
```

<a id="dep-methods"></a>

### HowTo: Convert deprecated methods

**Observable.if > iif()**

```ts
Observable.if(test, a$, b$);

// becomes

iif(test, a$, b$);
``` 

**Observable.error > throwError()**

```ts
Observable.throw(new Error());

// becomes

throwError(new Error());
```

**merge**
```ts
import { merge } from 'rxjs/operators';
a$.pipe(merge(b$, c$));

// becomes

import { merge } from 'rxjs';
merge(a$, b$, c$);
```

**concat**

```ts
import { concat } from 'rxjs/operators';
a$.pipe(concat(b$, c$));

// becomes

import { concat } from 'rxjs';
concat(a$, b$, c$);
```

**combineLatest**

```ts
import { combineLatest } from 'rxjs/operators';
a$.pipe(combineLatest(b$, c$));

// becomes

import { combineLatest } from 'rxjs';
combineLatest(a$, b$, c$);
```

**race**

```ts
import { race } from 'rxjs/operators';
a$.pipe(race(b$, c$));

// becomes

import { race } from 'rxjs';
race(a$, b$, c$);
```

**zip**

```ts
import { zip } from 'rxjs/operators';
a$.pipe(zip(b$, c$));

// becomes

import { zip } from 'rxjs';
zip(a$, b$, c$); 
```

<a id="result-selectors"></a>

### HowTo: Result selector migration

In RxJS v5.x, a number of operators have an optional resultSelector argument, in which you can pass a function for handling the result of the operations.  

If you are using the parameter, you must update your code by moving your result-selection function out of the original operator call, and applying it to the results of the call.

* The parameter has been *removed *from the first() and last() operators in v6, but is supported by the rxjs-compat package. You must update your code in order to drop the compatibility package.

* The parameter is *deprecated *in the following operators, and will be removed in v7. You must update your code before moving to the v7.

    * mergeMap()
    * mergeMapTo()
    * concatMap()
    * concatMapTo()
    * switchMap
    * switchMapTo()
    * exhaustMap()
    * forkJoin()
    * zip()
    * combineLatest()
    * fromEvent()  

**first()**

* with resultSelector (v5.x)
```ts
source.pipe(
 first(predicate, resultSelector, defaultValue)
) 
```

* without resultSelector (if you're not using the index in it):

```ts
source.pipe(
 first(predicate, defaultValue),
 map(resultSelector)
) 
```
* without resultSelector (if you ARE using the index in it)

``` ts
source.pipe(
 map((v, i) => [v, i]),
 first(([v, i]) => predicate(v, i)),
 map(([v, i]) => resultSelector(v, i)),
)
```

**last()**

* with resultSelector (v5.x)

```ts
source.pipe(
 last(predicate, resultSelector, defaultValue)
) 
```

* without resultSelector (if you're not using the index in it):

```ts
source.pipe(
 last(predicate, defaultValue),
 map(resultSelector)
)
```

* without resultSelector (if you ARE using the index in it)

```ts
source.pipe(
 map((v, i) => [v, i]),
 last(([v, i]) => predicate(v, i)),
 map(([v, i]) => resultSelector(v, i)),
)
```

**mergeMap()**

* with resultSelector (v5.x)  
*NOTE: The concurrency-limit argument is optional, shown here for completeness.*

```ts
source.pipe(
 mergeMap(fn1, fn2, concurrency)
)
```

* the same functionality without resultSelector, achieved with inner map.

```ts
source.pipe(
 mergeMap((a, i) => fn1(a, i).pipe(
   map((b, ii) => fn2(a, b, i, ii))
 )),
 concurrency
)
```

**mergeMapTo()**

* with resultSelector (v5.x)

```ts
source.pipe(
 mergeMapTo(a$, resultSelector)
)
```

* without resultSelector

```ts
source.pipe(
 mergeMap((x, i) => a$.pipe(
   map((y, ii) => resultSelector(x, y, i, ii))
 )
)
```

**concatMap()**

* with resultSelector (v5.x)

```ts
source.pipe(
 concatMap(fn1, fn2)
)
```

* the same functionality without resultSelector, achieved with inner map:

```ts
source.pipe(
 concatMap((a, i) => fn1(a, i).pipe(
   map((b, ii) => fn2(a, b, i, ii))
 )
)
```

**concatMapTo()**

* with resultSelector (v5.x)

```ts
source.pipe(
 concatMapTo(a$, resultSelector)
)
```

* without resultSelector

```ts
source.pipe(
 concatMap((x, i) => a$.pipe(
   map((y, ii) => resultSelector(x, y, i, ii))
 )
)
```

**switchMap()**

* with resultSelector (v5.x)

```ts
source.pipe(
 switchMap(fn1, fn2)
)
```

* the same functionality without resultSelector, achieved with inner map

```ts
source.pipe(
 switchMap((a, i) => fn1(a, i).pipe(
   map((b, ii) => fn2(a, b, i, ii))
 )
)
```

**switchMapTo()**

* with resultSelector (v5.x)

```ts
source.pipe(
 switchMapTo(a$, resultSelector)
)
```

* without resultSelector

```ts
source.pipe(
 switchMap((x, i) => a$.pipe(
   map((y, ii) => resultSelector(x, y, i, ii))
 )
)
```

**exhaustMap()**

* with resultSelector (v5.x)

```ts
source.pipe(
 exhaustMap(fn1, fn2)
)
```

* the same functionality without resultSelector, achieved with inner map

```ts
source.pipe(
 exhaustMap((a, i) => fn1(a, i).pipe(
   map((b, ii) => fn2(a, b, i, ii))
 )
)
```

**forkJoin()**

* with resultSelector (v5.x)

```ts
forkJoin(a$, b$, c$, resultSelector)
// or
forkJoin([a$, b$, c$], resultSelector)
```

* without resultSelector

```ts
forkJoin(a$, b$, c$).pipe(
 map(x => resultSelector(...x))
)
// or
forkJoin([a$, b$, c$]).pipe(
 map(x => resultSelector(...x))
)
```

**zip()**

* with resultSelector (v5.x)

```ts
zip(a$, b$, c$, resultSelector)
// or
zip([a$, b$, c$], resultSelector)
```

* without resultSelector

```ts
zip(a$, b$, c$).pipe(
 map(x => resultSelector(...x))
)
// or
zip([a$, b$, c$]).pipe(
 map(x => resultSelector(...x))
)
```

**combineLatest()**

* with resultSelector (v5.x)

```ts
combineLatest(a$, b$, c$, resultSelector)
// or
combineLatest([a$, b$, c$], resultSelector)
```

* without resultSelector

```ts
combineLatest(a$, b$, c$).pipe(
 map(x => resultSelector(...x))
)
// or
combineLatest([a$, b$, c$]).pipe(
 map(x => resultSelector(...x))
)
```

**fromEvent()**

* with resultSelector (v5.x)

```ts
fromEvent(button, 'click', resultSelector)
```

* without resultSelector

```ts
fromEvent(button, 'click').pipe(
 map(resultSelector)
)
```

### UMD module name change
In RxJS v6.x, UMD module name has been changed from Rx to rxjs so that it's align with other imports module name.

```js
const rx= Rx;

rx.Observable.of(1,2,3).map(x => x + '!!!');

// becomes

const { of } = rxjs;
const { map } = rxjs.operators;

of(1,2,3).pipe(map(x => x + '!!!')); // etc
```