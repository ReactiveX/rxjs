[API](../../index.md) / [rxjs](../index.md) / TimestampProvider

# Interface: TimestampProvider

## Description

This is a type that provides a method to allow RxJS to create a numeric timestamp

Defined in: [rxjs/src/internal/types.ts:229](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L229)

This is a type that provides a method to allow RxJS to create a numeric timestamp

## Extended by

- [`SchedulerLike`](SchedulerLike.md)

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
