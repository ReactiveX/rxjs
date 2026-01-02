[API](../../index.md) / [rxjs](../index.md) / SubscriberOverrides

# Interface: SubscriberOverrides

Defined in: [observable/src/observable.ts:200](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L200)

## Properties

| Property                          | Type                     | Description                                                                                                                                                                                                                                                                           |
| --------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="complete"></a> `complete?` | () => `void`             | If provided, this function will be called whenever the [Subscriber](../classes/Subscriber.md)'s `complete` method is called. If an error is thrown within this function, it will be handled and passed to the destination's `error` method.                                           |
| <a id="error"></a> `error?`       | (`err`: `any`) => `void` | If provided, this function will be called whenever the [Subscriber](../classes/Subscriber.md)'s `error` method is called, with the error that was passed to that call. If an error is thrown within this function, it will be handled and passed to the destination's `error` method. |
| <a id="finalize"></a> `finalize?` | () => `void`             | If provided, this function will be called after all teardown has occurred for this [Subscriber](../classes/Subscriber.md). This is generally used for cleanup purposes during operator development.                                                                                   |
| <a id="next"></a> `next?`         | (`value`: `T`) => `void` | If provided, this function will be called whenever the [Subscriber](../classes/Subscriber.md)'s `next` method is called, with the value that was passed to that call. If an error is thrown within this function, it will be handled and passed to the destination's `error` method.  |
