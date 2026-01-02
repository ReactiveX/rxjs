[API](../../../index.md) / [@rxjs/observable](../index.md) / subscribeToArray

# Function: subscribeToArray()

```ts
function subscribeToArray<>(array: ArrayLike<T>, subscriber: Subscriber<T>): void;
```

Defined in: [observable/src/observable.ts:1210](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L1210)

Subscribes to an ArrayLike with a subscriber

## Parameters

| Parameter    | Type                                                       | Description                             |
| ------------ | ---------------------------------------------------------- | --------------------------------------- |
| `array`      | `ArrayLike`\<`T`\>                                         | The array or array-like to subscribe to |
| `subscriber` | [`Subscriber`](../../../rxjs/classes/Subscriber.md)\<`T`\> |                                         |

## Returns

`void`
