[API](../../index.md) / [rxjs](../index.md) / ErrorObserver

# Interface: ErrorObserver

Defined in: [rxjs/src/internal/types.ts:158](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L158)

## Properties

| Property                          | Type                     |
| --------------------------------- | ------------------------ |
| <a id="closed"></a> `closed?`     | `boolean`                |
| <a id="complete"></a> `complete?` | () => `void`             |
| <a id="error"></a> `error`        | (`err`: `any`) => `void` |
| <a id="next"></a> `next?`         | (`value`: `T`) => `void` |
