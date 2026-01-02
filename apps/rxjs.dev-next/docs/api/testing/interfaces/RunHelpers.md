[API](../../index.md) / [testing](../index.md) / RunHelpers

# Interface: RunHelpers

Defined in: [rxjs/src/internal/testing/TestScheduler.ts:19](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/testing/TestScheduler.ts#L19)

## Properties

| Property                                               | Type                                                                                                                                                                                                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="animate"></a> `animate`                         | (`marbles`: `string`) => `void`                                                                                                                                                                                                             |
| <a id="cold"></a> `cold`                               | \<`T`\>(`marbles`: `string`, `values?`: \{ \[`marble`: `string`\]: `T`; \}, `error?`: `any`) => `ColdObservable`\<`T`\>                                                                                                                     |
| <a id="expectobservable"></a> `expectObservable`       | \<`T`\>(`observable`: [`Observable`](../../rxjs/classes/Observable.md)\<`T`\>, `subscriptionMarbles`: `string` \| `null`) => \{ `toEqual`: (`other`: [`Observable`](../../rxjs/classes/Observable.md)\<`T`\>) => `void`; `toBe`: `void`; \} |
| <a id="expectsubscriptions"></a> `expectSubscriptions` | (`actualSubscriptionLogs`: `SubscriptionLog`[]) => \{ `toBe`: `subscriptionLogsToBeFn`; \}                                                                                                                                                  |
| <a id="flush"></a> `flush`                             | () => `void`                                                                                                                                                                                                                                |
| <a id="hot"></a> `hot`                                 | \<`T`\>(`marbles`: `string`, `values?`: \{ \[`marble`: `string`\]: `T`; \}, `error?`: `any`) => `HotObservable`\<`T`\>                                                                                                                      |
| <a id="time"></a> `time`                               | (`marbles`: `string`) => `number`                                                                                                                                                                                                           |
