# RxJS 6.x to 7.x Detailed Change List

This document contains a detailed list of changes between RxJS 6.x and RxJS 7.x, presented in the order they can be found when diffing the TypeScript APIs in various module files.

# module `rxjs`

## Breaking changes

### AsyncSubject

- `_subscribe` method is no longer `public` and is now `protected`.
- no longer has its own implementation of the `error` method inherited from `Subject`.

### BehaviorSubject

- `_subscribe` method is no longer `public` and is now `protected`.
- `value` property is a getter `get value()` instead of `readonly value`, and can no longer be forcibly set.

### bindCallback

- Generic signatures have changed. Do not explicitly pass generics.

### combineLatest

- Generic signatures have changed. Do not explicitly pass generics.

### concat

- Generic signatures have changed. Do not explicitly pass generics.

### ConnectableObservable

- `_isComplete` is no longer a property.
- `_subscribe` method is no longer `public` and is now `protected`.

### defer

- Generic argument no longer extends `void`.
- `defer` no longer allows factories to return void or undefined. All factories passed to `defer` must return a proper `ObservableInput`, such as `Observable`, `Promise`, et al. To get the same behavior as you may have relied on previously, `return EMPTY` or `return of()` from the factory.

### forkJoin

- Generic signatures have changed. Do not explicitly pass generics.

### fromEvent

- The `fromEvent` signatures have been changed and there are now separate signatures for each type of target - DOM, Node, jQuery, etc. That means that an attempt to pass options - like `{ once: true }` - to a target that does not support an options argument will result in a TypeScript error.

### GroupedObservable

- No longer publicly exposes `_subscribe`
- `key` properly is `readonly`.
- No longer publicly exposes `constructor`.

### iif

- Generic signatures have changed. Do not explicitly pass generics.
- `iif` will no longer allow result arguments that are `undefined`. This was a bad call pattern that was likely an error in most cases. If for some reason you are relying on this behavior, simply substitute `EMPTY` in place of the `undefined` argument. This ensures that the behavior was intentional and desired, rather than the result of an accidental `undefined` argument.

### isObservable

- No longer has a generic and returns `Observable<unknown>`, you must cast the result.

### merge

- Generic signatures have changed. Do not explicitly pass generics.

### Notification

- The `error` property is now `readonly`.
- The `hasValue` property is now `readonly`.
- The `kind` property is now `readonly`.
- The `value` property is now `readonly` and may be `undefined`.
- `constructor` signature now only allows valid construction. For example `new Notification('C', 'some_value')` will be an error in TypeScript.

### Observable

- `_isScalar` property removed.
- `_subscribe` method is no longer `public` and is now marked `@internal`.
- `_trySubscribe` method is no longer `public` and is now `@internal`.
- `pipe` method calls with `9` or more arguments will now return `Observable<unknown>` rather than `Observable<{}>`.
- `toPromise` method now correctly returns `Promise<T | undefined>` instead of `Promise<T>`. This a correction without a runtime change, because if the observable does not emit a value before completion, the promise will resolve with `undefined`.
- `static if` and `static throw` properties are no longer defined. They were unused in version 6.
- `lift`, `source`, and `operator` properties are still **deprecated**, and should not be used. They are implementation details, and will very likely be renamed or missing in version 8.

### of

- Generic signatures have changed. Do not explicitly pass generics.

### onErrorResumeNext

- Generic signatures have changed. Do not explicitly pass generics.

### pairs

- Generic signatures have changed. Do not explicitly pass generics.
- `pairs` will no longer function in IE without a polyfill for `Object.entries`. `pairs` itself is also deprecated in favor of users just using `from(Object.entries(obj))`.

### partition

- Generic signatures have changed. Do not explicitly pass generics.

### pipe

- Calls with `9` or more arguments will now return `(arg: A) => unknown` rather than `(arg: A) => {}`.

### race

- Generic signatures have changed. Do not explicitly pass generics.
- `race` will no longer subscribe to subsequent observables if a provided source synchronously errors or completes. This means side effects that might have occurred during subscription in those rare cases will no longer occur.

### ReplaySubject

- `_getNow` method has been removed.
- `_subscribe` method is no longer `public` and is now `protected`.

### Subscribable

- `subscribe` will accept `Partial<Observer<T>>` now. All overloads with functions as arguments have been removed. This is because `Subscribable` is intended to map to the basic observable contract from the TC39 proposal and the the return type of a call to `[Symbol.observable]()`.

### SubscribableOrPromise

- See notes on `Subscribable` above.

### Subscriber

- `destination` property must now be a `Subscriber` or full `Observer`.
- `syncErrorThrowable` property has been removed.
- `syncErrorThrown` property has been removed.
- `syncErrorValue` property has been removed.
- `_unsubscribeAndRecycle` method has been removed.

### Subscription

- `_parentOrParents` property has been removed.
- `add` method returns `void` and no longer returns a `Subscription`. Returning `Subscription` was an old behavior from the early days of version 5. If you add a function to a subscription (i.e. `subscription.add(fn)`), you can remove that function directly by calling `remove` with the same function instance. (i.e. `subscription.remove(fn)`). Previously, you needed to get the returned `Subscription` object and pass _that_ to `remove`. In version 6 and lower, the `Subscription` returned by calling `add` with another `Subscription` was always the same subscription you passed in. (meaning `subscription.add(subs1).add(subs2)` was an antipattern and the same as `subscription.add(subs1); subs1.add(subs2);`.

### VirtualAction

- The static `sortActions` method has been removed.

### zip

- Generic signatures have changed. Do not explicitly pass generics.
- Zipping a single array will now have a different result. This is an extreme corner-case, because it is very unlikely that anyone would want to zip an array with nothing at all. The workaround would be to wrap the array in another array `zip([[1,2,3]])`. But again, that's pretty weird.

---

## New Features

### animationFrames

- A new method for creating a stream of animation frames. Each event will carry with it a high-resolution timestamp, and an elapsed time since observation was started.

### config

#### onUnhandledError

- A handler for dealing with errors that make it all the way down to the "end" of the observation chain when there is no error handler in the observer. Useful for doing things like logging unhandled errors in RxJS observable chains.

#### onStoppedNotification

- A handler for edge cases where a subscriber within RxJS is notified after it has already "stopped", that is, a point in time where it has received an error or complete, but hasn't yet finalized. This is mostly useful for logging purposes.

#### useDeprecatedNextContext

- In RxJS 6, a little used feature allowed users to access the `subscriber` directly as `this` within a call to the `next` handler. The problem with this is it incurred heavy performance penalties. That behavior has been changed (because it wasn't really documented and it was barely ever used) to not change the `this` context of any user-provided subscription handlers. If you need to get that feature back, you can switch it on with this flag. Note this behavior will be removed completely in version 8.

### connectable

- This is the new means for creating a `ConnectableObservable`, and really is a replacement for non-selector usage of `multicast` and `publish` variants. Simply pass your source observable to `connectable` with the `Subject` you'd like to connect through.

### firstValueFrom

- A better, more tree-shakable replacement for `toPromise()` (which is now deprecated). This function allows the user to convert any `Observable` in to a `Promise` that will resolve when the source observable emits its first value. If the source observable closes without emitting a value, the returned promise will reject with an `EmptyError`, or it will resolve with a configured `defaultValue`. For more information, see the [deprecation guide](/deprecations/to-promise).

### lastValueFrom

- A better, more tree-shakable replacement for `toPromise()` (which is now deprecated). This function allows the user to convert any `Observable` in to a `Promise` that will resolve when the source observable emits the last value. If the source observable closes without emitting a value, the returned promise will reject with an `EmptyError`, or it will resolve with a configured `defaultValue`. For more information, see the [deprecation guide](/deprecations/to-promise).

### ObservableInput

- This is just a type, but it's important. This type defines the allowed types that can be passed to almost every API within RxJS that accepts an Observable. It has always accepted `Observable`, `Promise`, `Iterable`, and `ArrayLike`. Now it will also accept `AsyncIterable` and `ReadableStream`.

#### AsyncIterable

- `AsyncIterables` such as those defined by `IxJS` or by async generators (`async function*`), may now be passed to any API that accepts an observable, and can be converted to an `Observable` directly using `from`.

#### ReadableStream

- `ReadableStream` such as those returned by `fetch`, et al, can be passed to any API that accepts an observable, and can be converted to `Observable` directly using `from`.

### ReplaySubject

- A [bug was fixed](https://github.com/ReactiveX/rxjs/pull/5696) that prevented a completed or errored `ReplaySubject` from accumulating values in its buffer when resubscribed to another source. This breaks some uses - like [this StackOverflow answer](https://stackoverflow.com/a/54957061) - that depended upon the buggy behavior.

### Subscription

- Now allows adding and removing of functions directly via `add` and `remove` methods.

### throwError

- Now accepts an `errorFactory` of `() => any` to defer the creation of the error until the time it will be emitted. It is recommended to use this method, as Errors created in most popular JavaScript runtimes will retain all values in the current scope for debugging purposes.

# module `rxjs/operators`

## Breaking Changes

### audit

- The observable returned by the `audit` operator's duration selector must emit a next notification to end the duration. Complete notifications no longer end the duration.
- `audit` now emits the last value from the source when the source completes. Previously, `audit` would mirror the completion without emitting the value.

### auditTime

- `auditTime` now emits the last value from the source when the source completes, after the audit duration elapses. Previously, `auditTime` would mirror the completion without emitting the value and without waiting for the audit duration to elapse.

### buffer

- `buffer` now subscribes to the source observable before it subscribes to the closing notifier. Previously, it subscribed to the closing notifier first.
- Final buffered values will now always be emitted. To get the same behavior as the previous release, you can use `endWith` and `skipLast(1)`, like so: `source$.pipe(buffer(notifier$.pipe(endWith(true))), skipLast(1))`
- `closingNotifier` completion no longer completes the result of `buffer`. If that is truly a desired behavior, then you should use `takeUntil`. Something like: `source$.pipe(buffer(notifier$), takeUntil(notifier$.pipe(ignoreElements(), endWith(true))))`, where `notifier$` is multicast, although there are many ways to compose this behavior.

### bufferToggle

- The observable returned by the `bufferToggle` operator's closing selector must emit a next notification to close the buffer. Complete notifications no longer close the buffer.

### bufferWhen

- The observable returned by the `bufferWhen` operator's closing selector must emit a next notification to close the buffer. Complete notifications no longer close the buffer.

### combineLatest

- Generic signatures have changed. Do not explicitly pass generics.

### concat

- Generic signatures have changed. Do not explicitly pass generics.
- Still deprecated, use the new `concatWith`.

### concatAll

- Generic signatures have changed. Do not explicitly pass generics.

### concatMapTo

- Generic signatures have changed. Do not explicitly pass generics.

### count

- No longer passes `source` observable as a third argument to the predicate. That feature was rarely used, and of limited value. The workaround is to simply close over the source inside of the function if you need to access it in there.

### debounce

- The observable returned by the `debounce` operator's duration selector must emit a next notification to end the duration. Complete notifications no longer end the duration.

### debounceTime

- The `debounceTime` implementation is more efficient and no longer schedules an action for each received next notification. However, because the implementation now uses the scheduler's concept of time, any tests using Jasmine's `clock` will need to ensure that [`jasmine.clock().mockDate()`](https://jasmine.github.io/api/edge/Clock.html#mockDate) is called after `jasmine.clock().install()` - because Jasmine does not mock `Date.now()` by default.

### defaultIfEmpty

- Generic signatures have changed. Do not explicitly pass generics.
- `defaultIfEmpty` requires a value be passed. Will no longer convert `undefined` to `null` for no good reason.

### delayWhen

- `delayWhen` will no longer emit if the duration selector simply completes without a value. Notifiers must notify with a value, not a completion.

### endWith

- Generic signatures have changed. Do not explicitly pass generics.

### expand

- Generic signatures have changed. Do not explicitly pass generics.

### finalize

- `finalize` will now unsubscribe from its source _before_ it calls its callback. That means that `finalize` callbacks will run in the order in which they occur in the pipeline: `source.pipe(finalize(() => console.log(1)), finalize(() => console.log(2)))` will log `1` and then `2`. Previously, callbacks were called in the reverse order.

### map

- `thisArg` will now default to `undefined`. The previous default of `MapSubscriber` never made any sense. This will only affect code that calls map with a `function` and references `this` like so: `source.pipe(map(function () { console.log(this); }))`. There wasn't anything useful about doing this, so the breakage is expected to be very minimal. If anything we're no longer leaking an implementation detail.

### merge

- Generic signatures have changed. Do not explicitly pass generics.
- Still deprecated, use the new `mergeWith`.

### mergeAll

- Generic signatures have changed. Do not explicitly pass generics.

### mergeScan

- `mergeScan` will no longer emit its inner state again upon completion.

### pluck

- Generic signatures have changed. Do not explicitly pass generics.

### race

- Generic signatures have changed. Do not explicitly pass generics.

### reduce

- Generic signatures have changed. Do not explicitly pass generics.

### sample

- The `sample` operator's notifier observable must emit a next notification to effect a sample. Complete notifications no longer effect a sample.

### scan

- Generic signatures have changed. Do not explicitly pass generics.

### single

- The `single` operator will now throw for scenarios where values coming in are either not present, or do not match the provided predicate. Error types have thrown have also been updated, please check documentation for changes.

### skipLast

- `skipLast` will no longer error when passed a negative number, rather it will simply return the source, as though `0` was passed.

### startWith

- Generic signatures have changed. Do not explicitly pass generics.

### switchAll

- Generic signatures have changed. Do not explicitly pass generics.

### switchMapTo

- Generic signatures have changed. Do not explicitly pass generics.

### take

- `take` and will now throw runtime error for arguments that are negative or NaN, this includes non-TS calls like `take()`.

### takeLast

- `takeLast` now has runtime assertions that throw `TypeError`s for invalid arguments. Calling takeLast without arguments or with an argument that is `NaN` will throw a `TypeError`.

### throttle

- The observable returned by the `throttle` operator's duration selector must emit a next notification to end the duration. Complete notifications no longer end the duration.

### throwError

- In an extreme corner case for usage, `throwError` is no longer able to emit a function as an error directly. If you need to push a function as an error, you will have to use the factory function to return the function like so: `throwError(() => functionToEmit)`, in other words `throwError(() => () => console.log('called later'))`.

### window

- The `windowBoundaries` observable no longer completes the result. It was only ever meant to notify of the window boundary. To get the same behavior as the old behavior, you would need to add an `endWith` and a `skipLast(1)` like so: `source$.pipe(window(notifier$.pipe(endWith(true))), skipLast(1))`.

### windowToggle

- The observable returned by the `windowToggle` operator's closing selector must emit a next notification to close the window. Complete notifications no longer close the window.

### withLatestFrom

- Generic signatures have changed. Do not explicitly pass generics.

### zip

- Generic signatures have changed. Do not explicitly pass generics.
- Still deprecated, use the new `zipWith`.
- `zip` operators will no longer iterate provided iterables "as needed", instead the iterables will be treated as push-streams just like they would be everywhere else in RxJS. This means that passing an endless iterable will result in the thread locking up, as it will endlessly try to read from that iterable. This puts us in-line with all other Rx implementations. To work around this, it is probably best to use `map` or some combination of `map` and `zip`. For example, `zip(source$, iterator)` could be `source$.pipe(map(value => [value, iterator.next().value]))`.

## New Features

### connect

- New operator to cover the use cases of `publish` variants that use a `selector`. Wherein the selector allows the user to define multicast behavior prior to connection to the source observable for the multicast.

### share

- Added functionality to allow complete configuration of what type of `Subject` is used to multicast, and when that subject is reset.

### timeout

- Added more configuration options to `timeout`, so it could be used to timeout just if the first item doesn't arrive quickly enough, or it could be used as a timeout between each item. Users may also pass a `Date` object to define an absolute time for a timeout for the first time to arrive. Adds additional information to the timeout error, and the ability to pass along metadata with the timeout for identification purposes.

### zipWith, concatWith, mergeWith, raceWith

- Simply renamed versions of the operators `zip`, `concat`, `merge`, and `race`. So we can deprecate those old names and use the new names without collisions.

# module `rxjs/ajax`

## Breaking Changes

### ajax

- `ajax` body serialization will now use default XHR behavior in all cases. If the body is a `Blob`, `ArrayBuffer`, any array buffer view (like a byte sequence, e.g. `Uint8Array`, etc), `FormData`, `URLSearchParams`, `string`, or `ReadableStream`, default handling is use. If the `body` is otherwise `typeof` `"object"`, then it will be converted to JSON via `JSON.stringify`, and the `Content-Type` header will be set to `application/json;charset=utf-8`. All other types will emit an error.
- The `Content-Type` header passed to `ajax` configuration no longer has any effect on the serialization behavior of the AJAX request.
- For TypeScript users, `AjaxRequest` is no longer the type that should be explicitly used to create an `ajax`. It is now `AjaxConfig`, although the two types are compatible, only `AjaxConfig` has `progressSubscriber` and `createXHR`.
- Ajax implementation drops support for IE10 and lower. This puts us in-line with other implementations and helps clean up code in this area

### AjaxRequest

- `AjaxRequest` is no longer used to type the configuration argument for calls to `ajax`. The new type is `AjaxConfig`. This was done to disambiguate two very similar types with different use cases. `AjaxRequest` is still there, but properties have changed, and it is used to show what final request information was send as part of an event response.

## New Features

### AjaxResponse

- Now includes `responseHeaders`.
- Now includes event `type` and `total` numbers for examining upload and download progress (see `includeUploadProgress` and `includeDownloadProgress`).

### includeUploadProgress

- A flag to make a request that will include streaming upload progress events in the returned observable.

### includeDownloadProgress

- A flag to make a request that will include streaming upload progress events in the returned observable.

### queryParams

- Configuration for setting query parameters in the URL of the request to be made.

### XSRF (CSRF) additions:

- `xsrfCookieName` and `xsrfHeaderName` were added for cross-site request forgery prevention capabilities.

# module `rxjs/fetch`

No changes.

# module `rxjs/testing`

## New Features

### TestScheduler expectObservable().toEqual()

- A new means of comparing the equality of to observables. If all emissions are the same, and at the same time, then they are equal. This is primarily useful for refactoring operator chains and making sure that they are equivalent.
