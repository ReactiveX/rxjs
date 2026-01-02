[API](../../index.md) / [rxjs](../index.md) / RepeatConfig

# Interface: RepeatConfig

Defined in: [rxjs/src/internal/operators/repeat.ts:7](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/repeat.ts#L7)

## Properties

| Property                    | Type                                                                                                   | Description                                                                                                                                                                                                                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="count"></a> `count?` | `number`                                                                                               | The number of times to repeat the source. Defaults to `Infinity`.                                                                                                                                                                                                                                                                                    |
| <a id="delay"></a> `delay?` | \| `number` \| (`count`: `number`) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | If a `number`, will delay the repeat of the source by that number of milliseconds. If a function, it will provide the number of times the source has been subscribed to, and the return value should be a valid observable input that will notify when the source should be repeated. If the notifier observable is empty, the result will complete. |
