[API](../../index.md) / [rxjs](../index.md) / first

# Function: first()

> Emits only the first value (or the first value that meets some condition)
> emitted by the source Observable.

## Description

<span class="informal">Emits only the first value. Or emits only the first
value that passes some test.</span>

![](/images/marble-diagrams/first.png)

If called with no arguments, `first` emits the first value of the source
Observable, then completes. If called with a `predicate` function, `first`
emits the first value of the source that matches the specified condition. Emits an error
notification if `defaultValue` was not provided and a matching element is not found.

## Example

Emit only the first click that happens on the DOM

```ts
import { fromEvent, first } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(first());
result.subscribe((x) => console.log(x));
```

Emits the first click that happens on a DIV

```ts
import { fromEvent, first } from 'rxjs';

const div = document.createElement('div');
div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
document.body.appendChild(div);

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(first((ev) => (<HTMLElement>ev.target).tagName === 'DIV'));
result.subscribe((x) => console.log(x));
```

## See

- [filter](filter.md)
- [find](find.md)
- [take](take.md)
- [last](last.md)

## Throws

Delivers an `EmptyError` to the Observer's `error`
callback if the Observable completes before any `next` notification was sent.
This is how `first()` is different from `take(1)` which completes instead.

matching.

the source.

## Parameters

### `predicate`

An optional function called with each item to test for condition

### `defaultValue`

The default value emitted in case no valid value was found on

## Returns

`A`

function that returns an Observable that emits the first item that matches the condition.

## Call Signature

```ts
function first<>(predicate?: null, defaultValue?: D): OperatorFunction<T, T | D>;
```

Defined in: [rxjs/src/internal/operators/first.ts:7](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/first.ts#L7)

### Parameters

| Parameter       | Type   |
| --------------- | ------ |
| `predicate?`    | `null` |
| `defaultValue?` | `D`    |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `D`\>

## Call Signature

```ts
function first<>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
```

Defined in: [rxjs/src/internal/operators/first.ts:8](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/first.ts#L8)

### Parameters

| Parameter   | Type                 |
| ----------- | -------------------- |
| `predicate` | `BooleanConstructor` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`TruthyTypesOf`](../type-aliases/TruthyTypesOf.md)\<`T`\>\>

## Call Signature

```ts
function first<>(predicate: BooleanConstructor, defaultValue: D): OperatorFunction<T, D | TruthyTypesOf<T>>;
```

Defined in: [rxjs/src/internal/operators/first.ts:9](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/first.ts#L9)

### Parameters

| Parameter      | Type                 |
| -------------- | -------------------- |
| `predicate`    | `BooleanConstructor` |
| `defaultValue` | `D`                  |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `D` \| [`TruthyTypesOf`](../type-aliases/TruthyTypesOf.md)\<`T`\>\>

## Call Signature

```ts
function first<>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue?: S): OperatorFunction<T, S>;
```

Defined in: [rxjs/src/internal/operators/first.ts:10](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/first.ts#L10)

### Parameters

| Parameter       | Type                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| `predicate`     | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `value is S` |
| `defaultValue?` | `S`                                                                                                          |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `S`\>

## Call Signature

```ts
function first<>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue: D): OperatorFunction<T, S | D>;
```

Defined in: [rxjs/src/internal/operators/first.ts:14](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/first.ts#L14)

### Parameters

| Parameter      | Type                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `predicate`    | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `value is S` |
| `defaultValue` | `D`                                                                                                          |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `S` \| `D`\>

## Call Signature

```ts
function first<>(predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>;
```

Defined in: [rxjs/src/internal/operators/first.ts:18](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/first.ts#L18)

### Parameters

| Parameter       | Type                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `predicate`     | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `boolean` |
| `defaultValue?` | `D`                                                                                                       |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `D`\>
