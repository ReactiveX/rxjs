[API](../../index.md) / [index](../index.md) / TimeInterval

# Interface: TimeInterval

> A value emitted and the amount of time since the last value was emitted.

## Description

Emitted by the `timeInterval` operator.

Defined in: [internal/types.ts:65](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L65)

## See

[timeInterval](../functions/timeInterval.md)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="interval"></a> `interval` | `number` | The amount of time between this value's emission and the previous value's emission. If this is the first emitted value, then it will be the amount of time since subscription started. |
| <a id="value"></a> `value` | `T` | - |
