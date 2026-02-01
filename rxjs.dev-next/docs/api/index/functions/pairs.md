[API](../../index.md) / [index](../index.md) / pairs

# ~~Function: pairs()~~

> Convert an object into an Observable of `[key, value]` pairs.

## Description

<span class="informal">Turn entries of an object into a stream.</span>

![](pairs.png)

`pairs` takes an arbitrary object and returns an Observable that emits arrays. Each
emitted array has exactly two elements - the first is a key from the object
and the second is a value corresponding to that key. Keys are extracted from
an object via `Object.keys` function, which means that they will be only
enumerable keys that are present on an object directly - not ones inherited
via prototype chain.

By default, these arrays are emitted synchronously. To change that you can
pass a [SchedulerLike](../interfaces/SchedulerLike.md) as a second argument to `pairs`.

## Example

Converts an object to an Observable

```ts
import { pairs } from 'rxjs';

const obj = {
  foo: 42,
  bar: 56,
  baz: 78
};

pairs(obj).subscribe({
  next: value => console.log(value),
  complete: () => console.log('Complete!')
});

// Logs:
// ['foo', 42]
// ['bar', 56]
// ['baz', 78]
// 'Complete!'
```

### Object.entries required

In IE, you will need to polyfill `Object.entries` in order to use this.
[MDN has a polyfill here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)

**deprecated**: Use `from(Object.entries(obj))` instead. Will be removed in v8.




Observable will emit values.

## Deprecated

Use `from(Object.entries(obj))` instead. Will be removed in v8.

## Parameters

### `obj`

The object to inspect and turn into an Observable sequence.

### `scheduler`

An optional IScheduler to schedule when resulting

## Returns

`An`

observable sequence of [key, value] pairs from the object.


## Call Signature

```ts
function pairs<>(arr: readonly T[], scheduler?: SchedulerLike): Observable<[string, T]>;
```

Defined in: [internal/observable/pairs.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/pairs.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `arr` | readonly `T`[] |
| `scheduler?` | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`Observable`](../classes/Observable.md)\<\[`string`, `T`\]\>

### Deprecated

Use `from(Object.entries(obj))` instead. Will be removed in v8.

## Call Signature

```ts
function pairs<>(obj: O, scheduler?: SchedulerLike): Observable<[keyof O, O[keyof O]]>;
```

Defined in: [internal/observable/pairs.ts:12](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/pairs.ts#L12)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | `O` |
| `scheduler?` | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`Observable`](../classes/Observable.md)\<\[keyof `O`, `O`\[keyof `O`\]\]\>

### Deprecated

Use `from(Object.entries(obj))` instead. Will be removed in v8.

## Call Signature

```ts
function pairs<>(iterable: Iterable<T>, scheduler?: SchedulerLike): Observable<[string, T]>;
```

Defined in: [internal/observable/pairs.ts:16](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/pairs.ts#L16)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `iterable` | `Iterable`\<`T`\> |
| `scheduler?` | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`Observable`](../classes/Observable.md)\<\[`string`, `T`\]\>

### Deprecated

Use `from(Object.entries(obj))` instead. Will be removed in v8.

## Call Signature

```ts
function pairs(n: number | bigint | boolean | symbol | (...args: any[]) => any, scheduler?: SchedulerLike): Observable<[never, never]>;
```

Defined in: [internal/observable/pairs.ts:20](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/pairs.ts#L20)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `n` | `number` \| `bigint` \| `boolean` \| `symbol` \| (...`args`: `any`[]) => `any` |
| `scheduler?` | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`Observable`](../classes/Observable.md)\<\[`never`, `never`\]\>

### Deprecated

Use `from(Object.entries(obj))` instead. Will be removed in v8.
