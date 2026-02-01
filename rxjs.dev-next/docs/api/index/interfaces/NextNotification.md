[API](../../index.md) / [index](../index.md) / NextNotification

# Interface: NextNotification

## Description

A notification representing a "next" from an observable.
Can be used with [dematerialize](../functions/dematerialize.md).

Defined in: [internal/types.ts:130](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L130)

A notification representing a "next" from an observable.
Can be used with [dematerialize](../functions/dematerialize.md).

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="kind"></a> `kind` | `"N"` | The kind of notification. Always "N" |
| <a id="value"></a> `value` | `T` | The value of the notification. |
