[API](../../index.md) / [index](../index.md) / OperatorFunction

# Interface: OperatorFunction()

> A function type interface that describes a function that accepts one parameter `T`
> and returns another parameter `R`.

## Description

Usually used to describe OperatorFunction - it always takes a single
parameter (the source Observable) and returns another Observable.

Defined in: [internal/types.ts:30](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L30)

## Extends

- [`UnaryFunction`](UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`T`\>, [`Observable`](../classes/Observable.md)\<`R`\>\>

## Extended by

- [`MonoTypeOperatorFunction`](MonoTypeOperatorFunction.md)

```ts
OperatorFunction(source: Observable): Observable;
```

Defined in: [internal/types.ts:30](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L30)

## Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | [`Observable`](../classes/Observable.md) |

## Returns

[`Observable`](../classes/Observable.md)
