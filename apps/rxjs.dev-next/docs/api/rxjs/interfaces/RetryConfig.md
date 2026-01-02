[API](../../index.md) / [rxjs](../index.md) / RetryConfig

# Interface: RetryConfig

## Description

The [retry](../functions/retry.md) operator configuration object. `retry` either accepts a `number`
or an object described by this interface.

Defined in: [rxjs/src/internal/operators/retry.ts:11](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/retry.ts#L11)

The [retry](../functions/retry.md) operator configuration object. `retry` either accepts a `number`
or an object described by this interface.

## Properties

| Property                                      | Type                                                                                                                        | Description                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="count"></a> `count?`                   | `number`                                                                                                                    | The maximum number of times to retry. If `count` is omitted, `retry` will try to resubscribe on errors infinite number of times.                                                                                                                                                                                                                                                    |
| <a id="delay"></a> `delay?`                   | \| `number` \| (`error`: `any`, `retryCount`: `number`) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | The number of milliseconds to delay before retrying, OR a function to return a notifier for delaying. If a function is given, that function should return a notifier that, when it emits will retry the source. If the notifier completes _without_ emitting, the resulting observable will complete without error, if the notifier errors, the error will be pushed to the result. |
| <a id="resetonsuccess"></a> `resetOnSuccess?` | `boolean`                                                                                                                   | Whether or not to reset the retry counter when the retried subscription emits its first value.                                                                                                                                                                                                                                                                                      |
