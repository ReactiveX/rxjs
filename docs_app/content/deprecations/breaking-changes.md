# Breaking Changes in Version 7

## General

- **TS:** RxJS requires TS 4.2

- **rxjs-compat:** `rxjs-compat` is not published for v7

- **toPromise:** toPromise return type now returns `T | undefined` in TypeScript, which is correct, but may break builds.

- **Subscription:** `add` no longer returns an unnecessary Subscription reference. This was done to prevent confusion caused by a legacy behavior. You can now add and remove functions and Subscriptions as teardowns to and from a `Subscription` using `add` and `remove` directly. Before this, `remove` only accepted subscriptions.

- **Observable:** `lift` no longer exposed. It was _NEVER_ documented that end users of the library should be creating operators using `lift`. Lift has a [variety of issues](https://github.com/ReactiveX/rxjs/issues/5431) and was always an internal implementation detail of rxjs that might have been used by a few power users in the early days when it had the most value. The value of `lift`, originally, was that subclassed `Observable`s would compose through all operators that implemented lift. The reality is that feature is not widely known, used, or supported, and it was never documented as it was very experimental when it was first added. Until the end of v7, `lift` will remain on Observable. Standard JavaScript users will notice no difference. However, TypeScript users might see complaints about `lift` not being a member of observable. To workaround this issue there are two things you can do: 1. Rewrite your operators as [outlined in the documentation](https://rxjs.dev/guide/operators), such that they return `new Observable`. or 2. cast your observable as `any` and access `lift` that way. Method 1 is recommended if you do not want things to break when we move to version 8.

- **Subscriber:** `new Subscriber` no longer takes 0-3 arguments. To create a `Subscriber` with 0-3 arguments, use `Subscriber.create`. However, please note that there is little to no reason that you should be creating `Subscriber` references directly, and `Subscriber.create` and `new Subscriber` are both deprecated.

- **onUnhandledError:** Errors that occur during setup of an observable subscription after the subscription has emitted an error or completed will now throw in their own call stack. Before it would call `console.warn`. This is potentially breaking in edge cases for node applications, which may be configured to terminate for unhandled exceptions. In the unlikely event this affects you, you can configure the behavior to `console.warn` in the new configuration setting like so: `import { config } from 'rxjs'; config.onUnhandledError = (err) => console.warn(err);`

- **RxJS Error types** Tests that are written with naive expectations against errors may fail now that errors have a proper `stack` property. In some testing frameworks, a deep equality check on two error instances will check the values in `stack`, which could be different.

- `unsubscribe` no longer available via the `this` context of observer functions. To reenable, set `config.useDeprecatedNextContext = true` on the rxjs `config` found at `import { config } from 'rxjs';`. Note that enabling this will result in a performance penalty for all consumer subscriptions.

- Leaked implementation detail `_unsubscribeAndRecycle` of `Subscriber` has been removed. Just use new `Subscription` objects

- The static `sortActions` method on `VirtualTimeScheduler` is no longer publicly exposed by our TS types.

- `Notification.createNext(undefined)` will no longer return the exact same reference everytime.

- Type signatures tightened up around `Notification` and `dematerialize`, may uncover issues with invalid types passed to those operators.

- Experimental support for `for await` as been removed. Use https://github.com/benlesh/rxjs-for-await instead.

- `ReplaySubject` no longer schedules emissions when a scheduler is provided. If you need that behavior,
  please compose in `observeOn` using `pipe`, for example: `new ReplaySubject(2, 3000).pipe(observeOn(asap))`

- **rxjs-compat:** `rxjs/Rx` is no longer a valid import site.

## Operators

### concat

- **concat:** Generic signature changed. Recommend not explicitly passing generics, just let inference do its job. If you must, cast with `as`.
- **of:** Generic signature changed, do not specify generics, allow them to be inferred or use `as`

### count

- **count:** No longer passes `source` observable as a third argument to the predicate. That feature was rarely used, and of limited value. The workaround is to simply close over the source inside of the function if you need to access it in there.

### defer

- `defer` no longer allows factories to return `void` or `undefined`. All factories passed to defer must return a proper `ObservableInput`, such as `Observable`, `Promise`, et al. To get the same behavior as you may have relied on previously, `return EMPTY` or `return of()` from the factory.

### map

- **map:** `thisArg` will now default to `undefined`. The previous default of `MapSubscriber` never made any sense. This will only affect code that calls map with a `function` and references `this` like so: `source.pipe(map(function () { console.log(this); }))`. There wasn't anything useful about doing this, so the breakage is expected to be very minimal. If anything we're no longer leaking an implementation detail.

### mergeScan

- **mergeScan:** `mergeScan` will no longer emit its inner state again upon completion.

### of

- **of:** Use with more than 9 arguments, where the last argument is a `SchedulerLike` may result in the wrong type which includes the `SchedulerLike`, even though the run time implementation does not support that. Developers should be using `scheduled` instead

### pairs

- **pairs:** `pairs` will no longer function in IE without a polyfill for `Object.entries`. `pairs` itself is also deprecated in favor of users just using `from(Object.entries(obj))`.

### race

- **race:** `race()` will no longer subscribe to subsequent observables if a provided source synchronously errors or completes. This means side effects that might have occurred during subscription in those rare cases will no longer occur.

### repeat

- An undocumented behavior where passing a negative count argument to `repeat` would result in an observable that repeats forever.

### retry

- Removed an undocumented behavior where passing a negative count argument to `retry` would result in an observable that repeats forever.

### single

- `single` operator will now throw for scenarios where values coming in are either not present, or do not match the provided predicate. Error types have thrown have also been updated, please check documentation for changes.

### skipLast

- **skipLast:** `skipLast` will no longer error when passed a negative number, rather it will simply return the source, as though `0` was passed.

### startWith

- **startWith:** `startWith` will return incorrect types when called with more than 7 arguments and a scheduler. Passing scheduler to startWith is deprecated

### take

- `take` and will now throw runtime error for arguments that are negative or NaN, this includes non-TS calls like `take()`.

### takeLast

- `takeLast` now has runtime assertions that throw `TypeError`s for invalid arguments. Calling takeLast without arguments or with an argument that is `NaN` will throw a `TypeError`

### throwError

- **throwError:** In an extreme corner case for usage, `throwError` is no longer able to emit a function as an error directly. If you need to push a function as an error, you will have to use the factory function to return the function like so: `throwError(() => functionToEmit)`, in other words `throwError(() => () => console.log('called later'))`.

### timestamp

- `timestamp` operator accepts a `TimestampProvider`, which is any object with a `now` method
  that returns a number. This means pulling in less code for the use of the `timestamp` operator. This may cause
  issues with `TestScheduler` run mode. (see [Issue here](https://github.com/ReactiveX/rxjs/issues/5553))

### zip

- **zip:** Zipping a single array will now have a different result. This is an extreme corner-case, because it is very unlikely that anyone would want to zip an array with nothing at all. The workaround would be to wrap the array in another array `zip([[1,2,3]])`. But again, that's pretty weird.

- **zip:** `zip` operators will no longer iterate provided iterables "as needed", instead the iterables will be treated as push-streams just like they would be everywhere else in RxJS. This means that passing an endless iterable will result in the thread locking up, as it will endlessly try to read from that iterable. This puts us in-line with all other Rx implementations. To work around this, it is probably best to use `map` or some combination of `map` and `zip`. For example, `zip(source$, iterator)` could be `source$.pipe(map(value => [value, iterator.next().value]))`.

## ajax

- `ajax` body serialization will now use default XHR behavior in all cases. If the body is a `Blob`, `ArrayBuffer`, any array buffer view (like a byte sequence, e.g. `Uint8Array`, etc), `FormData`, `URLSearchParams`, `string`, or `ReadableStream`, default handling is use. If the `body` is otherwise `typeof` `"object"`, then it will be converted to JSON via `JSON.stringify`, and the `Content-Type` header will be set to `application/json;charset=utf-8`. All other types will emit an error.

- The `Content-Type` header passed to `ajax` configuration no longer has any effect on the serialization behavior of the AJAX request.
- For TypeScript users, `AjaxRequest` is no longer the type that should be explicitly used to create an `ajax`. It is now `AjaxConfig`, although the two types are compatible, only `AjaxConfig` has `progressSubscriber` and `createXHR`.

- **ajax:** In an extreme corner-case... If an error occurs, the responseType is `"json"`, we're in IE, and the `responseType` is not valid JSON, the `ajax` observable will no longer emit a syntax error, rather it will emit a full `AjaxError` with more details.

- **ajax:** Ajax implementation drops support for IE10 and lower. This puts us in-line with other implementations and helps clean up code in this area
