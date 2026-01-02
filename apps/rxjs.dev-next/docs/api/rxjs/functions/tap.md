[API](../../index.md) / [rxjs](../index.md) / tap

# Function: tap()

```ts
function tap<>(observerOrNext?:
  | Partial<TapObserver<T>>
  | (value: T) => void
| null): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/tap.ts:156](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/tap.ts#L156)

Used to perform side-effects for notifications from the source observable

<span class="informal">Used when you want to affect outside state with a notification without altering the notification</span>

![](/images/marble-diagrams/tap.png)

Tap is designed to allow the developer a designated place to perform side effects. While you _could_ perform side-effects
inside of a `map` or a `mergeMap`, that would make their mapping functions impure, which isn't always a big deal, but will
make it so you can't do things like memoize those functions. The `tap` operator is designed solely for such side-effects to
help you remove side-effects from other operations.

For any notification, next, error, or complete, `tap` will call the appropriate callback you have provided to it, via a function
reference, or a partial observer, then pass that notification down the stream.

The observable returned by `tap` is an exact mirror of the source, with one exception: Any error that occurs -- synchronously -- in a handler
provided to `tap` will be emitted as an error from the returned observable.

> Be careful! You can mutate objects as they pass through the `tap` operator's handlers.

The most common use of `tap` is actually for debugging. You can place a `tap(console.log)` anywhere
in your observable `pipe`, log out the notifications as they are emitted by the source returned by the previous
operation.

## Parameters

| Parameter         | Type                                                                                                       | Description                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `observerOrNext?` | \| `Partial`\<[`TapObserver`](../interfaces/TapObserver.md)\<`T`\>\> \| (`value`: `T`) => `void` \| `null` | A next handler or partial observer |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable identical to the source, but
runs the specified Observer or callback(s) for each item.

## Example

Check a random number before it is handled. Below is an observable that will use a random number between 0 and 1,
and emit `'big'` or `'small'` depending on the size of that number. But we wanted to log what the original number
was, so we have added a `tap(console.log)`.

```ts
import { of, tap, map } from 'rxjs';

of(Math.random())
  .pipe(
    tap(console.log),
    map((n) => (n > 0.5 ? 'big' : 'small'))
  )
  .subscribe(console.log);
```

Using `tap` to analyze a value and force an error. Below is an observable where in our system we only
want to emit numbers 3 or less we get from another source. We can force our observable to error
using `tap`.

```ts
import { of, tap } from 'rxjs';

const source = of(1, 2, 3, 4, 5);

source
  .pipe(
    tap((n) => {
      if (n > 3) {
        throw new TypeError(`Value ${n} is greater than 3`);
      }
    })
  )
  .subscribe({ next: console.log, error: (err) => console.log(err.message) });
```

We want to know when an observable completes before moving on to the next observable. The system
below will emit a random series of `'X'` characters from 3 different observables in sequence. The
only way we know when one observable completes and moves to the next one, in this case, is because
we have added a `tap` with the side effect of logging to console.

```ts
import { of, concatMap, interval, take, map, tap } from 'rxjs';

of(1, 2, 3)
  .pipe(
    concatMap((n) =>
      interval(1000).pipe(
        take(Math.round(Math.random() * 10)),
        map(() => 'X'),
        tap({ complete: () => console.log(`Done with ${n}`) })
      )
    )
  )
  .subscribe(console.log);
```

## See

- [finalize](finalize.md)
- [TapObserver](../interfaces/TapObserver.md)
