# Creating custom operators

<div class="alert is-helpful">
  <span>
   Since operators are just functions, all that is required to create a new operator is to create a new function - an operator function.
  </span>
</div>

Operator {@link guide/glossary-and-semantics#operator-function functions} are usually created by operator creating
functions (in short, _{@link guide/glossary-and-semantics#operator operators}_) which in many cases may receive
additional configuration parameters. In RxJS, every operator function is created by an operator creating function. For
example, {@link map} operator needs `project`ion function which `map` internally calls to project emissions. On the
other hand, {@link dematerialize} operator does not need any configuration parameter, thus it does not need to be
created every time, unlike `map`. It could have been written without creation function, so that it is used like this:
`.pipe(dematerialize)` instead of `.pipe(dematerialize())`, but that could be very confusing to the end users because
there aren't many operators that don't require configuration parameters and users wouldn't know what are those.
Basically, `dematerialize()` is an operator - it is an operator creation function that returns an operator function
of the {@link dematerialize} operator.

### Rules that operator functions need to satisfy

Operator functions need to follow certain rules. Those rules are required if you want to reliably create operator chains
by using {@link Observable#pipe Observable.pipe} method. The operator function must:

1. accept the source Observable as the only parameter,
2. return the destination Observable (yielding this signature: `(source: Observable<In>) => Observable<Out>`), usually
   by using `new Observable()` constructor that accepts a function as the first argument (that will be called when
   subscribed to the destination Observable),
3. subscribe to the source Observable inside a function passed to the `Observable` constructor,
4. implement all three Observer functions, `next()`, `error()`, and `complete()` when subscribing to the source
   Observable,
5. implement a "finalization" function that cleans up resources including unsubscribing from the source Observable and
   clearing any pending timeouts, removing registered event listeners, unsubscribing from other inner subscriptions and
   so on,
6. return that finalization function from the function passed to the Observable constructor.

These are the basic requirements which should satisfy most use cases. However, certain operator creation functions may
be provided with other Observables (either by parameters, like {@link buffer}, or by factory functions, like {@link
bufferWhen}). In these cases, the full list of rules that applies can be found {@link guide/core-semantics#operators
here}.

There are two ways to create a custom operator:

- by using the static {@link /api/index/function/pipe pipe()} function which pipes sequences of the existing operators
  (either custom or operators provided by RxJS) to a single operator;
- by creating a new operator from scratch by implementing rules from above.

## Use the `pipe` function to make new operators

If there is a commonly used sequence of operators in your code, use the static {@link /api/index/function/pipe pipe()}
function to extract the sequence into a new operator. Even if a sequence is not that common, breaking it out into a
single operator can improve readability.

For example, you could make a function that discards odd values and doubles even values, like this:

```ts
import { pipe, filter, map, MonoTypeOperatorFunction, of } from 'rxjs';

function discardOddDoubleEven(): MonoTypeOperatorFunction<number> {
  return pipe(
    filter((v) => !(v % 2)),
    map((v) => v + v)
  );
}

// usage
of(1, 2, 3, 4)
  .pipe(discardOddDoubleEven())
  .subscribe((v) => console.log(v));
// Logs:
// 4
// 8
```

The {@link /api/index/function/pipe pipe()} function is analogous to, but not the same thing as the {@link
Observable#pipe .pipe()} method on an Observable.

This way of creating operators is as simple as it gets, and it also makes sure that all the rules from above are
satisfied making use of operators created with {@link /api/index/function/pipe pipe()} function pipeable by using
{@link Observable#pipe Observable.pipe} method.

## Creating new operators from scratch

It is more complicated, but if you have to write an operator that cannot be made from a combination of existing
operators (a rare occurrence), you can write an operator from scratch using the Observable constructor, like this:

```ts
import { Observable, of, MonoTypeOperatorFunction } from 'rxjs';

function delay<T>(delayInMillis: number): MonoTypeOperatorFunction<T> {
  // return a function that has this signature: `(source: Observable<In>) => Observable<Out>`
  return (source: Observable<T>) =>
    // return new Observable()
    new Observable<T>((subscriber) => {
      // pass the callback function that gets called upon subscription
      // this function will be called each time this
      // Observable is subscribed to.
      const allTimerIDs = new Set();
      let hasCompleted = false;
      const subscription = source.subscribe({
        // subscribe to the source observable
        next(value) {
          // Start a timer to delay the next value
          // from being pushed.
          const timerID = setTimeout(() => {
            subscriber.next(value);
            // after we push the value, we need to clean up the timer timerID
            allTimerIDs.delete(timerID);
            // If the source has completed, and there are no more timers running,
            // we can complete the resulting observable.
            if (hasCompleted && allTimerIDs.size === 0) {
              subscriber.complete();
            }
          }, delayInMillis);

          allTimerIDs.add(timerID);
        },
        error(err) {
          // We need to make sure we're propagating our errors through.
          subscriber.error(err);
        },
        complete() {
          hasCompleted = true;
          // If we still have timers running, we don't want to complete yet.
          if (allTimerIDs.size === 0) {
            subscriber.complete();
          }
        },
      });

      // Return the finalization logic. This will be invoked when
      // the result errors, completes, or is unsubscribed.
      return () => {
        subscription.unsubscribe();
        // Clean up our timers.
        for (const timerID of allTimerIDs) {
          clearTimeout(timerID);
        }
      };
    });
}

// Try it out!
of(1, 2, 3).pipe(delay(1000)).subscribe(console.log);
```

Of course, this is only an example; the {@link delay} operator already exists.

## Adding types to operators

To completely round the operator creation, you could add the returning type to the operator creation functions. In the
previous example, `delay` is the operator creation function, or simply the **operator**. It returns an operator
function. There are two operator function types supported by the RxJS library: {@link OperatorFunction} and {@link
MonoTypeOperatorFunction}. They are both generic types.

### `OperatorFunction`

`OperatorFunction` is a function type interface that describes a function that accepts an Observable as the first and
only parameter that emits values described with one type and returns an Observable that emits values described with
another type. The first generic input type indicates data type emitted by the source Observable, while the second
generic input type indicates data type emitted by the destination Observable.

For example, {@link map} operator creation function returns an operator function with type `OperatorFunction<T, R>`.
This means that type `T` that the source Observable emits (`Observable<T>`) _can_ be different to the type `R` that the
destination Observable emits (`Observable<R>`).

<!-- prettier-ignore -->
```ts
import { fromEvent, map } from 'rxjs';

const destinationObs = fromEvent(document, 'click').pipe(
  map<MouseEvent, number>((clickEv) => clickEv.pageX)
);

destinationObs.subscribe((x) => console.log(x));
```

In this example, the source observable (`fromEvent(document, 'click')`) emits {@link
https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent MouseEvent}s (`Observable<MouseEvent>`), while the
destination Observable emits `number`s (`Observable<number>`). Declaring types to the operator creation functions
is usually not mandatory because TypeScript can infer types in many cases.

However, in cases where it can't, like this one (because the source Observable that comes from `fromEvent` is not using
any generic type, the returned Observable from `fromEvent` gets `Observable<unknown>` type), it could be useful to
declare type(s) explicitly.

### `MonoTypeOperatorFunction`

`MonoTypeOperatorFunction` just a shorthand to using `OperatorFunction` where data types emitted by both source and
destination Observables are the same. It means that `MonoTypeOperatorFunction<T>` is the same as
`OperatorFunction<T, T>`.

For example, {@link filter} operator creation function returns an operator function with type
`MonoTypeOperatorFunction<T>`. This means that this operator doesn't change the data type emitted from the source to
destination Observable. And, indeed, it doesn't: `filter` only filters elements based on some condition, but if this
condition is met, `filter` emits the same data type that was used to check the condition.

## Testing operator functions

To round the operator creation section, it could be very useful for users to write unit tests for custom operators.
There's a docs section that covers this, please take a look at it {@link guide/testing/marble-testing here}.
