[API](../../index.md) / [index](../index.md) / RepeatConfig

# Interface: RepeatConfig

Defined in: [internal/operators/repeat.ts:9](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/repeat.ts#L9)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="count"></a> `count?` | `number` | The number of times to repeat the source. Defaults to `Infinity`. |
| <a id="delay"></a> `delay?` | \| `number` \| (`count`: `number`) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | If a `number`, will delay the repeat of the source by that number of milliseconds. If a function, it will provide the number of times the source has been subscribed to, and the return value should be a valid observable input that will notify when the source should be repeated. If the notifier observable is empty, the result will complete. |
