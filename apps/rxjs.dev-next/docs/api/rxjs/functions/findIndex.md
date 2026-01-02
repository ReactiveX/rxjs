[API](../../index.md) / [rxjs](../index.md) / findIndex

# Function: findIndex()

> Emits only the index of the first value emitted by the source Observable that
> meets some condition.

## Description

<span class="informal">It's like [find](find.md), but emits the index of the
found value, not the value itself.</span>

![](/images/marble-diagrams/findIndex.png)

`findIndex` searches for the first item in the source Observable that matches
the specified condition embodied by the `predicate`, and returns the
(zero-based) index of the first occurrence in the source. Unlike
[first](first.md), the `predicate` is required in `findIndex`, and does not emit
an error if a valid value is not found.

```ts
function findIndex<>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, number>;
```

Defined in: [rxjs/src/internal/operators/findIndex.ts:6](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/findIndex.ts#L6)

Emits only the index of the first value emitted by the source Observable that
meets some condition.

<span class="informal">It's like [find](find.md), but emits the index of the
found value, not the value itself.</span>

![](/images/marble-diagrams/findIndex.png)

`findIndex` searches for the first item in the source Observable that matches
the specified condition embodied by the `predicate`, and returns the
(zero-based) index of the first occurrence in the source. Unlike
[first](first.md), the `predicate` is required in `findIndex`, and does not emit
an error if a valid value is not found.

## Parameters

| Parameter   | Type                                                                                                      |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| `predicate` | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `boolean` |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `number`\>

## Example

Emit the index of first click that happens on a DIV element

```ts
import { fromEvent, findIndex } from 'rxjs';

const div = document.createElement('div');
div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
document.body.appendChild(div);

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(findIndex((ev) => (<HTMLElement>ev.target).tagName === 'DIV'));
result.subscribe((x) => console.log(x));
```

## See

- [filter](filter.md)
- [find](find.md)
- [first](first.md)
- [take](take.md)

## Param

A function called with each item to test for condition
matching.
