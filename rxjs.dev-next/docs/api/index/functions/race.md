[API](../../index.md) / [index](../index.md) / race

# Function: race()

> Returns an observable that mirrors the first source observable to emit an item.

## Description

![](race.png)

`race` returns an observable, that when subscribed to, subscribes to all source observables immediately.
As soon as one of the source observables emits a value, the result unsubscribes from the other sources.
The resulting observable will forward all notifications, including error and completion, from the "winning"
source observable.

If one of the used source observable throws an errors before a first notification
the race operator will also throw an error, no matter if another source observable
could potentially win the race.

`race` can be useful for selecting the response from the fastest network connection for
HTTP or WebSockets. `race` can also be useful for switching observable context based on user
input.

## Example

Subscribes to the observable that was the first to start emitting.

```ts
import { interval, map, race } from 'rxjs';

const obs1 = interval(7000).pipe(map(() => 'slow one'));
const obs2 = interval(3000).pipe(map(() => 'fast one'));
const obs3 = interval(5000).pipe(map(() => 'medium one'));

race(obs1, obs2, obs3)
  .subscribe(winner => console.log(winner));

// Outputs
// a series of 'fast one'
```



## Parameters

### `sources`

Used to race for which `ObservableInput` emits first.

## Returns

`An`

Observable that mirrors the output of the first Observable to emit an item.


## Call Signature

```ts
function race<>(inputs: [...ObservableInputTuple<T>[]]): Observable<T[number]>;
```

Defined in: [internal/observable/race.ts:9](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/race.ts#L9)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `inputs` | \[`...ObservableInputTuple<T>[]`\] |

### Returns

[`Observable`](../classes/Observable.md)\<`T`\[`number`\]\>

## Call Signature

```ts
function race<>(...inputs: [...ObservableInputTuple<T>[]]): Observable<T[number]>;
```

Defined in: [internal/observable/race.ts:10](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/race.ts#L10)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`inputs` | \[`...ObservableInputTuple<T>[]`\] |

### Returns

[`Observable`](../classes/Observable.md)\<`T`\[`number`\]\>
