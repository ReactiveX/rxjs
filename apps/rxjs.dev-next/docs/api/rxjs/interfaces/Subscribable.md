[API](../../index.md) / [rxjs](../index.md) / Subscribable

# Interface: Subscribable

Defined in: [rxjs/src/internal/types.ts:90](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L90)

## Extended by

- [`SubjectLike`](SubjectLike.md)

## Methods

### subscribe()

```ts
subscribe(observer: Partial<Observer<T>>): Unsubscribable;
```

Defined in: [rxjs/src/internal/types.ts:91](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L91)

#### Parameters

| Parameter  | Type                                          |
| ---------- | --------------------------------------------- |
| `observer` | `Partial`\<[`Observer`](Observer.md)\<`T`\>\> |

#### Returns

[`Unsubscribable`](Unsubscribable.md)
