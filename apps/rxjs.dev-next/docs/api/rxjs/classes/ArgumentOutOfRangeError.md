[API](../../index.md) / [rxjs](../index.md) / ArgumentOutOfRangeError

# Class: ArgumentOutOfRangeError

## Description

An error thrown when an element was queried at a certain index of an
Observable, but no such index or position exists in that sequence.

Defined in: [rxjs/src/internal/util/ArgumentOutOfRangeError.ts:9](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/ArgumentOutOfRangeError.ts#L9)

An error thrown when an element was queried at a certain index of an
Observable, but no such index or position exists in that sequence.

## See

- [elementAt](../functions/elementAt.md)
- [take](../functions/take.md)
- [takeLast](../functions/takeLast.md)

## Extends

- `Error`

## Constructors

### Constructor

```ts
new ArgumentOutOfRangeError(): ArgumentOutOfRangeError;
```

Defined in: [rxjs/src/internal/util/ArgumentOutOfRangeError.ts:14](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/ArgumentOutOfRangeError.ts#L14)

#### Returns

`ArgumentOutOfRangeError`

#### Deprecated

Internal implementation detail. Do not construct error instances.
Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269

#### Overrides

```ts
Error.constructor;
```
