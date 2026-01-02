[API](../../index.md) / [rxjs](../index.md) / Falsy

# Type Alias: Falsy

> A simple type to represent a gamut of "falsy" values.

## Description

.. with a notable exception:
`NaN` is "falsy" however, it is not and cannot be typed via TypeScript. See
comments here: https://github.com/microsoft/TypeScript/issues/28682#issuecomment-707142417

```ts
type Falsy = null | undefined | false | 0 | 0 | 0n | '';
```

Defined in: [rxjs/src/internal/types.ts:314](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L314)

A simple type to represent a gamut of "falsy" values... with a notable exception:
`NaN` is "falsy" however, it is not and cannot be typed via TypeScript. See
comments here: https://github.com/microsoft/TypeScript/issues/28682#issuecomment-707142417
