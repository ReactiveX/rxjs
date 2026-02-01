[API](../../index.md) / [operators](../index.md) / race

# ~~Function: race()~~

## Description

Returns an Observable that mirrors the first source Observable to emit a next,
error or complete notification from the combination of this Observable and supplied Observables.

**deprecated**: Replaced with [raceWith](../../index/functions/raceWith.md). Will be removed in v8.

Returns an Observable that mirrors the first source Observable to emit a next,
error or complete notification from the combination of this Observable and supplied Observables.



## Deprecated

Replaced with [raceWith](../../index/functions/raceWith.md). Will be removed in v8.

## Parameters

### `args`

Sources used to race for which Observable emits first.

## Returns

`A`

function that returns an Observable that mirrors the output of the first Observable to emit an item.


## Call Signature

```ts
function race<>(otherSources: [...ObservableInputTuple<A>[]]): OperatorFunction<T, T | A[number]>;
```

Defined in: [internal/operators/race.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/race.ts#L6)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `otherSources` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `T` \| `A`\[`number`\]\>

### Deprecated

Replaced with [raceWith](../../index/functions/raceWith.md). Will be removed in v8.

## Call Signature

```ts
function race<>(...otherSources: [...ObservableInputTuple<A>[]]): OperatorFunction<T, T | A[number]>;
```

Defined in: [internal/operators/race.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/race.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`otherSources` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `T` \| `A`\[`number`\]\>

### Deprecated

Replaced with [raceWith](../../index/functions/raceWith.md). Will be removed in v8.
