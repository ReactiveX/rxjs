[API](../../index.md) / [rxjs](../index.md) / SequenceError

# Class: SequenceError

> An error thrown when something is wrong with the sequence of
> values arriving on the observable.

## Description

Defined in: [rxjs/src/internal/util/SequenceError.ts:7](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/SequenceError.ts#L7)

An error thrown when something is wrong with the sequence of
values arriving on the observable.

## See

[single](../functions/single.md)

## Extends

- `Error`

## Constructors

### Constructor

```ts
new SequenceError(message: string): SequenceError;
```

Defined in: [rxjs/src/internal/util/SequenceError.ts:12](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/SequenceError.ts#L12)

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `message` | `string` |

#### Returns

`SequenceError`

#### Deprecated

Internal implementation detail. Do not construct error instances.
Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269

#### Overrides

```ts
Error.constructor;
```
