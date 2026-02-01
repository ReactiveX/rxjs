[API](../../index.md) / [index](../index.md) / expand

# Function: expand()

> Recursively projects each source value to an Observable which is merged in
> the output Observable.

## Description

<span class="informal">It's similar to [mergeMap](mergeMap.md), but applies the
projection function to every source value as well as every output value.
It's recursive.</span>

![](expand.png)

Returns an Observable that emits items based on applying a function that you
supply to each item emitted by the source Observable, where that function
returns an Observable, and then merging those resulting Observables and
emitting the results of this merger. *Expand* will re-emit on the output
Observable every source value. Then, each output value is given to the
`project` function which returns an inner Observable to be merged on the
output Observable. Those output values resulting from the projection are also
given to the `project` function to produce new output values. This is how
*expand* behaves recursively.

## Example

Start emitting the powers of two on every click, at most 10 of them

```ts
import { fromEvent, map, expand, of, delay, take } from 'rxjs';

const clicks = fromEvent(document, 'click');
const powersOfTwo = clicks.pipe(
  map(() => 1),
  expand(x => of(2 * x).pipe(delay(1000))),
  take(10)
);
powersOfTwo.subscribe(x => console.log(x));
```

## See

 - [mergeMap](mergeMap.md)
 - [mergeScan](mergeScan.md)


or the output Observable, returns an Observable.


concurrently.


each projected inner Observable.

## Parameters

### `project`

A function that, when applied to an item emitted by the source

### `concurrent`

Maximum number of input Observables being subscribed to

### `scheduler`

The [SchedulerLike](../interfaces/SchedulerLike.md) to use for subscribing to

## Returns

`A`

function that returns an Observable that emits the source values and also result of applying the projection function to each value emitted on the output Observable and merging the results of the Observables obtained from this transformation.


## Call Signature

```ts
function expand<>(
   project: (value: T, index: number) => O, 
   concurrent?: number, 
scheduler?: SchedulerLike): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/expand.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/expand.ts#L6)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `O` |
| `concurrent?` | `number` |
| `scheduler?` | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

## Call Signature

```ts
function expand<>(
   project: (value: T, index: number) => O, 
   concurrent: number | undefined, 
scheduler: SchedulerLike): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/expand.ts:16](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/expand.ts#L16)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `O` |
| `concurrent` | `number` \| `undefined` |
| `scheduler` | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

### Deprecated

The `scheduler` parameter will be removed in v8. If you need to schedule the inner subscription,
use `subscribeOn` within the projection function: `expand((value) => fn(value).pipe(subscribeOn(scheduler)))`.
Details: Details: https://rxjs.dev/deprecations/scheduler-argument
