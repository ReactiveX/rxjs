[API](../../index.md) / [rxjs](../index.md) / EMPTY

# Variable: EMPTY

> A simple Observable that emits no items to the Observer and immediately
> emits a complete notification.

## Description

<span class="informal">Just emits 'complete', and nothing else.</span>

![](/images/marble-diagrams/empty.png)

A simple Observable that only emits the complete notification. It can be used
for composing with other Observables, such as in a [mergeMap](../functions/mergeMap.md).

```ts
const EMPTY: Observable<never>;
```

Defined in: [rxjs/src/internal/observable/empty.ts:65](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/empty.ts#L65)

## Example

Log complete notification

```ts
import { EMPTY } from 'rxjs';

EMPTY.subscribe({
  next: () => console.log('Next'),
  complete: () => console.log('Complete!'),
});

// Outputs
// Complete!
```

Emit the number 7, then complete

```ts
import { EMPTY, startWith } from 'rxjs';

const result = EMPTY.pipe(startWith(7));
result.subscribe((x) => console.log(x));

// Outputs
// 7
```

Map and flatten only odd numbers to the sequence `'a'`, `'b'`, `'c'`

```ts
import { interval, mergeMap, of, EMPTY } from 'rxjs';

const interval$ = interval(1000);
const result = interval$.pipe(mergeMap((x) => (x % 2 === 1 ? of('a', 'b', 'c') : EMPTY)));
result.subscribe((x) => console.log(x));

// Results in the following to the console:
// x is equal to the count on the interval, e.g. (0, 1, 2, 3, ...)
// x will occur every 1000ms
// if x % 2 is equal to 1, print a, b, c (each on its own)
// if x % 2 is not equal to 1, nothing will be output
```

## See

- [Observable](../classes/Observable.md)
- [NEVER](NEVER.md)
- [of](../functions/of.md)
- [throwError](../functions/throwError.md)
