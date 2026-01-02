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

```ts
function first<>(predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>;
```

Defined in: [rxjs/src/internal/operators/first.ts:18](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/first.ts#L18)

Emits only the first value (or the first value that meets some condition)
emitted by the source Observable.

<span class="informal">Emits only the first value. Or emits only the first
value that passes some test.</span>

![](/images/marble-diagrams/first.png)

If called with no arguments, `first` emits the first value of the source
Observable, then completes. If called with a `predicate` function, `first`
emits the first value of the source that matches the specified condition. Emits an error
notification if `defaultValue` was not provided and a matching element is not found.

## Parameters

| Parameter       | Type                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `predicate`     | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `boolean` |
| `defaultValue?` | `D`                                                                                                       |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `D`\>

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

## Param

An optional function called with each item to test for condition
matching.

## Param

The default value emitted in case no valid value was found on
the source.
