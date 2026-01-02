[API](../../../index.md) / [@rxjs/observable](../index.md) / fromArrayLike

# Function: fromArrayLike()

```ts
function fromArrayLike<>(array: ArrayLike<T>): Observable<T>;
```

Defined in: [observable/src/observable.ts:1149](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L1149)

Synchronously emits the values of an array like and completes.
This is exported because there are creation functions and operators that need to
make direct use of the same logic, and there's no reason to make them run through
`from` conditionals because we _know_ they're dealing with an array.

## Parameters

| Parameter | Type               | Description                   |
| --------- | ------------------ | ----------------------------- |
| `array`   | `ArrayLike`\<`T`\> | The array to emit values from |

## Returns

[`Observable`](../../../rxjs/classes/Observable.md)\<`T`\>
