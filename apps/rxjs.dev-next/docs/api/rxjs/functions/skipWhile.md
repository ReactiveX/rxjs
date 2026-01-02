[API](../../index.md) / [rxjs](../index.md) / skipWhile

# Function: skipWhile()

> Returns an Observable that skips all items emitted by the source Observable as long as a specified condition holds
> true, but emits all further source items as soon as the condition becomes false.

## Description

![](/images/marble-diagrams/skipWhile.png)

Skips all the notifications with a truthy predicate. It will not skip the notifications when the predicate is falsy.
It can also be skipped using index. Once the predicate is true, it will not be called again.

```ts
function skipWhile<>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/skipWhile.ts:6](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/skipWhile.ts#L6)

Returns an Observable that skips all items emitted by the source Observable as long as a specified condition holds
true, but emits all further source items as soon as the condition becomes false.

![](/images/marble-diagrams/skipWhile.png)

Skips all the notifications with a truthy predicate. It will not skip the notifications when the predicate is falsy.
It can also be skipped using index. Once the predicate is true, it will not be called again.

## Parameters

| Parameter   | Type                                           |
| ----------- | ---------------------------------------------- |
| `predicate` | (`value`: `T`, `index`: `number`) => `boolean` |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

## Example

Skip some super heroes

```ts
import { from, skipWhile } from 'rxjs';

const source = from(['Green Arrow', 'SuperMan', 'Flash', 'SuperGirl', 'Black Canary']);
// Skip the heroes until SuperGirl
const example = source.pipe(skipWhile((hero) => hero !== 'SuperGirl'));
// output: SuperGirl, Black Canary
example.subscribe((femaleHero) => console.log(femaleHero));
```

Skip values from the array until index 5

```ts
import { from, skipWhile } from 'rxjs';

const source = from([1, 2, 3, 4, 5, 6, 7, 9, 10]);
const example = source.pipe(skipWhile((_, i) => i !== 5));
// output: 6, 7, 9, 10
example.subscribe((value) => console.log(value));
```

## See

- [last](last.md)
- [skip](skip.md)
- [skipUntil](skipUntil.md)
- [skipLast](skipLast.md)

## Param

A function to test each item emitted from the source Observable.
