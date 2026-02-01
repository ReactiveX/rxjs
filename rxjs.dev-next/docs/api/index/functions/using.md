[API](../../index.md) / [index](../index.md) / using

# Function: using()

```ts
function using<>(resourceFactory: () => void | Unsubscribable, observableFactory: (resource: void | Unsubscribable) => void | T): Observable<ObservedValueOf<T>>;
```

Defined in: [internal/observable/using.ts:32](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/using.ts#L32)

Creates an Observable that uses a resource which will be disposed at the same time as the Observable.

<span class="informal">Use it when you catch yourself cleaning up after an Observable.</span>

`using` is a factory operator, which accepts two functions. First function returns a disposable resource.
It can be an arbitrary object that implements `unsubscribe` method. Second function will be injected with
that object and should return an Observable. That Observable can use resource object during its execution.
Both functions passed to `using` will be called every time someone subscribes - neither an Observable nor
resource object will be shared in any way between subscriptions.

When Observable returned by `using` is subscribed, Observable returned from the second function will be subscribed
as well. All its notifications (nexted values, completion and error events) will be emitted unchanged by the output
Observable. If however someone unsubscribes from the Observable or source Observable completes or errors by itself,
the `unsubscribe` method on resource object will be called. This can be used to do any necessary clean up, which
otherwise would have to be handled by hand. Note that complete or error notifications are not emitted when someone
cancels subscription to an Observable via `unsubscribe`, so `using` can be used as a hook, allowing you to make
sure that all resources which need to exist during an Observable execution will be disposed at appropriate time.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `resourceFactory` | () => `void` \| [`Unsubscribable`](../interfaces/Unsubscribable.md) | A function which creates any resource object that implements `unsubscribe` method. |
| `observableFactory` | (`resource`: `void` \| [`Unsubscribable`](../interfaces/Unsubscribable.md)) => `void` \| `T` | A function which creates an Observable, that can use injected resource object. |

## Returns

[`Observable`](../classes/Observable.md)\<[`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`T`\>\>

An Observable that behaves the same as Observable returned by `observableFactory`, but
which - when completed, errored or unsubscribed - will also call `unsubscribe` on created resource object.

## See

[defer](defer.md)
