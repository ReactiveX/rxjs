[API](../../index.md) / [index](../index.md) / iif

# Function: iif()

```ts
function iif<>(
   condition: () => boolean, 
   trueResult: ObservableInput<T>, 
falseResult: ObservableInput<F>): Observable<T | F>;
```

Defined in: [internal/observable/iif.ts:83](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/iif.ts#L83)

Checks a boolean at subscription time, and chooses between one of two observable sources

`iif` expects a function that returns a boolean (the `condition` function), and two sources,
the `trueResult` and the `falseResult`, and returns an Observable.

At the moment of subscription, the `condition` function is called. If the result is `true`, the
subscription will be to the source passed as the `trueResult`, otherwise, the subscription will be
to the source passed as the `falseResult`.

If you need to check more than two options to choose between more than one observable, have a look at the [defer](defer.md) creation method.

## Examples

Change at runtime which Observable will be subscribed

```ts
import { iif, of } from 'rxjs';

let subscribeToFirst;
const firstOrSecond = iif(
  () => subscribeToFirst,
  of('first'),
  of('second')
);

subscribeToFirst = true;
firstOrSecond.subscribe(value => console.log(value));

// Logs:
// 'first'

subscribeToFirst = false;
firstOrSecond.subscribe(value => console.log(value));

// Logs:
// 'second'
```

Control access to an Observable

```ts
import { iif, of, EMPTY } from 'rxjs';

let accessGranted;
const observableIfYouHaveAccess = iif(
  () => accessGranted,
  of('It seems you have an access...'),
  EMPTY
);

accessGranted = true;
observableIfYouHaveAccess.subscribe({
  next: value => console.log(value),
  complete: () => console.log('The end')
});

// Logs:
// 'It seems you have an access...'
// 'The end'

accessGranted = false;
observableIfYouHaveAccess.subscribe({
  next: value => console.log(value),
  complete: () => console.log('The end')
});

// Logs:
// 'The end'
```

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `condition` | () => `boolean` | Condition which Observable should be chosen. |
| `trueResult` | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`T`\> | An Observable that will be subscribed if condition is true. |
| `falseResult` | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`F`\> | An Observable that will be subscribed if condition is false. |

## Returns

[`Observable`](../classes/Observable.md)\<`T` \| `F`\>

An observable that proxies to `trueResult` or `falseResult`, depending on the result of the `condition` function.

## See

[defer](defer.md)
