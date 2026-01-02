[API](../../index.md) / [rxjs](../index.md) / scheduled

# Function: scheduled()

```ts
function scheduled<>(input: ObservableInput<T>, scheduler: SchedulerLike): Observable<T>;
```

Defined in: [rxjs/src/internal/scheduled/scheduled.ts:22](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/scheduled/scheduled.ts#L22)

Converts from a common [ObservableInput](../type-aliases/ObservableInput.md) type to an observable where subscription and emissions
are scheduled on the provided scheduler.

## Parameters

| Parameter   | Type                                                           | Description                                                                                   |
| ----------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `input`     | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`T`\> | The observable, array, promise, iterable, etc you would like to schedule                      |
| `scheduler` | [`SchedulerLike`](../interfaces/SchedulerLike.md)              | The scheduler to use to schedule the subscription and emissions from the returned observable. |

## Returns

[`Observable`](../classes/Observable.md)\<`T`\>

## See

- [from](from.md)
- [of](of.md)
