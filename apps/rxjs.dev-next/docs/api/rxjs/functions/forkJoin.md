[API](../../index.md) / [rxjs](../index.md) / forkJoin

# Function: forkJoin()

> Accepts an `Array` of [ObservableInput](.

## Description

./type-aliases/ObservableInput.md) or a dictionary `Object` of [ObservableInput](../type-aliases/ObservableInput.md) and returns
an [Observable](../classes/Observable.md) that emits either an array of values in the exact same order as the passed array,
or a dictionary of values in the same shape as the passed dictionary.

<span class="informal">Wait for Observables to complete and then combine last values they emitted;
complete immediately if an empty array is passed.</span>

![](/images/marble-diagrams/forkJoin.png)

`forkJoin` is an operator that takes any number of input observables which can be passed either as an array
or a dictionary of input observables. If no input observables are provided (e.g. an empty array is passed),
then the resulting stream will complete immediately.

`forkJoin` will wait for all passed observables to emit and complete and then it will emit an array or an object with last
values from corresponding observables.

If you pass an array of `n` observables to the operator, then the resulting
array will have `n` values, where the first value is the last one emitted by the first observable,
second value is the last one emitted by the second observable and so on.

If you pass a dictionary of observables to the operator, then the resulting
objects will have the same keys as the dictionary passed, with their last values they have emitted
located at the corresponding key.

That means `forkJoin` will not emit more than once and it will complete after that. If you need to emit combined
values not only at the end of the lifecycle of passed observables, but also throughout it, try out [combineLatest](combineLatest.md)
or [zip](zip.md) instead.

In order for the resulting array to have the same length as the number of input observables, whenever any of
the given observables completes without emitting any value, `forkJoin` will complete at that moment as well
and it will not emit anything either, even if it already has some last values from other observables.
Conversely, if there is an observable that never completes, `forkJoin` will never complete either,
unless at any point some other observable completes without emitting a value, which brings us back to
the previous case. Overall, in order for `forkJoin` to emit a value, all given observables
have to emit something at least once and complete.

If any given observable errors at some point, `forkJoin` will error as well and immediately unsubscribe
from the other observables.

Optionally `forkJoin` accepts a `resultSelector` function, that will be called with values which normally
would land in the emitted array. Whatever is returned by the `resultSelector`, will appear in the output
observable instead. This means that the default `resultSelector` can be thought of as a function that takes
all its arguments and puts them into an array. Note that the `resultSelector` will be called only
when `forkJoin` is supposed to emit a result.

Accepts an `Array` of [ObservableInput](../type-aliases/ObservableInput.md) or a dictionary `Object` of [ObservableInput](../type-aliases/ObservableInput.md) and returns
an [Observable](../classes/Observable.md) that emits either an array of values in the exact same order as the passed array,
or a dictionary of values in the same shape as the passed dictionary.

<span class="informal">Wait for Observables to complete and then combine last values they emitted;
complete immediately if an empty array is passed.</span>

![](/images/marble-diagrams/forkJoin.png)

`forkJoin` is an operator that takes any number of input observables which can be passed either as an array
or a dictionary of input observables. If no input observables are provided (e.g. an empty array is passed),
then the resulting stream will complete immediately.

`forkJoin` will wait for all passed observables to emit and complete and then it will emit an array or an object with last
values from corresponding observables.

If you pass an array of `n` observables to the operator, then the resulting
array will have `n` values, where the first value is the last one emitted by the first observable,
second value is the last one emitted by the second observable and so on.

If you pass a dictionary of observables to the operator, then the resulting
objects will have the same keys as the dictionary passed, with their last values they have emitted
located at the corresponding key.

That means `forkJoin` will not emit more than once and it will complete after that. If you need to emit combined
values not only at the end of the lifecycle of passed observables, but also throughout it, try out [combineLatest](combineLatest.md)
or [zip](zip.md) instead.

In order for the resulting array to have the same length as the number of input observables, whenever any of
the given observables completes without emitting any value, `forkJoin` will complete at that moment as well
and it will not emit anything either, even if it already has some last values from other observables.
Conversely, if there is an observable that never completes, `forkJoin` will never complete either,
unless at any point some other observable completes without emitting a value, which brings us back to
the previous case. Overall, in order for `forkJoin` to emit a value, all given observables
have to emit something at least once and complete.

If any given observable errors at some point, `forkJoin` will error as well and immediately unsubscribe
from the other observables.

Optionally `forkJoin` accepts a `resultSelector` function, that will be called with values which normally
would land in the emitted array. Whatever is returned by the `resultSelector`, will appear in the output
observable instead. This means that the default `resultSelector` can be thought of as a function that takes
all its arguments and puts them into an array. Note that the `resultSelector` will be called only
when `forkJoin` is supposed to emit a result.

## Example

Use `forkJoin` with a dictionary of observable inputs

```ts
import { forkJoin, of, timer } from 'rxjs';

const observable = forkJoin({
  foo: of(1, 2, 3, 4),
  bar: Promise.resolve(8),
  baz: timer(4000),
});
observable.subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('This is how it ends!'),
});

// Logs:
// { foo: 4, bar: 8, baz: 0 } after 4 seconds
// 'This is how it ends!' immediately after
```

Use `forkJoin` with an array of observable inputs

```ts
import { forkJoin, of, timer } from 'rxjs';

const observable = forkJoin([of(1, 2, 3, 4), Promise.resolve(8), timer(4000)]);
observable.subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('This is how it ends!'),
});

// Logs:
// [4, 8, 0] after 4 seconds
// 'This is how it ends!' immediately after
```

## See

- [combineLatest](combineLatest.md)
- [zip](zip.md)

## Param

Any number of `ObservableInput`s provided either as an array or as an object
passed directly to the operator.

## Call Signature

```ts
function forkJoin<>(arg: T): Observable<unknown>;
```

Defined in: [rxjs/src/internal/observable/forkJoin.ts:21](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/forkJoin.ts#L21)

You have passed `any` here, we can't figure out if it is
an array or an object, so you're getting `unknown`. Use better types.

### Parameters

| Parameter | Type | Description              |
| --------- | ---- | ------------------------ |
| `arg`     | `T`  | Something typed as `any` |

### Returns

[`Observable`](../classes/Observable.md)\<`unknown`\>

## Call Signature

```ts
function forkJoin(scheduler: null | undefined): Observable<never>;
```

Defined in: [rxjs/src/internal/observable/forkJoin.ts:24](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/forkJoin.ts#L24)

You have passed `any` here, we can't figure out if it is
an array or an object, so you're getting `unknown`. Use better types.

### Parameters

| Parameter   | Type                  |
| ----------- | --------------------- |
| `scheduler` | `null` \| `undefined` |

### Returns

[`Observable`](../classes/Observable.md)\<`never`\>

## Call Signature

```ts
function forkJoin(sources: readonly []): Observable<never>;
```

Defined in: [rxjs/src/internal/observable/forkJoin.ts:27](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/forkJoin.ts#L27)

You have passed `any` here, we can't figure out if it is
an array or an object, so you're getting `unknown`. Use better types.

### Parameters

| Parameter | Type          |
| --------- | ------------- |
| `sources` | readonly \[\] |

### Returns

[`Observable`](../classes/Observable.md)\<`never`\>

## Call Signature

```ts
function forkJoin<>(sources: readonly [ObservableInputTuple<A>]): Observable<A>;
```

Defined in: [rxjs/src/internal/observable/forkJoin.ts:28](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/forkJoin.ts#L28)

You have passed `any` here, we can't figure out if it is
an array or an object, so you're getting `unknown`. Use better types.

### Parameters

| Parameter | Type                                                                                  |
| --------- | ------------------------------------------------------------------------------------- |
| `sources` | readonly \[[`ObservableInputTuple`](../type-aliases/ObservableInputTuple.md)\<`A`\>\] |

### Returns

[`Observable`](../classes/Observable.md)\<`A`\>

## Call Signature

```ts
function forkJoin<>(sources: readonly [ObservableInputTuple<A>], resultSelector: (...values: A) => R): Observable<R>;
```

Defined in: [rxjs/src/internal/observable/forkJoin.ts:29](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/forkJoin.ts#L29)

You have passed `any` here, we can't figure out if it is
an array or an object, so you're getting `unknown`. Use better types.

### Parameters

| Parameter        | Type                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| `sources`        | readonly \[[`ObservableInputTuple`](../type-aliases/ObservableInputTuple.md)\<`A`\>\] |
| `resultSelector` | (...`values`: `A`) => `R`                                                             |

### Returns

[`Observable`](../classes/Observable.md)\<`R`\>

## Call Signature

```ts
function forkJoin<>(...sources: [...ObservableInputTuple<A>[]]): Observable<A>;
```

Defined in: [rxjs/src/internal/observable/forkJoin.ts:36](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/forkJoin.ts#L36)

### Parameters

| Parameter    | Type                               |
| ------------ | ---------------------------------- |
| ...`sources` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`Observable`](../classes/Observable.md)\<`A`\>

### Deprecated

Pass an array of sources instead. The rest-parameters signature will be removed in v8. Details: https://rxjs.dev/deprecations/array-argument

## Call Signature

```ts
function forkJoin<>(...sourcesAndResultSelector: [...ObservableInputTuple<A>[], (...values: A) => R]): Observable<R>;
```

Defined in: [rxjs/src/internal/observable/forkJoin.ts:38](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/forkJoin.ts#L38)

### Parameters

| Parameter                     | Type                                                          |
| ----------------------------- | ------------------------------------------------------------- |
| ...`sourcesAndResultSelector` | \[`...ObservableInputTuple<A>[]`, (...`values`: `A`) => `R`\] |

### Returns

[`Observable`](../classes/Observable.md)\<`R`\>

### Deprecated

Pass an array of sources instead. The rest-parameters signature will be removed in v8. Details: https://rxjs.dev/deprecations/array-argument

## Call Signature

```ts
function forkJoin(sourcesObject: { [key: string]: never; [key: number]: never; [key: symbol]: never }): Observable<never>;
```

Defined in: [rxjs/src/internal/observable/forkJoin.ts:43](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/forkJoin.ts#L43)

You have passed `any` here, we can't figure out if it is
an array or an object, so you're getting `unknown`. Use better types.

### Parameters

| Parameter       | Type                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `sourcesObject` | \{ \[`key`: `string`\]: `never`; \[`key`: `number`\]: `never`; \[`key`: `symbol`\]: `never`; \} |

### Returns

[`Observable`](../classes/Observable.md)\<`never`\>

## Call Signature

```ts
function forkJoin<>(sourcesObject: T): Observable<{ [K in string | number | symbol]: ObservedValueOf<T[K]> }>;
```

Defined in: [rxjs/src/internal/observable/forkJoin.ts:44](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/forkJoin.ts#L44)

You have passed `any` here, we can't figure out if it is
an array or an object, so you're getting `unknown`. Use better types.

### Parameters

| Parameter       | Type |
| --------------- | ---- |
| `sourcesObject` | `T`  |

### Returns

[`Observable`](../classes/Observable.md)\<\{ \[K in string \| number \| symbol\]: ObservedValueOf\<T\[K\]\> \}\>
