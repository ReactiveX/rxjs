[API](../../index.md) / [index](../index.md) / UnaryFunction

# Interface: UnaryFunction()

> A function type interface that describes a function that accepts one parameter `T`
> and returns another parameter `R`.

## Description

Usually used to describe [OperatorFunction](OperatorFunction.md) - it always takes a single
parameter (the source Observable) and returns another Observable.

Defined in: [internal/types.ts:26](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L26)

## Extended by

- [`OperatorFunction`](OperatorFunction.md)

```ts
UnaryFunction(source: T): R;
```

Defined in: [internal/types.ts:27](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L27)

## Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | `T` |

## Returns

`R`
