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

### forkJoin

- Generic signatures have changed. Do not explicitly pass generics.

### GroupedObservable

- No longer publicly exposes `_subscribe`
- `key` properly is `readonly`.
- No longer publicly exposes `constructor`.

### iif

- Generic signatures have changed. Do not explicitly pass generics.

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

### partition

- Generic signatures have changed. Do not explicitly pass generics.

### pipe

- Calls with `9` or more arguments will now return `(arg: A) => unknown` rather than `(arg: A) => {}`.

### race

- Generic signatures have changed. Do not explicitly pass generics.

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

---

## New Features

### animationFrames

- A new method for creating a stream of animation frames. Each event will carry with it a high-resolution timestamp, and an ellapsed time since observation was started.

### config

#### onUnhandledError

- A handler for dealing with errors that make it all the way down to the "end" of the observation chain when there is no error handler in the observer. Useful for doing things like logging unhandled errors in RxJS observable chains.

#### onStoppedNotification

- A handler for edge cases where a subscriber within RxJS is notified after it has already "stopped", that is, a point in time where it has received an error or complete, but hasn't yet finalized. This is mostly useful for logging purposes.

#### useDeprecatedNextContext

- In RxJS 6, a little used feature allowed users to access the `subscriber` directly as `this` within a call to the `next` handler. The problem with this is it incurred heavy performance penalties. That behavior has been changed (because it wasn't really documented and it was barely ever used) to not change the `this` context of any user-provided subscription handlers. If you need to get that feature back, you can switch it on with this flag. Note this behavior will be removed completely in version 8.

### connectable

- This is the new means for creating a `ConnectableObservable`, and really us a replacement for non-selector usage of `multicast` and `publish` variants. Simply pass your source observable to `connectable` with the `Subject` you'd like to connect through.

### firstValueFrom

- A better, more tree-shakable replacement for `toPromise()` (which is now deprecated). This function allows the user to convert any `Observable` in to a `Promise` that will resolve when the source observable emits its firsr value. If the source observable closes without emitting a value, the returned promise will reject with an `EmptyError`, or it will resolve with a configured `defaultValue`.

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

### buffer

- `buffer` now subscribes to the source observable before it subscribes to the closing notifier. Previously, it subscribed to the closing notifier first.

### combineLatest

- Generic signatures have changed. Do not explicitly pass generics.

### concat

- Generic signatures have changed. Do not explicitly pass generics.
- Still deprecated, use the new `concatWith`.

### concatAll

- Generic signatures have changed. Do not explicitly pass generics.

### concatMapTo

- Generic signatures have changed. Do not explicitly pass generics.

### defaultIfEmpty

- Generic signatures have changed. Do not explicitly pass generics.

### endWith

- Generic signatures have changed. Do not explicitly pass generics.

### expand

- Generic signatures have changed. Do not explicitly pass generics.

### merge

- Generic signatures have changed. Do not explicitly pass generics.
- Still deprecated, use the new `mergeWith`.

### mergeAll

- Generic signatures have changed. Do not explicitly pass generics.

### pluck

- Generic signatures have changed. Do not explicitly pass generics.

### race

- Generic signatures have changed. Do not explicitly pass generics.

### reduce

- Generic signatures have changed. Do not explicitly pass generics.

### scan

- Generic signatures have changed. Do not explicitly pass generics.

### startWith

- Generic signatures have changed. Do not explicitly pass generics.

### switchAll

- Generic signatures have changed. Do not explicitly pass generics.

### switchMapTo

- Generic signatures have changed. Do not explicitly pass generics.

### withLatestFrom

- Generic signatures have changed. Do not explicitly pass generics.

### zip

- Generic signatures have changed. Do not explicitly pass generics.
- Still deprecated, use the new `zipWith`.

## New Features

### connect

- New operator to cover the use cases of `publish` variants that use a `selector`. Wherein the selector allows the user to define multicast behavior prior to connection to the source observable for the multicast.

### share

- Added functionality to allow complete configuration of what type of `Subject` is used to multicast, and when that subject is reset.

### timeout

- Added more configuration options to `timeout`, so it could be used to timeout just if the first item doesn't arrive quickly enough, or it could be used as a timeout between each item. Users may also pass a `Date` object to define an absolute time for a timeout for the first time to arrive. Adds additional information to the timeout error, and the ability to pass along metadata with the timeout for identification purposes.

### zipWith, concatWith, mergeWith, raceWith

- Simply renamed versions of the operators `zip`, `concat`, `mergeWith`, and `race`. So we can deprecate those old names and use the new names without collisions.

# module `rxjs/ajax`

## Breaking Changes

### AjaxRequest

- `AjaxRequest` is no longer used to type the configuration argument for calls to `ajax`. The new type is `AjaxConfig`. This was done to disambiguate two very similar types with different use cases. `AjaxRequest` is still there, but properties have changed, and it is used to show what final request information was send as part of an event response.

## New Features

### AjaxResponse

- Now includes `responseHeaders`.
- Now includes event `type` and `total` numbers for examinining upload and download progress (see `includeUploadProgess` and `includeDownloadProgress`).

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
