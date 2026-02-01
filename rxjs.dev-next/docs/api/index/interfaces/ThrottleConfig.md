[API](../../index.md) / [index](../index.md) / ThrottleConfig

# Interface: ThrottleConfig

## Description

An object interface used by [throttle](../functions/throttle.md) or [throttleTime](../functions/throttleTime.md) that ensure
configuration options of these operators.

Defined in: [internal/operators/throttle.ts:15](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/throttle.ts#L15)

An object interface used by [throttle](../functions/throttle.md) or [throttleTime](../functions/throttleTime.md) that ensure
configuration options of these operators.

## See

 - [throttle](../functions/throttle.md)
 - [throttleTime](../functions/throttleTime.md)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="leading"></a> `leading?` | `boolean` | If `true`, the resulting Observable will emit the first value from the source Observable at the **start** of the "throttling" process (when starting an internal timer that prevents other emissions from the source to pass through). If `false`, it will not emit the first value from the source Observable at the start of the "throttling" process. If not provided, defaults to: `true`. |
| <a id="trailing"></a> `trailing?` | `boolean` | If `true`, the resulting Observable will emit the last value from the source Observable at the **end** of the "throttling" process (when ending an internal timer that prevents other emissions from the source to pass through). If `false`, it will not emit the last value from the source Observable at the end of the "throttling" process. If not provided, defaults to: `false`. |
