[API](../../index.md) / [rxjs](../index.md) / from

# Function: from()

```ts
function from<>(input: O): Observable<ObservedValueOf<O>>;
```

Defined in: [observable/src/observable.ts:1106](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L1106)

Creates an Observable from an Array, an array-like object, a Promise, an iterable object, or an Observable-like object.

<span class="informal">Converts almost anything to an Observable.</span>

![](/images/marble-diagrams/from.png)

`from` converts various other objects and data types into Observables. It also converts a Promise, an array-like, or an
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable" target="_blank">iterable</a>
object into an Observable that emits the items in that promise, array, or iterable. A String, in this context, is treated
as an array of characters. Observable-like objects (contains a function named with the ES2015 Symbol for Observable) can also be
converted through this operator.

## Parameters

| Parameter | Type | Description                                                                                                                           |
| --------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `input`   | `O`  | A subscription object, a Promise, an Observable-like, an Array, an iterable, async iterable, or an array-like object to be converted. |

## Returns

[`Observable`](../classes/Observable.md)\<`ObservedValueOf`\<`O`\>\>

## Example

Converts an array to an Observable

```ts
import { from } from 'rxjs';

const array = [10, 20, 30];
const result = from(array);

result.subscribe((x) => console.log(x));

// Logs:
// 10
// 20
// 30
```

Convert an infinite iterable (from a generator) to an Observable

```ts
import { from, take } from 'rxjs';

function* generateDoubles(seed) {
  let i = seed;
  while (true) {
    yield i;
    i = 2 * i; // double it
  }
}

const iterator = generateDoubles(3);
const result = from(iterator).pipe(take(10));

result.subscribe((x) => console.log(x));

// Logs:
// 3
// 6
// 12
// 24
// 48
// 96
// 192
// 384
// 768
// 1536
```

## See

- [fromEvent](fromEvent.md)
- [fromEventPattern](fromEventPattern.md)
- [scheduled](scheduled.md)
