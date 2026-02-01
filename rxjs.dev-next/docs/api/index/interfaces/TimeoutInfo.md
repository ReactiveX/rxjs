[API](../../index.md) / [index](../index.md) / TimeoutInfo

# Interface: TimeoutInfo

Defined in: [internal/operators/timeout.ts:45](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/timeout.ts#L45)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="lastvalue"></a> `lastValue` | `T` \| `null` | The last message seen |
| <a id="meta"></a> `meta` | `M` | Optional metadata that was provided to the timeout configuration. |
| <a id="seen"></a> `seen` | `number` | The number of messages seen before the timeout |
