[API](../../index.md) / [index](../index.md) / TimestampProvider

# Interface: TimestampProvider

## Description

This is a type that provides a method to allow RxJS to create a numeric timestamp

Defined in: [internal/types.ts:240](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L240)

This is a type that provides a method to allow RxJS to create a numeric timestamp

## Extended by

- [`SchedulerLike`](SchedulerLike.md)

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
