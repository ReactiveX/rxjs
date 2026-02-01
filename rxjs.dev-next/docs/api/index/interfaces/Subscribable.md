[API](../../index.md) / [index](../index.md) / Subscribable

# Interface: Subscribable

## Description

OBSERVABLE INTERFACES

Defined in: [internal/types.ts:96](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L96)

OBSERVABLE INTERFACES

## Extended by

- [`SubjectLike`](SubjectLike.md)

## Methods

### subscribe()

```ts
subscribe(observer: Partial<Observer<T>>): Unsubscribable;
```

Defined in: [internal/types.ts:97](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L97)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `observer` | `Partial`\<[`Observer`](Observer.md)\<`T`\>\> |

#### Returns

[`Unsubscribable`](Unsubscribable.md)
