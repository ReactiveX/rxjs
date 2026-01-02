[API](../../index.md) / [rxjs](../index.md) / OperatorFunction

# Interface: OperatorFunction()

> A function type interface that describes a function that accepts one parameter `T`
> and returns another parameter `R`.

## Description

Usually used to describe OperatorFunction - it always takes a single
parameter (the source Observable) and returns another Observable.

Defined in: [rxjs/src/internal/types.ts:29](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L29)

## Extends

- [`UnaryFunction`](UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`T`\>, [`Observable`](../classes/Observable.md)\<`R`\>\>

## Extended by

- [`MonoTypeOperatorFunction`](MonoTypeOperatorFunction.md)

```ts
OperatorFunction(source: Observable): Observable;
```

Defined in: [rxjs/src/internal/types.ts:29](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L29)

## Parameters

| Parameter | Type                                     |
| --------- | ---------------------------------------- |
| `source`  | [`Observable`](../classes/Observable.md) |

## Returns

[`Observable`](../classes/Observable.md)
