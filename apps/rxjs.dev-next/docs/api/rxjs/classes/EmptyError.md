[API](../../index.md) / [rxjs](../index.md) / EmptyError

# Class: EmptyError

> An error thrown when an Observable or a sequence was queried but has no
> elements.

## Description

Defined in: [rxjs/src/internal/util/EmptyError.ts:11](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/EmptyError.ts#L11)

An error thrown when an Observable or a sequence was queried but has no
elements.

## See

- [first](../functions/first.md)
- [last](../functions/last.md)
- [single](../functions/single.md)
- [firstValueFrom](../functions/firstValueFrom.md)
- [lastValueFrom](../functions/lastValueFrom.md)

## Extends

- `Error`

## Constructors

### Constructor

```ts
new EmptyError(): EmptyError;
```

Defined in: [rxjs/src/internal/util/EmptyError.ts:16](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/EmptyError.ts#L16)

#### Returns

`EmptyError`

#### Deprecated

Internal implementation detail. Do not construct error instances.
Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269

#### Overrides

```ts
Error.constructor;
```
