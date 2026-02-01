[API](../../index.md) / [index](../index.md) / zip

# Function: zip()

> Combines multiple Observables to create an Observable whose values are calculated from the values, in order, of each
> of its input Observables.

## Description

If the last parameter is a function, this function is used to compute the created value from the input values.
Otherwise, an array of the input values is returned.

## Example

Combine age and name from different sources

```ts
import { of, zip, map } from 'rxjs';

const age$ = of(27, 25, 29);
const name$ = of('Foo', 'Bar', 'Beer');
const isDev$ = of(true, true, false);

zip(age$, name$, isDev$).pipe(
  map(([age, name, isDev]) => ({ age, name, isDev }))
)
.subscribe(x => console.log(x));

// Outputs
// { age: 27, name: 'Foo', isDev: true }
// { age: 25, name: 'Bar', isDev: true }
// { age: 29, name: 'Beer', isDev: false }
```


to combine with each other.

## Parameters

### `args`

Any number of `ObservableInput`s provided either as an array or as an object

## Returns

`An`

Observable of array values of the values emitted at the same index from each individual .


## Call Signature

```ts
function zip<>(sources: [...ObservableInputTuple<A>[]]): Observable<A>;
```

Defined in: [internal/observable/zip.ts:9](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/zip.ts#L9)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `sources` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`Observable`](../classes/Observable.md)\<`A`\>

## Call Signature

```ts
function zip<>(sources: [...ObservableInputTuple<A>[]], resultSelector: (...values: A) => R): Observable<R>;
```

Defined in: [internal/observable/zip.ts:10](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/zip.ts#L10)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `sources` | \[`...ObservableInputTuple<A>[]`\] |
| `resultSelector` | (...`values`: `A`) => `R` |

### Returns

[`Observable`](../classes/Observable.md)\<`R`\>

## Call Signature

```ts
function zip<>(...sources: [...ObservableInputTuple<A>[]]): Observable<A>;
```

Defined in: [internal/observable/zip.ts:14](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/zip.ts#L14)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sources` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`Observable`](../classes/Observable.md)\<`A`\>

## Call Signature

```ts
function zip<>(...sourcesAndResultSelector: [...ObservableInputTuple<A>[], (...values: A) => R]): Observable<R>;
```

Defined in: [internal/observable/zip.ts:15](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/zip.ts#L15)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sourcesAndResultSelector` | \[`...ObservableInputTuple<A>[]`, (...`values`: `A`) => `R`\] |

### Returns

[`Observable`](../classes/Observable.md)\<`R`\>
