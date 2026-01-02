[API](../../index.md) / [rxjs](../index.md) / GlobalConfig

# Interface: GlobalConfig

> The global configuration object for RxJS, used to configure things
> like how to react on unhandled errors.

## Description

Accessible via [config](../variables/config.md)
object.

Defined in: [observable/src/observable.ts:397](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L397)

The global configuration object for RxJS, used to configure things
like how to react on unhandled errors. Accessible via [config](../variables/config.md)
object.

## Properties

| Property                                                   | Type                                                                                                                                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <a id="onstoppednotification"></a> `onStoppedNotification` | \| (`notification`: `ObservableNotification`\<`any`\>, `subscriber`: [`Subscriber`](../classes/Subscriber.md)\<`any`\>) => `void` \| `null` | A registration point for notifications that cannot be sent to subscribers because they have completed, errored or have been explicitly unsubscribed. By default, next, complete and error notifications sent to stopped subscribers are noops. However, sometimes callers might want a different behavior. For example, with sources that attempt to report errors to stopped subscribers, a caller can configure RxJS to throw an unhandled error instead. This will _always_ be called asynchronously on another job in the runtime. This is because we do not want errors thrown in this user-configured handler to interfere with the behavior of the library. |
| <a id="onunhandlederror"></a> `onUnhandledError`           | (`err`: `any`) => `void` \| `null`                                                                                                          | A registration point for unhandled errors from RxJS. These are errors that cannot were not handled by consuming code in the usual subscription path. For example, if you have this configured, and you subscribe to an observable without providing an error handler, errors from that subscription will end up here. This will _always_ be called asynchronously on another job in the runtime. This is because we do not want errors thrown in this user-configured handler to interfere with the behavior of the library.                                                                                                                                       |
