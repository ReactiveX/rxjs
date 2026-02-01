[API](../../index.md) / [index](../index.md) / ErrorObserver

# Interface: ErrorObserver

Defined in: [internal/types.ts:169](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L169)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="closed"></a> `closed?` | `boolean` |
| <a id="complete"></a> `complete?` | () => `void` |
| <a id="error"></a> `error` | (`err`: `any`) => `void` |
| <a id="next"></a> `next?` | (`value`: `T`) => `void` |
