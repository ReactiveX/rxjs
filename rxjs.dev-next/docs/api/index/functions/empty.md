[API](../../index.md) / [index](../index.md) / empty

# ~~Function: empty()~~

```ts
function empty(scheduler?: SchedulerLike): Observable<never>;
```

Defined in: [internal/observable/empty.ts:73](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/empty.ts#L73)

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scheduler?` | [`SchedulerLike`](../interfaces/SchedulerLike.md) | A [SchedulerLike](../interfaces/SchedulerLike.md) to use for scheduling the emission of the complete notification. |

## Returns

[`Observable`](../classes/Observable.md)\<`never`\>

## Deprecated

Replaced with the [EMPTY](../variables/EMPTY.md) constant or [scheduled](scheduled.md) (e.g. `scheduled([], scheduler)`). Will be removed in v8.
