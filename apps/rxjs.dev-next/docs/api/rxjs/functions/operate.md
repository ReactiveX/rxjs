[API](../../index.md) / [rxjs](../index.md) / operate

# Function: operate()

```ts
function operate<>(config: OperateConfig<In, Out>): Subscriber<In>;
```

Defined in: [observable/src/observable.ts:536](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L536)

Creates a new [Subscriber](../classes/Subscriber.md) instance that passes notifications on to the
supplied `destination`. The overrides provided in the `config` argument for
`next`, `error`, and `complete` will be called in such a way that any
errors are caught and forwarded to the destination's `error` handler. The returned
`Subscriber` will be "chained" to the `destination` such that when `unsubscribe` is
called on the `destination`, the returned `Subscriber` will also be unsubscribed.

Advanced: This ensures that subscriptions are properly wired up prior to starting the
subscription logic. This prevents "synchronous firehose" scenarios where an
inner observable from a flattening operation cannot be stopped by a downstream
terminal operator like `take`.

This is a utility designed to be used to create new operators for observables.

For examples, please see our code base.

## Parameters

| Parameter | Type                           | Description                                                      |
| --------- | ------------------------------ | ---------------------------------------------------------------- |
| `config`  | `OperateConfig`\<`In`, `Out`\> | The configuration for creating a new subscriber for an operator. |

## Returns

[`Subscriber`](../classes/Subscriber.md)\<`In`\>

A new subscriber that is chained to the destination.
