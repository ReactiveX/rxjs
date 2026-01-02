[API](../../index.md) / [rxjs](../index.md) / UnsubscriptionError

# Class: UnsubscriptionError

> An error thrown when one or more errors have occurred during the
> `unsubscribe` of a [Subscription](Subscription.%0A%0A#).

Defined in: [observable/src/observable.ts:23](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L23)

An error thrown when one or more errors have occurred during the
`unsubscribe` of a [Subscription](Subscription.md).

## Extends

- `Error`

## Constructors

### Constructor

```ts
new UnsubscriptionError(errors: any[]): UnsubscriptionError;
```

Defined in: [observable/src/observable.ts:28](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L28)

#### Parameters

| Parameter | Type    |
| --------- | ------- |
| `errors`  | `any`[] |

#### Returns

`UnsubscriptionError`

#### Deprecated

Internal implementation detail. Do not construct error instances.
Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269

#### Overrides

```ts
Error.constructor;
```

## Properties

| Property                     | Type    |
| ---------------------------- | ------- |
| <a id="errors"></a> `errors` | `any`[] |
