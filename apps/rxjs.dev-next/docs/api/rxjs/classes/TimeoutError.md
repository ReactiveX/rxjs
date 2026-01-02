[API](../../index.md) / [rxjs](../index.md) / TimeoutError

# Class: TimeoutError

> An error thrown by the [timeout](../functions/timeout.md) operator.

## Description

Provided so users can use as a type and do quality comparisons.
We recommend you do not subclass this or create instances of this class directly.
If you have need of a error representing a timeout, you should
create your own error class and use that.

Defined in: [rxjs/src/internal/operators/timeout.ts:60](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/timeout.ts#L60)

## See

[timeout](../functions/timeout.md)

## Extends

- `Error`

## Constructors

### Constructor

```ts
new TimeoutError<>(info: TimeoutInfo<T, M> | null): TimeoutError<T, M>;
```

Defined in: [rxjs/src/internal/operators/timeout.ts:70](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/timeout.ts#L70)

#### Parameters

| Parameter | Type                                                                | Default value | Description                                                                                                                                                                                                                                                          |
| --------- | ------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `info`    | [`TimeoutInfo`](../interfaces/TimeoutInfo.md)\<`T`, `M`\> \| `null` | `null`        | The information provided to the error by the timeout operation that created the error. Will be `null` if used directly in non-RxJS code with an empty constructor. (Note that using this constructor directly is not recommended, you should create your own errors) |

#### Returns

`TimeoutError`\<`T`, `M`\>

#### Deprecated

Internal implementation detail. Do not construct error instances.
Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269

#### Overrides

```ts
Error.constructor;
```

## Properties

| Property                 | Type                                                                | Default value | Description                                                                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="info"></a> `info` | [`TimeoutInfo`](../interfaces/TimeoutInfo.md)\<`T`, `M`\> \| `null` | `null`        | The information provided to the error by the timeout operation that created the error. Will be `null` if used directly in non-RxJS code with an empty constructor. (Note that using this constructor directly is not recommended, you should create your own errors) |
