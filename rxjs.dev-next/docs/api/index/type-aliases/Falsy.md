[API](../../index.md) / [index](../index.md) / Falsy

# Type Alias: Falsy

## Description

A simple type to represent a gamut of "falsy" values... with a notable exception:
`NaN` is "falsy" however, it is not and cannot be typed via TypeScript. See
comments here: https://github.com/microsoft/TypeScript/issues/28682#issuecomment-707142417

```ts
type Falsy = null | undefined | false | 0 | 0 | 0n | "";
```

Defined in: [internal/types.ts:330](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L330)

A simple type to represent a gamut of "falsy" values... with a notable exception:
`NaN` is "falsy" however, it is not and cannot be typed via TypeScript. See
comments here: https://github.com/microsoft/TypeScript/issues/28682#issuecomment-707142417
