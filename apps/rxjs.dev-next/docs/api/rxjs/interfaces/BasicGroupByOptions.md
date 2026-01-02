[API](../../index.md) / [rxjs](../index.md) / BasicGroupByOptions

# Interface: BasicGroupByOptions

Defined in: [rxjs/src/internal/operators/groupBy.ts:5](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/groupBy.ts#L5)

## Properties

| Property                            | Type                                                                                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="connector"></a> `connector?` | () => [`SubjectLike`](SubjectLike.md)\<`T`\>                                                                                             |
| <a id="duration"></a> `duration?`   | (`grouped`: [`GroupedObservable`](GroupedObservable.md)\<`K`, `T`\>) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> |
| <a id="element"></a> `element?`     | `undefined`                                                                                                                              |
