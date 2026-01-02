[API](../../index.md) / [rxjs](../index.md) / lastValueFrom

# Function: lastValueFrom()

> Converts an observable to a promise by subscribing to the observable,
> waiting for it to complete, and resolving the returned promise with the
> last value from the observed stream.

## Description

If the observable stream completes before any values were emitted, the
returned promise will reject with [EmptyError](../classes/EmptyError.md) or will resolve
with the default value if a default was specified.

If the observable stream emits an error, the returned promise will reject
with that error.

**WARNING**: Only use this with observables you _know_ will complete. If the source
observable does not complete, you will end up with a promise that is hung up, and
potentially all of the state of an async function hanging out in memory. To avoid
this situation, look into adding something like [timeout](timeout.md), [take](take.md),
[takeWhile](takeWhile.md), or [takeUntil](takeUntil.md) amongst others.

```ts
function lastValueFrom<>(source: Observable<T>): Promise<T>;
```

Defined in: [rxjs/src/internal/lastValueFrom.ts:9](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/lastValueFrom.ts#L9)

Converts an observable to a promise by subscribing to the observable,
waiting for it to complete, and resolving the returned promise with the
last value from the observed stream.

If the observable stream completes before any values were emitted, the
returned promise will reject with [EmptyError](../classes/EmptyError.md) or will resolve
with the default value if a default was specified.

If the observable stream emits an error, the returned promise will reject
with that error.

**WARNING**: Only use this with observables you _know_ will complete. If the source
observable does not complete, you will end up with a promise that is hung up, and
potentially all of the state of an async function hanging out in memory. To avoid
this situation, look into adding something like [timeout](timeout.md), [take](take.md),
[takeWhile](takeWhile.md), or [takeUntil](takeUntil.md) amongst others.

## Parameters

| Parameter | Type                                            |
| --------- | ----------------------------------------------- |
| `source`  | [`Observable`](../classes/Observable.md)\<`T`\> |

## Returns

`Promise`\<`T`\>

## Example

Wait for the last value from a stream and emit it from a promise in
an async function

```ts
import { interval, take, lastValueFrom } from 'rxjs';

async function execute() {
  const source$ = interval(2000).pipe(take(10));
  const finalNumber = await lastValueFrom(source$);
  console.log(`The final number is ${finalNumber}`);
}

execute();

// Expected output:
// 'The final number is 9'
```

## See

[firstValueFrom](firstValueFrom.md)

## Param

the observable to convert to a promise

## Param

a configuration object to define the `defaultValue` to use if the source completes without emitting a value
