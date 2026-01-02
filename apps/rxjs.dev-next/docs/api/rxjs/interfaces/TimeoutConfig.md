[API](../../index.md) / [rxjs](../index.md) / TimeoutConfig

# Interface: TimeoutConfig

Defined in: [rxjs/src/internal/operators/timeout.ts:8](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/timeout.ts#L8)

## Properties

| Property                            | Type                                                         | Description                                                                                                                                                                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="each"></a> `each?`           | `number`                                                     | The time allowed between values from the source before timeout is triggered.                                                                                                                                                                                              |
| <a id="first"></a> `first?`         | `number` \| `Date`                                           | The relative time as a `number` in milliseconds, or a specific time as a `Date` object, by which the first value must arrive from the source before timeout is triggered.                                                                                                 |
| <a id="meta"></a> `meta?`           | `M`                                                          | Optional additional metadata you can provide to code that handles the timeout, will be provided through the [TimeoutError](../classes/TimeoutError.md). This can be used to help identify the source of a timeout or pass along other information related to the timeout. |
| <a id="scheduler"></a> `scheduler?` | [`SchedulerLike`](SchedulerLike.md)                          | The scheduler to use with time-related operations within this operator. Defaults to [asyncScheduler](../variables/asyncScheduler.md)                                                                                                                                      |
| <a id="with"></a> `with?`           | (`info`: [`TimeoutInfo`](TimeoutInfo.md)\<`T`, `M`\>) => `O` | A factory used to create observable to switch to when timeout occurs. Provides a [TimeoutInfo](TimeoutInfo.md) about the source observable's emissions and what delay or exact time triggered the timeout.                                                                |
