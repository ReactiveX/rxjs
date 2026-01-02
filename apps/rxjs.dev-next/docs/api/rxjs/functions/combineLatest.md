[API](../../index.md) / [rxjs](../index.md) / combineLatest

# Function: combineLatest()

> Combines multiple Observables to create an Observable whose values are
> calculated from the latest values of each of its input Observables.

## Description

<span class="informal">Whenever any input Observable emits a value, it
computes a formula using the latest values from all the inputs, then emits
the output of that formula.</span>

![](/images/marble-diagrams/combineLatest.png)

`combineLatest` combines the values from all the Observables passed in the
observables array. This is done by subscribing to each Observable in order and,
whenever any Observable emits, collecting an array of the most recent
values from each Observable. So if you pass `n` Observables to this operator,
the returned Observable will always emit an array of `n` values, in an order
corresponding to the order of the passed Observables (the value from the first Observable
will be at index 0 of the array and so on).

Static version of `combineLatest` accepts an array of Observables. Note that an array of
Observables is a good choice, if you don't know beforehand how many Observables
you will combine. Passing an empty array will result in an Observable that
completes immediately.

To ensure the output array always has the same length, `combineLatest` will
actually wait for all input Observables to emit at least once,
before it starts emitting results. This means if some Observable emits
values before other Observables started emitting, all these values but the last
will be lost. On the other hand, if some Observable does not emit a value but
completes, resulting Observable will complete at the same moment without
emitting anything, since it will now be impossible to include a value from the
completed Observable in the resulting array. Also, if some input Observable does
not emit any value and never completes, `combineLatest` will also never emit
and never complete, since, again, it will wait for all streams to emit some
value.

If at least one Observable was passed to `combineLatest` and all passed Observables
emitted something, the resulting Observable will complete when all combined
streams complete. So even if some Observable completes, the result of
`combineLatest` will still emit values when other Observables do. In case
of a completed Observable, its value from now on will always be the last
emitted value. On the other hand, if any Observable errors, `combineLatest`
will error immediately as well, and all other Observables will be unsubscribed.

## Example

Combine two timer Observables

```ts
import { timer, combineLatest } from 'rxjs';

const firstTimer = timer(0, 1000); // emit 0, 1, 2... after every second, starting from now
const secondTimer = timer(500, 1000); // emit 0, 1, 2... after every second, starting 0,5s from now
const combinedTimers = combineLatest([firstTimer, secondTimer]);
combinedTimers.subscribe((value) => console.log(value));
// Logs
// [0, 0] after 0.5s
// [1, 0] after 1s
// [1, 1] after 1.5s
// [2, 1] after 2s
```

Combine a dictionary of Observables

```ts
import { of, delay, startWith, combineLatest } from 'rxjs';

const observables = {
  a: of(1).pipe(delay(1000), startWith(0)),
  b: of(5).pipe(delay(5000), startWith(0)),
  c: of(10).pipe(delay(10000), startWith(0)),
};
const combined = combineLatest(observables);
combined.subscribe((value) => console.log(value));
// Logs
// { a: 0, b: 0, c: 0 } immediately
// { a: 1, b: 0, c: 0 } after 1s
// { a: 1, b: 5, c: 0 } after 5s
// { a: 1, b: 5, c: 10 } after 10s
```

Combine an array of Observables

```ts
import { of, delay, startWith, combineLatest } from 'rxjs';

const observables = [1, 5, 10].map((n) =>
  of(n).pipe(
    delay(n * 1000), // emit 0 and then emit n after n seconds
    startWith(0)
  )
);
const combined = combineLatest(observables);
combined.subscribe((value) => console.log(value));
// Logs
// [0, 0, 0] immediately
// [1, 0, 0] after 1s
// [1, 5, 0] after 5s
// [1, 5, 10] after 10s
```

Use map operator to dynamically calculate the Body-Mass Index

```ts
import { of, combineLatest, map } from 'rxjs';

const weight = of(70, 72, 76, 79, 75);
const height = of(1.76, 1.77, 1.78);
const bmi = combineLatest([weight, height]).pipe(map(([w, h]) => w / (h * h)));
bmi.subscribe((x) => console.log('BMI is ' + x));

// With output to console:
// BMI is 24.212293388429753
// BMI is 23.93948099205209
// BMI is 23.671253629592222
```

## See

- [combineLatestAll](combineLatestAll.md)
- [merge](merge.md)
- [withLatestFrom](withLatestFrom.md)

to combine with each other. If the last parameter is the function, it will be used to project the
values from the combined latest values into a new value on the output Observable.

## Parameters

### `args`

Any number of `ObservableInput`s provided either as an array or as an object

## Returns

`An`

Observable of projected values from the most recent values from each , or an array of the most recent values from each .

## Call Signature

```ts
function combineLatest<>(arg: T): Observable<unknown>;
```

Defined in: [rxjs/src/internal/observable/combineLatest.ts:21](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/combineLatest.ts#L21)

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
function combineLatest(sources: []): Observable<never>;
```

Defined in: [rxjs/src/internal/observable/combineLatest.ts:24](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/combineLatest.ts#L24)

You have passed `any` here, we can't figure out if it is
an array or an object, so you're getting `unknown`. Use better types.

### Parameters

| Parameter | Type |
| --------- | ---- |
| `sources` | \[\] |

### Returns

[`Observable`](../classes/Observable.md)\<`never`\>

## Call Signature

```ts
function combineLatest<>(sources: readonly [ObservableInputTuple<A>]): Observable<A>;
```

Defined in: [rxjs/src/internal/observable/combineLatest.ts:25](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/combineLatest.ts#L25)

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
function combineLatest<>(sources: readonly [ObservableInputTuple<A>], resultSelector: (...values: A) => R): Observable<R>;
```

Defined in: [rxjs/src/internal/observable/combineLatest.ts:26](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/combineLatest.ts#L26)

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
function combineLatest(sourcesObject: { [key: string]: never; [key: number]: never; [key: symbol]: never }): Observable<never>;
```

Defined in: [rxjs/src/internal/observable/combineLatest.ts:32](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/combineLatest.ts#L32)

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
function combineLatest<>(sourcesObject: T): Observable<{ [K in string | number | symbol]: ObservedValueOf<T[K]> }>;
```

Defined in: [rxjs/src/internal/observable/combineLatest.ts:33](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/combineLatest.ts#L33)

You have passed `any` here, we can't figure out if it is
an array or an object, so you're getting `unknown`. Use better types.

### Parameters

| Parameter       | Type |
| --------------- | ---- |
| `sourcesObject` | `T`  |

### Returns

[`Observable`](../classes/Observable.md)\<\{ \[K in string \| number \| symbol\]: ObservedValueOf\<T\[K\]\> \}\>
