[API](../../index.md) / [index](../index.md) / GroupByOptionsWithElement

# Interface: GroupByOptionsWithElement

Defined in: [internal/operators/groupBy.ts:14](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/groupBy.ts#L14)

## Properties

| Property | Type |
| ------ | ------ |
| <a id="connector"></a> `connector?` | () => [`SubjectLike`](SubjectLike.md)\<`E`\> |
| <a id="duration"></a> `duration?` | (`grouped`: [`GroupedObservable`](GroupedObservable.md)\<`K`, `E`\>) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> |
| <a id="element"></a> `element` | (`value`: `T`) => `E` |
