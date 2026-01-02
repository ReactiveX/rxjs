[API](../../index.md) / [rxjs](../index.md) / zip

# Function: zip()

> Combines multiple Observables to create an Observable whose values are calculated from the values, in order, of each
> of its input Observables.

## Description

If the last parameter is a function, this function is used to compute the created value from the input values.
Otherwise, an array of the input values is returned.

```ts
function zip<>(...sourcesAndResultSelector: [...ObservableInputTuple<A>[], (...values: A) => R]): Observable<R>;
```

Defined in: [rxjs/src/internal/observable/zip.ts:13](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/zip.ts#L13)

Combines multiple Observables to create an Observable whose values are calculated from the values, in order, of each
of its input Observables.

If the last parameter is a function, this function is used to compute the created value from the input values.
Otherwise, an array of the input values is returned.

## Parameters

| Parameter                     | Type                                                          |
| ----------------------------- | ------------------------------------------------------------- |
| ...`sourcesAndResultSelector` | \[`...ObservableInputTuple<A>[]`, (...`values`: `A`) => `R`\] |

## Returns

[`Observable`](../classes/Observable.md)\<`R`\>

## Example

Combine age and name from different sources

```ts
import { of, zip, map } from 'rxjs';

const age$ = of(27, 25, 29);
const name$ = of('Foo', 'Bar', 'Beer');
const isDev$ = of(true, true, false);

zip(age$, name$, isDev$)
  .pipe(map(([age, name, isDev]) => ({ age, name, isDev })))
  .subscribe((x) => console.log(x));

// Outputs
// { age: 27, name: 'Foo', isDev: true }
// { age: 25, name: 'Bar', isDev: true }
// { age: 29, name: 'Beer', isDev: false }
```

## Param

Any number of `ObservableInput`s provided either as an array or as an object
to combine with each other.
