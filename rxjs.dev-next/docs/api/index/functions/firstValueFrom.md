[API](../../index.md) / [index](../index.md) / firstValueFrom

# Function: firstValueFrom()

> Converts an observable to a promise by subscribing to the observable,
> and returning a promise that will resolve as soon as the first value
> arrives from the observable. The subscription will then be closed.

## Description

If the observable stream completes before any values were emitted, the
returned promise will reject with [EmptyError](../variables/EmptyError.md) or will resolve
with the default value if a default was specified.

If the observable stream emits an error, the returned promise will reject
with that error.

**WARNING**: Only use this with observables you *know* will emit at least one value,
*OR* complete. If the source observable does not emit one value or complete, you will
end up with a promise that is hung up, and potentially all of the state of an
async function hanging out in memory. To avoid this situation, look into adding
something like [timeout](timeout.md), [take](take.md), [takeWhile](takeWhile.md), or [takeUntil](takeUntil.md)
amongst others.

## Example

Wait for the first value from a stream and emit it from a promise in
an async function

```ts
import { interval, firstValueFrom } from 'rxjs';

async function execute() {
  const source$ = interval(2000);
  const firstNumber = await firstValueFrom(source$);
  console.log(`The first number is ${ firstNumber }`);
}

execute();

// Expected output:
// 'The first number is 0'
```

## See

[lastValueFrom](lastValueFrom.md)





## Parameters

### `source`

the observable to convert to a promise

### `config`

a configuration object to define the `defaultValue` to use if the source completes without emitting a value

## Call Signature

```ts
function firstValueFrom<>(source: Observable<T>, config: FirstValueFromConfig<D>): Promise<T | D>;
```

Defined in: [internal/firstValueFrom.ts:9](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/firstValueFrom.ts#L9)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | [`Observable`](../classes/Observable.md)\<`T`\> |
| `config` | `FirstValueFromConfig`\<`D`\> |

### Returns

`Promise`\<`T` \| `D`\>

## Call Signature

```ts
function firstValueFrom<>(source: Observable<T>): Promise<T>;
```

Defined in: [internal/firstValueFrom.ts:10](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/firstValueFrom.ts#L10)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | [`Observable`](../classes/Observable.md)\<`T`\> |

### Returns

`Promise`\<`T`\>
