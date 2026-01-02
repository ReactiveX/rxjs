[API](../../index.md) / [rxjs](../index.md) / Operator

# ~~Interface: Operator~~

Defined in: [rxjs/src/internal/Operator.ts:7](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/Operator.ts#L7)

## Deprecated

Internal implementation detail, do not use directly. Will be made internal in v8.

## Methods

### ~~call()~~

```ts
call(subscriber: Subscriber<R>, source: any): TeardownLogic;
```

Defined in: [rxjs/src/internal/Operator.ts:8](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/Operator.ts#L8)

#### Parameters

| Parameter    | Type                                            |
| ------------ | ----------------------------------------------- |
| `subscriber` | [`Subscriber`](../classes/Subscriber.md)\<`R`\> |
| `source`     | `any`                                           |

#### Returns

[`TeardownLogic`](../type-aliases/TeardownLogic.md)
