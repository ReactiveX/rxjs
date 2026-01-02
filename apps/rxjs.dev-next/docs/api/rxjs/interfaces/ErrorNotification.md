[API](../../index.md) / [rxjs](../index.md) / ErrorNotification

# Interface: ErrorNotification

## Description

A notification representing an "error" from an observable.
Can be used with [dematerialize](../functions/dematerialize.md).

Defined in: [rxjs/src/internal/types.ts:130](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L130)

A notification representing an "error" from an observable.
Can be used with [dematerialize](../functions/dematerialize.md).

## Properties

| Property                   | Type  | Description                          |
| -------------------------- | ----- | ------------------------------------ |
| <a id="error"></a> `error` | `any` | -                                    |
| <a id="kind"></a> `kind`   | `"E"` | The kind of notification. Always "E" |
