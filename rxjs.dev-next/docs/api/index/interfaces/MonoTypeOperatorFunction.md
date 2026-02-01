[API](../../index.md) / [index](../index.md) / MonoTypeOperatorFunction

# Interface: MonoTypeOperatorFunction()

> A function type interface that describes a function that accepts and returns a parameter of the same type.

## Description

Used to describe [OperatorFunction](OperatorFunction.md) with the only one type: `OperatorFunction<T, T>`.

Defined in: [internal/types.ts:40](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L40)

## Extends

- [`OperatorFunction`](OperatorFunction.md)\<`T`, `T`\>

```ts
MonoTypeOperatorFunction(source: Observable): Observable;
```

Defined in: [internal/types.ts:40](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L40)

## Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | [`Observable`](../classes/Observable.md) |

## Returns

[`Observable`](../classes/Observable.md)
