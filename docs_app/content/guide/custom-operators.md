# Creating Custom Operators

## Use the `pipe()` function to make new operators

If there is a commonly used sequence of operators in your code, use the `pipe()` function to extract the sequence into a new operator. Even if a sequence is not that common, breaking it out into a single operator can improve readability.

For example, you could make a function that discarded odd values and doubled even values like this:

```ts
import { pipe } from "rxjs";
import { filter, map } from "rxjs/operators";

function discardOddDoubleEven() {
  return pipe(
    filter(v => !(v % 2)),
    map(v => v + v)
  );
}
```

<div class="alert is-helpful">
  <span>The `pipe()` function is analogous to, but not the same thing as, the `.pipe()` method on an Observable.</span>
</div>

## Creating new operators from scratch

It is more complicated, but if you have to write an operator that cannot be made from a combination of existing operators (a rare occurrance), you can write an operator from scratch using the Observable constructor, like this:

```ts
import { Observable } from "rxjs";

function delay(delayInMillis) {
  return source =>
    new Observable(observer => {
      // this function will called each time this
      // Observable is subscribed to.
      const allTimerIDs = new Set();
      const subscription = source.subscribe({
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
      // the return value is the teardown function,
      // which will be invoked when the new
      // Observable is unsubscribed from.
      return () => {
        subscription.unsubscribe();
        allTimerIDs.forEach(timerID => {
          clearTimeout(timerID);
        });
      };
    });
}
```

Note that you must

1. implement all three Observer functions, `next()`, `error()`, and `complete()` when subscribing to the input Observable.
2. implement a "teardown" function that cleans up when the Observable completes (in this case by unsubscribing and clearing any pending timeouts).
3. return that teardown function from the function passed to the Observable constructor.

This is only an example, demonstrating how to implement an Operator from scratch. The [`delay()` operator](/api/operators/delay) already exists.
