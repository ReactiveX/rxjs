[API](../../index.md) / [rxjs](../index.md) / NextNotification

# Interface: NextNotification

## Description

A notification representing a "next" from an observable.
Can be used with [dematerialize](../functions/dematerialize.md).

Defined in: [rxjs/src/internal/types.ts:119](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L119)

A notification representing a "next" from an observable.
Can be used with [dematerialize](../functions/dematerialize.md).

## Properties

| Property                   | Type  | Description                          |
| -------------------------- | ----- | ------------------------------------ |
| <a id="kind"></a> `kind`   | `"N"` | The kind of notification. Always "N" |
| <a id="value"></a> `value` | `T`   | The value of the notification.       |
