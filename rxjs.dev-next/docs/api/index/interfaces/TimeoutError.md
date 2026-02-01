[API](../../index.md) / [index](../index.md) / TimeoutError

# Interface: TimeoutError

## Description

An error emitted when a timeout occurs.

Defined in: [internal/operators/timeout.ts:57](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/timeout.ts#L57)

An error emitted when a timeout occurs.

## Extends

- `Error`

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="info"></a> `info` | [`TimeoutInfo`](TimeoutInfo.md)\<`T`, `M`\> \| `null` | The information provided to the error by the timeout operation that created the error. Will be `null` if used directly in non-RxJS code with an empty constructor. (Note that using this constructor directly is not recommended, you should create your own errors) |
