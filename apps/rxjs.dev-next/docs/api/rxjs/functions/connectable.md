[API](../../index.md) / [rxjs](../index.md) / connectable

# Function: connectable()

```ts
function connectable<>(source: ObservableInput<T>, config: ConnectableConfig<T>): Connectable<T>;
```

Defined in: [rxjs/src/internal/observable/connectable.ts:40](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/connectable.ts#L40)

Creates an observable that multicasts once `connect()` is called on it.

## Parameters

| Parameter | Type                                                           | Default value    | Description                                 |
| --------- | -------------------------------------------------------------- | ---------------- | ------------------------------------------- |
| `source`  | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`T`\> | `undefined`      | The observable source to make connectable.  |
| `config`  | `ConnectableConfig`\<`T`\>                                     | `DEFAULT_CONFIG` | The configuration object for `connectable`. |

## Returns

[`Connectable`](../interfaces/Connectable.md)\<`T`\>

A "connectable" observable, that has a `connect()` method, that you must call to
connect the source to all consumers through the subject provided as the connector.
