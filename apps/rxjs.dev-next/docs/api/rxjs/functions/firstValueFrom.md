[API](../../index.md) / [rxjs](../index.md) / firstValueFrom

# Function: firstValueFrom()

> Converts an observable to a promise by subscribing to the observable,
> and returning a promise that will resolve as soon as the first value
> arrives from the observable.

## Description

The subscription will then be closed.

If the observable stream completes before any values were emitted, the
returned promise will reject with [EmptyError](../classes/EmptyError.md) or will resolve
with the default value if a default was specified.

If the observable stream emits an error, the returned promise will reject
with that error.

**WARNING**: Only use this with observables you _know_ will emit at least one value,
_OR_ complete. If the source observable does not emit one value or complete, you will
end up with a promise that is hung up, and potentially all of the state of an
async function hanging out in memory. To avoid this situation, look into adding
something like [timeout](timeout.md), [take](take.md), [takeWhile](takeWhile.md), or [takeUntil](takeUntil.md)
amongst others.

```ts
function firstValueFrom<>(source: Observable<T>): Promise<T>;
```

Defined in: [rxjs/src/internal/firstValueFrom.ts:10](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/firstValueFrom.ts#L10)

Converts an observable to a promise by subscribing to the observable,
and returning a promise that will resolve as soon as the first value
arrives from the observable. The subscription will then be closed.

If the observable stream completes before any values were emitted, the
returned promise will reject with [EmptyError](../classes/EmptyError.md) or will resolve
with the default value if a default was specified.

If the observable stream emits an error, the returned promise will reject
with that error.

**WARNING**: Only use this with observables you _know_ will emit at least one value,
_OR_ complete. If the source observable does not emit one value or complete, you will
end up with a promise that is hung up, and potentially all of the state of an
async function hanging out in memory. To avoid this situation, look into adding
something like [timeout](timeout.md), [take](take.md), [takeWhile](takeWhile.md), or [takeUntil](takeUntil.md)
amongst others.

## Parameters

| Parameter | Type                                            |
| --------- | ----------------------------------------------- |
| `source`  | [`Observable`](../classes/Observable.md)\<`T`\> |

## Returns

`Promise`\<`T`\>

## Example

Wait for the first value from a stream and emit it from a promise in
an async function

```ts
import { interval, firstValueFrom } from 'rxjs';

async function execute() {
  const source$ = interval(2000);
  const firstNumber = await firstValueFrom(source$);
  console.log(`The first number is ${firstNumber}`);
}

execute();

// Expected output:
// 'The first number is 0'
```

## See

[lastValueFrom](lastValueFrom.md)

## Param

the observable to convert to a promise

## Param

a configuration object to define the `defaultValue` to use if the source completes without emitting a value
