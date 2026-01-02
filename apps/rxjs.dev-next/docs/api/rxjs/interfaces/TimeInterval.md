[API](../../index.md) / [rxjs](../index.md) / TimeInterval

# Interface: TimeInterval

> A value emitted and the amount of time since the last value was emitted.

## Description

Emitted by the `timeInterval` operator.

Defined in: [rxjs/src/internal/types.ts:64](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L64)

A value emitted and the amount of time since the last value was emitted.

Emitted by the `timeInterval` operator.

## See

[timeInterval](../functions/timeInterval.md)

## Properties

| Property                         | Type     | Description                                                                                                                                                                            |
| -------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="interval"></a> `interval` | `number` | The amount of time between this value's emission and the previous value's emission. If this is the first emitted value, then it will be the amount of time since subscription started. |
| <a id="value"></a> `value`       | `T`      | -                                                                                                                                                                                      |
