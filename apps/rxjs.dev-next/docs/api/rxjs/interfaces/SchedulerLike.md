[API](../../index.md) / [rxjs](../index.md) / SchedulerLike

# Interface: SchedulerLike

## Description

This is a type that provides a method to allow RxJS to create a numeric timestamp

Defined in: [rxjs/src/internal/types.ts:216](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L216)

This is a type that provides a method to allow RxJS to create a numeric timestamp

## Extends

- [`TimestampProvider`](TimestampProvider.md)

## Methods

### now()

```ts
now(): number;
```

Defined in: [rxjs/src/internal/types.ts:236](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L236)

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

Defined in: [rxjs/src/internal/types.ts:217](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L217)

##### Parameters

| Parameter | Type                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| `work`    | (`this`: [`SchedulerAction`](SchedulerAction.md)\<`T`\>, `state`: `T`) => `void` |
| `delay`   | `number`                                                                         |
| `state`   | `T`                                                                              |

##### Returns

[`Subscription`](../classes/Subscription.md)

#### Call Signature

```ts
schedule<>(
   work: (this: SchedulerAction<T>, state?: T) => void,
   delay: number,
   state?: T): Subscription;
```

Defined in: [rxjs/src/internal/types.ts:218](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L218)

##### Parameters

| Parameter | Type                                                                              |
| --------- | --------------------------------------------------------------------------------- |
| `work`    | (`this`: [`SchedulerAction`](SchedulerAction.md)\<`T`\>, `state?`: `T`) => `void` |
| `delay`   | `number`                                                                          |
| `state?`  | `T`                                                                               |

##### Returns

[`Subscription`](../classes/Subscription.md)

#### Call Signature

```ts
schedule<>(
   work: (this: SchedulerAction<T>, state?: T) => void,
   delay?: number,
   state?: T): Subscription;
```

Defined in: [rxjs/src/internal/types.ts:219](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L219)

##### Parameters

| Parameter | Type                                                                              |
| --------- | --------------------------------------------------------------------------------- |
| `work`    | (`this`: [`SchedulerAction`](SchedulerAction.md)\<`T`\>, `state?`: `T`) => `void` |
| `delay?`  | `number`                                                                          |
| `state?`  | `T`                                                                               |

##### Returns

[`Subscription`](../classes/Subscription.md)
