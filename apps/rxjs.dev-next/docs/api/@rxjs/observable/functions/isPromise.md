[API](../../../index.md) / [@rxjs/observable](../index.md) / isPromise

# Function: isPromise()

```ts
function isPromise(value: any): value is PromiseLike<any>;
```

Defined in: [observable/src/observable.ts:1306](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L1306)

Tests to see if the object is "thennable".

## Parameters

| Parameter | Type  | Description        |
| --------- | ----- | ------------------ |
| `value`   | `any` | the object to test |

## Returns

`value is PromiseLike<any>`
