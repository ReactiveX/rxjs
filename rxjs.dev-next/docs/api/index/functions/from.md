[API](../../index.md) / [index](../index.md) / from

# Function: from()

> Creates an Observable from an Array, an array-like object, a Promise, an iterable object, or an Observable-like object.

## Description

<span class="informal">Converts almost anything to an Observable.</span>

![](from.png)

`from` converts various other objects and data types into Observables. It also converts a Promise, an array-like, or an
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable" target="_blank">iterable</a>
object into an Observable that emits the items in that promise, array, or iterable. A String, in this context, is treated
as an array of characters. Observable-like objects (contains a function named with the ES2015 Symbol for Observable) can also be
converted through this operator.

## Examples

Converts an array to an Observable

```ts
import { from } from 'rxjs';

const array = [10, 20, 30];
const result = from(array);

result.subscribe(x => console.log(x));

// Logs:
// 10
// 20
// 30
```

Convert an infinite iterable (from a generator) to an Observable

```ts
import { from, take } from 'rxjs';

function* generateDoubles(seed) {
   let i = seed;
   while (true) {
     yield i;
     i = 2 * i; // double it
   }
}

const iterator = generateDoubles(3);
const result = from(iterator).pipe(take(10));

result.subscribe(x => console.log(x));

// Logs:
// 3
// 6
// 12
// 24
// 48
// 96
// 192
// 384
// 768
// 1536
```

With `asyncScheduler`

```ts
import { from, asyncScheduler } from 'rxjs';

console.log('start');

const array = [10, 20, 30];
const result = from(array, asyncScheduler);

result.subscribe(x => console.log(x));

console.log('end');

// Logs:
// 'start'
// 'end'
// 10
// 20
// 30
```

## See

 - [fromEvent](fromEvent.md)
 - [fromEventPattern](fromEventPattern.md)


an Array, an iterable, or an array-like object to be converted.



## Parameters

### `input`

A subscription object, a Promise, an Observable-like,

### `scheduler`

An optional [SchedulerLike](../interfaces/SchedulerLike.md) on which to schedule the emission of values.


## Returns

`An`

Observable converted from ObservableInput.


## Call Signature

```ts
function from<>(input: O): Observable<ObservedValueOf<O>>;
```

Defined in: [internal/observable/from.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/from.ts#L6)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `O` |

### Returns

[`Observable`](../classes/Observable.md)\<[`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

## Call Signature

```ts
function from<>(input: O, scheduler: SchedulerLike | undefined): Observable<ObservedValueOf<O>>;
```

Defined in: [internal/observable/from.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/from.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `O` |
| `scheduler` | [`SchedulerLike`](../interfaces/SchedulerLike.md) \| `undefined` |

### Returns

[`Observable`](../classes/Observable.md)\<[`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

### Deprecated

The `scheduler` parameter will be removed in v8. Use `scheduled`. Details: https://rxjs.dev/deprecations/scheduler-argument
