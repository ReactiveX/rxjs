[API](../../index.md) / [index](../index.md) / CompletionObserver

# Interface: CompletionObserver

Defined in: [internal/types.ts:176](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L176)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="closed"></a> `closed?` | `boolean` |
| <a id="complete"></a> `complete` | () => `void` |
| <a id="error"></a> `error?` | (`err`: `any`) => `void` |
| <a id="next"></a> `next?` | (`value`: `T`) => `void` |
