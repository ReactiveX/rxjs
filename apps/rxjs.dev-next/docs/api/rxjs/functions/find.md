[API](../../index.md) / [rxjs](../index.md) / find

# Function: find()

> Emits only the first value emitted by the source Observable that meets some
> condition.

## Description

<span class="informal">Finds the first value that passes some test and emits
that.</span>

![](/images/marble-diagrams/find.png)

`find` searches for the first item in the source Observable that matches the
specified condition embodied by the `predicate`, and returns the first
occurrence in the source. Unlike [first](first.md), the `predicate` is required
in `find`, and does not emit an error if a valid value is not found
(emits `undefined` instead).

## Example

Find and emit the first click that happens on a DIV element

```ts
import { fromEvent, find } from 'rxjs';

const div = document.createElement('div');
div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
document.body.appendChild(div);

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(find((ev) => (<HTMLElement>ev.target).tagName === 'DIV'));
result.subscribe((x) => console.log(x));
```

## See

- [filter](filter.md)
- [first](first.md)
- [findIndex](findIndex.md)
- [take](take.md)

## Parameters

### `predicate`

A function called with each item to test for condition matching.

## Returns

`A`

function that returns an Observable that emits the first item that matches the condition.

## Call Signature

```ts
function find<>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
```

Defined in: [rxjs/src/internal/operators/find.ts:5](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/find.ts#L5)

### Parameters

| Parameter   | Type                 |
| ----------- | -------------------- |
| `predicate` | `BooleanConstructor` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`TruthyTypesOf`](../type-aliases/TruthyTypesOf.md)\<`T`\>\>

## Call Signature

```ts
function find<>(predicate: (value: T, index: number, source: Observable<T>) => value is S): OperatorFunction<T, S | undefined>;
```

Defined in: [rxjs/src/internal/operators/find.ts:6](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/find.ts#L6)

### Parameters

| Parameter   | Type                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| `predicate` | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `value is S` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `S` \| `undefined`\>

## Call Signature

```ts
function find<>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, T | undefined>;
```

Defined in: [rxjs/src/internal/operators/find.ts:9](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/find.ts#L9)

### Parameters

| Parameter   | Type                                                                                                      |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| `predicate` | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `boolean` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `undefined`\>
