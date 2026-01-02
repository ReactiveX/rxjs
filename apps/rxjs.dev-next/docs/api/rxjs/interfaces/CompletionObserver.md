[API](../../index.md) / [rxjs](../index.md) / CompletionObserver

# Interface: CompletionObserver

Defined in: [rxjs/src/internal/types.ts:165](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L165)

## Properties

| Property                         | Type                     |
| -------------------------------- | ------------------------ |
| <a id="closed"></a> `closed?`    | `boolean`                |
| <a id="complete"></a> `complete` | () => `void`             |
| <a id="error"></a> `error?`      | (`err`: `any`) => `void` |
| <a id="next"></a> `next?`        | (`value`: `T`) => `void` |
