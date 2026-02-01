[API](../../index.md) / [index](../index.md) / skipWhile

# Function: skipWhile()

> Returns an Observable that skips all items emitted by the source Observable as long as a specified condition holds
> true, but emits all further source items as soon as the condition becomes false.

## Description

![](skipWhile.png)

Skips all the notifications with a truthy predicate. It will not skip the notifications when the predicate is falsy.
It can also be skipped using index. Once the predicate is true, it will not be called again.

## Example

Skip some super heroes

```ts
import { from, skipWhile } from 'rxjs';

const source = from(['Green Arrow', 'SuperMan', 'Flash', 'SuperGirl', 'Black Canary'])
// Skip the heroes until SuperGirl
const example = source.pipe(skipWhile(hero => hero !== 'SuperGirl'));
// output: SuperGirl, Black Canary
example.subscribe(femaleHero => console.log(femaleHero));
```

Skip values from the array until index 5

```ts
import { from, skipWhile } from 'rxjs';

const source = from([1, 2, 3, 4, 5, 6, 7, 9, 10]);
const example = source.pipe(skipWhile((_, i) => i !== 5));
// output: 6, 7, 9, 10
example.subscribe(value => console.log(value));
```

## See

 - [last](last.md)
 - [skip](skip.md)
 - [skipUntil](skipUntil.md)
 - [skipLast](skipLast.md)



## Parameters

### `predicate`

A function to test each item emitted from the source Observable.

## Returns

`A`

function that returns an Observable that begins emitting items emitted by the source Observable when the specified predicate becomes false.


## Call Signature

```ts
function skipWhile<>(predicate: BooleanConstructor): OperatorFunction<T, Extract<T, Falsy> extends never ? never : T>;
```

Defined in: [internal/operators/skipWhile.ts:5](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/skipWhile.ts#L5)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `BooleanConstructor` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `Extract`\<`T`, [`Falsy`](../type-aliases/Falsy.md)\> *extends* `never` ? `never` : `T`\>

## Call Signature

```ts
function skipWhile<>(predicate: (value: T, index: number) => true): OperatorFunction<T, never>;
```

Defined in: [internal/operators/skipWhile.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/skipWhile.ts#L6)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | (`value`: `T`, `index`: `number`) => `true` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `never`\>

## Call Signature

```ts
function skipWhile<>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;
```

Defined in: [internal/operators/skipWhile.ts:7](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/skipWhile.ts#L7)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | (`value`: `T`, `index`: `number`) => `boolean` |

### Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>
