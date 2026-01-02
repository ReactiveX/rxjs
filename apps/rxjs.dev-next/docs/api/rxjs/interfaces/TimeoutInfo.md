[API](../../index.md) / [rxjs](../index.md) / TimeoutInfo

# Interface: TimeoutInfo

Defined in: [rxjs/src/internal/operators/timeout.ts:41](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/timeout.ts#L41)

## Properties

| Property                           | Type          | Description                                                       |
| ---------------------------------- | ------------- | ----------------------------------------------------------------- |
| <a id="lastvalue"></a> `lastValue` | `T` \| `null` | The last message seen                                             |
| <a id="meta"></a> `meta`           | `M`           | Optional metadata that was provided to the timeout configuration. |
| <a id="seen"></a> `seen`           | `number`      | The number of messages seen before the timeout                    |
