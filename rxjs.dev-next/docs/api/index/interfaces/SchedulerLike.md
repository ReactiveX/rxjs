[API](../../index.md) / [index](../index.md) / SchedulerLike

# Interface: SchedulerLike

## Description

This is a type that provides a method to allow RxJS to create a numeric timestamp

Defined in: [internal/types.ts:227](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L227)

This is a type that provides a method to allow RxJS to create a numeric timestamp

## Extends

- [`TimestampProvider`](TimestampProvider.md)

## Methods

### now()

```ts
now(): number;
```

Defined in: [internal/types.ts:247](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L247)

Returns a timestamp as a number.

This is used by types like `ReplaySubject` or operators like `timestamp` to calculate
the amount of time passed between events.

#### Returns

`number`

#### Inherited from

[`TimestampProvider`](TimestampProvider.md).[`now`](TimestampProvider.md#now)

### schedule()

#### Call Signature

```ts
schedule<>(
   work: (this: SchedulerAction<T>, state: T) => void, 
   delay: number, 
   state: T): Subscription;
```

Defined in: [internal/types.ts:228](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L228)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `work` | (`this`: [`SchedulerAction`](SchedulerAction.md)\<`T`\>, `state`: `T`) => `void` |
| `delay` | `number` |
| `state` | `T` |

##### Returns

[`Subscription`](../classes/Subscription.md)

#### Call Signature

```ts
schedule<>(
   work: (this: SchedulerAction<T>, state?: T) => void, 
   delay: number, 
   state?: T): Subscription;
```

Defined in: [internal/types.ts:229](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L229)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `work` | (`this`: [`SchedulerAction`](SchedulerAction.md)\<`T`\>, `state?`: `T`) => `void` |
| `delay` | `number` |
| `state?` | `T` |

##### Returns

[`Subscription`](../classes/Subscription.md)

#### Call Signature

```ts
schedule<>(
   work: (this: SchedulerAction<T>, state?: T) => void, 
   delay?: number, 
   state?: T): Subscription;
```

Defined in: [internal/types.ts:230](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L230)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `work` | (`this`: [`SchedulerAction`](SchedulerAction.md)\<`T`\>, `state?`: `T`) => `void` |
| `delay?` | `number` |
| `state?` | `T` |

##### Returns

[`Subscription`](../classes/Subscription.md)
