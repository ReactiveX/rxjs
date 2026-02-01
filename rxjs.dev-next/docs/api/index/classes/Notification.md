[API](../../index.md) / [index](../index.md) / Notification

# ~~Class: Notification~~

## Description

Represents a push-based event or value that an [Observable](Observable.md) can emit.
This class is particularly useful for operators that manage notifications,
like [materialize](../functions/materialize.md), [dematerialize](../functions/dematerialize.md), [observeOn](../functions/observeOn.md), and
others. Besides wrapping the actual delivered value, it also annotates it
with metadata of, for instance, what type of push message it is (`next`,
`error`, or `complete`).

**deprecated**: It is NOT recommended to create instances of `Notification` directly.
Rather, try to create POJOs matching the signature outlined in [ObservableNotification](../type-aliases/ObservableNotification.md).
For example: `{ kind: 'N', value: 1 }`, `{ kind: 'E', error: new Error('bad') }`, or `{ kind: 'C' }`.
Will be removed in v8.

Defined in: [internal/Notification.ts:35](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L35)

Represents a push-based event or value that an [Observable](Observable.md) can emit.
This class is particularly useful for operators that manage notifications,
like [materialize](../functions/materialize.md), [dematerialize](../functions/dematerialize.md), [observeOn](../functions/observeOn.md), and
others. Besides wrapping the actual delivered value, it also annotates it
with metadata of, for instance, what type of push message it is (`next`,
`error`, or `complete`).

## See

 - [materialize](../functions/materialize.md)
 - [dematerialize](../functions/dematerialize.md)
 - [observeOn](../functions/observeOn.md)

## Deprecated

It is NOT recommended to create instances of `Notification` directly.
Rather, try to create POJOs matching the signature outlined in [ObservableNotification](../type-aliases/ObservableNotification.md).
For example: `{ kind: 'N', value: 1 }`, `{ kind: 'E', error: new Error('bad') }`, or `{ kind: 'C' }`.
Will be removed in v8.

## Constructors

### Constructor

```ts
new Notification<>(kind: "N", value?: T): Notification<T>;
```

Defined in: [internal/Notification.ts:49](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L49)

Creates a "Next" notification object.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `kind` | `"N"` | Always `'N'` |
| `value?` | `T` | The value to notify with if observed. |

#### Returns

`Notification`\<`T`\>

#### Deprecated

Internal implementation detail. Use Notification#createNext createNext instead.

### Constructor

```ts
new Notification<>(
   kind: "E", 
   value: undefined, 
error: any): Notification<T>;
```

Defined in: [internal/Notification.ts:57](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L57)

Creates an "Error" notification object.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `kind` | `"E"` | Always `'E'` |
| `value` | `undefined` | Always `undefined` |
| `error` | `any` | The error to notify with if observed. |

#### Returns

`Notification`\<`T`\>

#### Deprecated

Internal implementation detail. Use Notification#createError createError instead.

### Constructor

```ts
new Notification<>(kind: "C"): Notification<T>;
```

Defined in: [internal/Notification.ts:63](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L63)

Creates a "completion" notification object.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `kind` | `"C"` | Always `'C'` |

#### Returns

`Notification`\<`T`\>

#### Deprecated

Internal implementation detail. Use Notification#createComplete createComplete instead.

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="error"></a> ~~`error?`~~ | `any` | - |
| <a id="hasvalue"></a> ~~`hasValue`~~ | `boolean` | A value signifying that the notification will "next" if observed. In truth, This is really synonymous with just checking `kind === "N"`. **Deprecated** Will be removed in v8. Instead, just check to see if the value of `kind` is `"N"`. |
| <a id="kind"></a> ~~`kind`~~ | `"N"` \| `"E"` \| `"C"` | - |
| <a id="value"></a> ~~`value?`~~ | `T` | - |

## Methods

### ~~accept()~~

#### Call Signature

```ts
accept(
   next: (value: T) => void, 
   error: (err: any) => void, 
   complete: () => void): void;
```

Defined in: [internal/Notification.ts:118](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L118)

Executes a notification on the appropriate handler from a list provided.
If a handler is missing for the kind of notification, nothing is called
and no error is thrown, it will be a noop.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `next` | (`value`: `T`) => `void` | A next handler |
| `error` | (`err`: `any`) => `void` | An error handler |
| `complete` | () => `void` | A complete handler |

##### Returns

`void`

##### Deprecated

Replaced with [observe](#observe). Will be removed in v8.

#### Call Signature

```ts
accept(next: (value: T) => void, error: (err: any) => void): void;
```

Defined in: [internal/Notification.ts:127](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L127)

Executes a notification on the appropriate handler from a list provided.
If a handler is missing for the kind of notification, nothing is called
and no error is thrown, it will be a noop.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `next` | (`value`: `T`) => `void` | A next handler |
| `error` | (`err`: `any`) => `void` | An error handler |

##### Returns

`void`

##### Deprecated

Replaced with [observe](#observe). Will be removed in v8.

#### Call Signature

```ts
accept(next: (value: T) => void): void;
```

Defined in: [internal/Notification.ts:134](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L134)

Executes the next handler if the Notification is of `kind` `"N"`. Otherwise
this will not error, and it will be a noop.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `next` | (`value`: `T`) => `void` | The next handler |

##### Returns

`void`

##### Deprecated

Replaced with [observe](#observe). Will be removed in v8.

#### Call Signature

```ts
accept(observer: PartialObserver<T>): void;
```

Defined in: [internal/Notification.ts:143](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L143)

Executes the appropriate handler on a passed `observer` given the `kind` of notification.
If the handler is missing it will do nothing. Even if the notification is an error, if
there is no error handler on the observer, an error will not be thrown, it will noop.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `observer` | [`PartialObserver`](../type-aliases/PartialObserver.md)\<`T`\> | The observer to notify. |

##### Returns

`void`

##### Deprecated

Replaced with [observe](#observe). Will be removed in v8.

### ~~do()~~

#### Call Signature

```ts
do(
   next: (value: T) => void, 
   error: (err: any) => void, 
   complete: () => void): void;
```

Defined in: [internal/Notification.ts:87](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L87)

Executes a notification on the appropriate handler from a list provided.
If a handler is missing for the kind of notification, nothing is called
and no error is thrown, it will be a noop.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `next` | (`value`: `T`) => `void` | A next handler |
| `error` | (`err`: `any`) => `void` | An error handler |
| `complete` | () => `void` | A complete handler |

##### Returns

`void`

##### Deprecated

Replaced with [observe](#observe). Will be removed in v8.

#### Call Signature

```ts
do(next: (value: T) => void, error: (err: any) => void): void;
```

Defined in: [internal/Notification.ts:96](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L96)

Executes a notification on the appropriate handler from a list provided.
If a handler is missing for the kind of notification, nothing is called
and no error is thrown, it will be a noop.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `next` | (`value`: `T`) => `void` | A next handler |
| `error` | (`err`: `any`) => `void` | An error handler |

##### Returns

`void`

##### Deprecated

Replaced with [observe](#observe). Will be removed in v8.

#### Call Signature

```ts
do(next: (value: T) => void): void;
```

Defined in: [internal/Notification.ts:103](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L103)

Executes the next handler if the Notification is of `kind` `"N"`. Otherwise
this will not error, and it will be a noop.

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `next` | (`value`: `T`) => `void` | The next handler |

##### Returns

`void`

##### Deprecated

Replaced with [observe](#observe). Will be removed in v8.

### ~~observe()~~

```ts
observe(observer: PartialObserver<T>): void;
```

Defined in: [internal/Notification.ts:74](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L74)

Executes the appropriate handler on a passed `observer` given the `kind` of notification.
If the handler is missing it will do nothing. Even if the notification is an error, if
there is no error handler on the observer, an error will not be thrown, it will noop.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `observer` | [`PartialObserver`](../type-aliases/PartialObserver.md)\<`T`\> | The observer to notify. |

#### Returns

`void`

### ~~toObservable()~~

```ts
toObservable(): Observable<T>;
```

Defined in: [internal/Notification.ts:157](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L157)

Returns a simple Observable that just delivers the notification represented
by this Notification instance.

#### Returns

[`Observable`](Observable.md)\<`T`\>

#### Deprecated

Will be removed in v8. To convert a `Notification` to an [Observable](Observable.md),
use [of](../functions/of.md) and [dematerialize](../functions/dematerialize.md): `of(notification).pipe(dematerialize())`.

### ~~createComplete()~~

```ts
static createComplete(): Notification<never> & CompleteNotification;
```

Defined in: [internal/Notification.ts:220](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L220)

A shortcut to create a Notification instance of the type `complete`.

#### Returns

`Notification`\<`never`\> & [`CompleteNotification`](../interfaces/CompleteNotification.md)

The valueless "complete" Notification.

#### Deprecated

It is NOT recommended to create instances of `Notification` directly.
Rather, try to create POJOs matching the signature outlined in [ObservableNotification](../type-aliases/ObservableNotification.md).
For example: `{ kind: 'N', value: 1 }`, `{ kind: 'E', error: new Error('bad') }`, or `{ kind: 'C' }`.
Will be removed in v8.

### ~~createError()~~

```ts
static createError(err?: any): Notification<never> & ErrorNotification;
```

Defined in: [internal/Notification.ts:208](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L208)

A shortcut to create a Notification instance of the type `error` from a
given error.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `err?` | `any` | The `error` error. |

#### Returns

`Notification`\<`never`\> & [`ErrorNotification`](../interfaces/ErrorNotification.md)

The "error" Notification representing the argument.

#### Deprecated

It is NOT recommended to create instances of `Notification` directly.
Rather, try to create POJOs matching the signature outlined in [ObservableNotification](../type-aliases/ObservableNotification.md).
For example: `{ kind: 'N', value: 1 }`, `{ kind: 'E', error: new Error('bad') }`, or `{ kind: 'C' }`.
Will be removed in v8.

### ~~createNext()~~

```ts
static createNext<>(value: T): Notification<T> & NextNotification<T>;
```

Defined in: [internal/Notification.ts:194](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Notification.ts#L194)

A shortcut to create a Notification instance of the type `next` from a
given value.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `T` | The `next` value. |

#### Returns

`Notification`\<`T`\> & [`NextNotification`](../interfaces/NextNotification.md)\<`T`\>

The "next" Notification representing the argument.

#### Deprecated

It is NOT recommended to create instances of `Notification` directly.
Rather, try to create POJOs matching the signature outlined in [ObservableNotification](../type-aliases/ObservableNotification.md).
For example: `{ kind: 'N', value: 1 }`, `{ kind: 'E', error: new Error('bad') }`, or `{ kind: 'C' }`.
Will be removed in v8.
