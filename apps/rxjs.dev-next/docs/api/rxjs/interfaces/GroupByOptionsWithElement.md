[API](../../index.md) / [rxjs](../index.md) / GroupByOptionsWithElement

# Interface: GroupByOptionsWithElement

Defined in: [rxjs/src/internal/operators/groupBy.ts:11](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/groupBy.ts#L11)

## Properties

| Property                            | Type                                                                                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="connector"></a> `connector?` | () => [`SubjectLike`](SubjectLike.md)\<`E`\>                                                                                             |
| <a id="duration"></a> `duration?`   | (`grouped`: [`GroupedObservable`](GroupedObservable.md)\<`K`, `E`\>) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> |
| <a id="element"></a> `element`      | (`value`: `T`) => `E`                                                                                                                    |
