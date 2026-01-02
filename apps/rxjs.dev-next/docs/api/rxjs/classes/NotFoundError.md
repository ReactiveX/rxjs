[API](../../index.md) / [rxjs](../index.md) / NotFoundError

# Class: NotFoundError

## Description

An error thrown when a value or values are missing from an
observable sequence.

Defined in: [rxjs/src/internal/util/NotFoundError.ts:7](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/NotFoundError.ts#L7)

An error thrown when a value or values are missing from an
observable sequence.

## See

[single](../functions/single.md)

## Extends

- `Error`

## Constructors

### Constructor

```ts
new NotFoundError(message: string): NotFoundError;
```

Defined in: [rxjs/src/internal/util/NotFoundError.ts:12](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/NotFoundError.ts#L12)

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `message` | `string` |

#### Returns

`NotFoundError`

#### Deprecated

Internal implementation detail. Do not construct error instances.
Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269

#### Overrides

```ts
Error.constructor;
```
