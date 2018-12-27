# Operators

An operator is just a function that takes an Observable as its input and returns another Observable.  For example, there is an operator called `map()`, that is equivalent to the Array method of the same name. Just as `[1, 2, 3].map(x => x * x)` will yield `[1, 4, 9]`, the Observable created like this:

```ts
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

map(x => x * x)(of(1, 2, 3).subscribe((v) => console.log(`value: ${v}`));

// Logs:
// value: 1 
// value: 4
// value: 9 

```

will emit `1`, `4`, `9`.  Another useful operator is `first()`:

```ts
import { of } from 'rxjs';
import { first } from 'rxjs/operators';

first()(of(1, 2, 3).subscribe((v) => console.log(`value: ${v}`));

// Logs:
// value: 1 
```

Note that `map` logically must be constructed on the fly, since it must be built using the mapping function.  Although `first` could be a constant, by convention, it is likewise constructed on the fly.  As a general practice, all operators are constructed, whether they need arguments or not.

In addition to `map()` and `first()`, there are [over one hundred useful operators](/api) included in the library, but some particularly useful ones are

* `filter(f)` — remove any values that fail to pass the test `f()`
* `take(n)` — emit only the first `n` values and then complete
* `delay(n)` — delay the emission of each value by `n` milliseconds

## Piping

Operators are functions, so they *can* be used like ordinary functions: `op()(obs)` — but in practice, there tend to be many of them convolved together, and quickly become unreadable: `op4()(op3()(op2()(op1()(obs))))`. For that reason, Observable have a method called `.pipe()` that accomplishes the same thing while being much easier to read:

```ts
obs.pipe(
  op1(),
  op2(),
  op3(),
  op3(),
)
```

As a stylistic matter, `op()(obs)` is never used, even if there is only one operator; `obs.pipe(op())` is universally preferred.


## Higher-order Observables

Observables most commonly emit ordinary values like strings and numbers, but surprisingly often, it is necessary to handle Observables *of* Observables, so-called higher-order Observables.  For example, imagine you had an Observable emitting strings that were the URLs of files you wanted to see.  The code might look like this:

```ts
const fileObservable = urlObservable.pipe(
   map(url => http.get(url)),
);
```

`http.get()` returns an Observable (of string or string arrays probably) for each individual URL.  Now you have a higher-order Observable.

But how do you work with a higher-order Observable? Typically, by _flattening_: by (somehow) converting a higher-order Observable into an ordinary Observable.  For example:

```ts
const fileObservable = urlObservable.pipe(
   map(url => http.get(url)),
   concatAll(),
);
```

The [`concatAll()`](/api/operators/concatAll) operator subscribes to each "inner" Observable that comes out of the "outer" Observable, and copies all the emitted values until that Observable completes, and goes on to the next one.  All of the values are in that way concatenated.  Other useful higher-order operators are

* [`mergeAll()`](/api/operators/mergeAll) — subscribes to each inner Observable as it arrives, then emits each value as it arrives
* [`switchAll()`](/api/operators/switchAll) — subscribes to the first inner Observable when it arrives, and emits each value as it arrives, but when the next inner Observable arrives, unsubscribes to the previous one, and subscribes to the new one.
* [`exhaust()`](/api/operators/exhaust) — subscribes to the first inner Observable when it arrives, and emits each value as it arrives, discarding all newly arriving inner Observables until that first one completes, then waits for the next inner Observable.

Just as many array library combine [`map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) and [`flat()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat) (or `flatten()`) into a single [`flatMap()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap), there are mapping equivalents of all the RxJS flattening operators [`concatMap()`](/api/operators/concatMap), [`mergeMap()`](/api/operators/mergeMap), [`switchMap()`](/api/operators/switchMap), and [`exhaustMap()`](/api/operators/exhaustMap).


## Creating custom observables

### Use the `pipe()` function to make new operators

If there is a commonly used sequence of operators in your code, use the `pipe()` function to extract the sequence into a new operator. Even if a sequence is not that common, breaking it out into a single operator can improve readability.

For example, you could make a function that discarded odd values and doubled even values like this:

```ts
function discardOddDisableEven() {
  return pipe(
    filter(v => ! (v % 2)),
    map(v => v + v),
  );
}
```

(The `pipe()` function is analogous to, but not the same thing as, the `.pipe()` method on an Observable.)

It is more complicated, but if you have to write an operator that cannot be made from a combination of existing operators (a rare occurrance), you can write an operator from scratch, like this:


```ts
function delay(delayInMillis) {
  return (observable) => new Observable(observer => {
    const allTimerIDs = new Set();
    const subscription = observable.subscribe({
      next(value) {
        const timerID = setTimeout(() => {
          observer.next(value);
          allTimerIDs.delete(timerID);
        }, delayInMillis);
        allTimerIDs.add(timerID);
      },
      error(err) {
        observer.error(err);
      },
      complete() {
        observer.complete();
      }
    });
    return () => {
      subscription.unsubscribe();
      allTimerIDs.forEach(timerID => {
        clearTimeout(timerID);
      });
    }
  });
}
```

Note that you must

1. implement all three Observer functions, `next()`, `error()`, and `complete()` when subscribing to the input Observable.
2. implement a "teardown" function that cleans up when the Observable completes (in this case by unsubscribing and clearing any pending timeouts).
3. return that teardown function from the function passed to the Observable constructor.

Of course, this is only an example; the `delay()` operator [already exists](/api/operators/delay).
