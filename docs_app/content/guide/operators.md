# RxJS Operators

RxJS is mostly useful for its _operators_, even though the Observable is the foundation. Operators are the essential
pieces that allow complex asynchronous code to be easily composed in a declarative manner.

## What are operators?

Operators are **functions**. There are two kinds of operators:

**Pipeable Operators** are the kind that can be piped to Observables using the syntax
`observableInstance.pipe(operator)` or, more commonly, `observableInstance.pipe(operatorFactory())`. Operator factory
functions include {@link filter} and {@link mergeMap}.

When Pipeable Operators are called, they do not _change_ the existing Observable instance. Instead, they return a _new_
Observable, whose subscription logic is based on the first Observable.

<span class="informal">A Pipeable Operator is a function that takes an Observable as its input and returns another
Observable. It is a pure operation: the previous Observable stays unmodified.</span>

<span class="informal">A Pipeable Operator Factory is a function that can take parameters to set the context and return
a Pipeable Operator. The factory’s arguments belong to the operator’s lexical scope.</span>

A Pipeable Operator is essentially a pure function which takes one Observable as input and generates another Observable
as output. Subscribing to the output Observable will also subscribe to the input Observable.

**Creation Operators** are the other kind of operator, which can be called as standalone functions to create a new
Observable. For example: `of(1, 2, 3)` creates an observable that will emit `1`, `2`, and `3`, one right after another.
Creation operators will be discussed in more detail in a later section.

For example, the operator called {@link map} is analogous to the Array method {@link
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map of the same name}. Just as
`[1, 2, 3].map(x => x * x)` will yield `[1, 4, 9]`, the Observable created like this:

```ts
import { of, map } from 'rxjs';

of(1, 2, 3)
  .pipe(map((x) => x * x))
  .subscribe((v) => console.log(`value: ${v}`));

// Logs:
// value: 1
// value: 4
// value: 9
```

will emit `1`, `4`, `9`.

Another useful operator is {@link first}:

```ts
import { of, first } from 'rxjs';

of(1, 2, 3)
  .pipe(first())
  .subscribe((v) => console.log(`value: ${v}`));

// Logs:
// value: 1
```

Note that `map` logically must be constructed on the fly, since it must be given the mapping function to. By contrast,
`first` could be a constant, but is nonetheless constructed on the fly. As a general practice, all operators are
constructed, whether they need arguments or not.

## Pipeable Operators

Pipeable operators are functions, so they _could_ be used like ordinary functions: `op()(obs)` — but in practice, there
tend to be many of them convolved together, and quickly become unreadable: `op4()(op3()(op2()(op1()(obs))))`. For that
reason, Observables have a method called `.pipe()` that accomplishes the same thing while being much easier to read:

```ts
obs.pipe(op1(), op2(), op3(), op4());
```

As a stylistic matter, `op()(obs)` is never used, even if there is only one operator; `obs.pipe(op())` is universally
preferred.

## Creation Operators

**What are creation operators?** Distinct from pipeable operators, creation operators are functions that can be used to
create an Observable with some common predefined behavior or by joining other Observables.

A typical example of a creation operator would be the `interval` function. It takes a number (not an Observable) as
input argument, and produces an Observable as output:

```ts
import { interval } from 'rxjs';

const observable = interval(1000 /* number of milliseconds */);
```

See the list of all static creation operators {@link #creation-operators-list here}.

## Higher-order Observables

Observables most commonly emit ordinary values like strings and numbers, but surprisingly often, it is necessary to
handle Observables _of_ Observables, so-called higher-order Observables. For example, imagine you had an Observable
emitting strings that were the URLs of files you wanted to see. The code might look like this:

```ts
const fileObservable = urlObservable.pipe(map((url) => http.get(url)));
```

`http.get()` returns an Observable (of string or string arrays probably) for each individual URL. Now you have an
Observable _of_ Observables, a higher-order Observable.

But how do you work with a higher-order Observable? Typically, by _flattening_: by (somehow) converting a higher-order
Observable into an ordinary Observable. For example:

```ts
const fileObservable = urlObservable.pipe(
  map((url) => http.get(url)),
  concatAll()
);
```

The {@link concatAll} operator subscribes to each "inner" Observable that comes out of the "outer" Observable, and
copies all the emitted values until that Observable completes, and goes on to the next one.
All of the values are in that way concatenated. Other useful flattening operators (called
{@link #join-operators join operators}) are:

- {@link mergeAll} — subscribes to each inner Observable as it arrives, then emits each value as it arrives
- {@link switchAll} — subscribes to the first inner Observable when it arrives, and emits each value as it arrives, but
  when the next inner Observable arrives, unsubscribes to the previous one, and subscribes to the new one.
- {@link exhaustAll} — subscribes to the first inner Observable when it arrives, and emits each value as it arrives,
  discarding all newly arriving inner Observables until that first one completes, then waits for the next inner
  Observable.

Just as many array libraries combine {@link
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map map} and {@link
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat flat} (or `flatten()`) into
a single {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap flatMap},
there are mapping equivalents of all the RxJS flattening operators {@link concatMap}, {@link mergeMap},
{@link switchMap}, and {@link exhaustMap}.

## Marble diagrams

To explain how operators work, textual descriptions are often not enough. Many operators are related to time, they may
for instance delay, sample, throttle, or debounce value emissions in different ways. Diagrams are often a better tool
for that. _Marble Diagrams_ are visual representations of how operators work, and include the input Observable(s), the
operator and its parameters, and the output Observable.

<span class="informal">In a marble diagram, time flows to the right, and the diagram describes how values ("marbles")
are emitted on the Observable execution.</span>

Below you can see the anatomy of a marble diagram.

<img src="assets/images/guide/marble-diagram-anatomy.svg">

Throughout this documentation site, we extensively use marble diagrams to explain how operators work. They may be really
useful in other contexts too, like on a whiteboard or even in our unit tests (as ASCII diagrams).

## Categories of operators

There are operators for different purposes, and they may be categorized as: creation, transformation, filtering,
joining, multicasting, error handling, utility, etc. In the following list you will find all the operators organized in
categories.

For a complete overview, see the {@link api Reference} page.

### Static Creation Operators

- {@link /api/ajax/ajax ajax}
- {@link bindCallback}
- {@link bindNodeCallback}
- {@link defer}
- {@link from}
- {@link fromEvent}
- {@link fromEventPattern}
- {@link generate}
- {@link interval}
- {@link of}
- {@link range}
- {@link throwError}
- {@link timer}
- {@link iif}

### Join Creation Operators

These are Observable creation operators that also have join functionality -- emitting values of multiple source
Observables.

- {@link combineLatest}
- {@link concat}
- {@link forkJoin}
- {@link merge}
- {@link partition}
- {@link race}
- {@link zip}

### Transformation Operators

- {@link buffer}
- {@link bufferCount}
- {@link bufferTime}
- {@link bufferToggle}
- {@link bufferWhen}
- {@link concatMap}
- {@link concatMapTo}
- {@link exhaustMap}
- {@link expand}
- {@link groupBy}
- {@link map}
- {@link mapTo}
- {@link mergeMap}
- {@link mergeMapTo}
- {@link mergeScan}
- {@link pairwise}
- {@link partition}
- {@link scan}
- {@link switchScan}
- {@link switchMap}
- {@link switchMapTo}
- {@link window}
- {@link windowCount}
- {@link windowTime}
- {@link windowToggle}
- {@link windowWhen}

### Filtering Operators

- {@link audit}
- {@link auditTime}
- {@link debounce}
- {@link debounceTime}
- {@link distinct}
- {@link distinctUntilChanged}
- {@link distinctUntilKeyChanged}
- {@link elementAt}
- {@link filter}
- {@link first}
- {@link ignoreElements}
- {@link last}
- {@link sample}
- {@link sampleTime}
- {@link single}
- {@link skip}
- {@link skipLast}
- {@link skipUntil}
- {@link skipWhile}
- {@link take}
- {@link takeLast}
- {@link takeUntil}
- {@link takeWhile}
- {@link throttle}
- {@link throttleTime}

### Join Operators

Also see the {@link #join-creation-operators Join Creation Operators} section above.

- {@link combineLatestAll}
- {@link concatAll}
- {@link exhaustAll}
- {@link mergeAll}
- {@link switchAll}
- {@link startWith}
- {@link withLatestFrom}

### Multicasting Operators

- {@link share}

### Error Handling Operators

- {@link catchError}
- {@link retry}
- {@link retryWhen}

### Utility Operators

- {@link tap}
- {@link delay}
- {@link delayWhen}
- {@link dematerialize}
- {@link materialize}
- {@link observeOn}
- {@link subscribeOn}
- {@link timeInterval}
- {@link timestamp}
- {@link timeout}
- {@link timeoutWith}
- {@link toArray}

### Conditional and Boolean Operators

- {@link defaultIfEmpty}
- {@link every}
- {@link find}
- {@link findIndex}
- {@link isEmpty}

### Mathematical and Aggregate Operators

- {@link count}
- {@link max}
- {@link min}
- {@link reduce}

## Creating custom operators

### Use the `pipe()` function to make new operators

If there is a commonly used sequence of operators in your code, use the `pipe()` function to extract the sequence into a new operator. Even if a sequence is not that common, breaking it out into a single operator can improve readability.

For example, you could make a function that discarded odd values and doubled even values like this:

```ts
import { pipe, filter, map } from 'rxjs';

function discardOddDoubleEven() {
  return pipe(
    filter((v) => !(v % 2)),
    map((v) => v + v)
  );
}
```

(The `pipe()` function is analogous to, but not the same thing as, the `.pipe()` method on an Observable.)

### Creating new operators from scratch

It is more complicated, but if you have to write an operator that cannot be made from a combination of existing operators (a rare occurrence), you can write an operator from scratch using the Observable constructor, like this:

```ts
import { Observable, of } from 'rxjs';

function delay<T>(delayInMillis: number) {
  return (observable: Observable<T>) =>
    new Observable<T>((subscriber) => {
      // this function will be called each time this
      // Observable is subscribed to.
      const allTimerIDs = new Set();
      let hasCompleted = false;
      const subscription = observable.subscribe({
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

Note that you must

1. implement all three Observer functions, `next()`, `error()`, and `complete()` when subscribing to the input Observable.
2. implement a "finalization" function that cleans up when the Observable completes (in this case by unsubscribing and clearing any pending timeouts).
3. return that finalization function from the function passed to the Observable constructor.

Of course, this is only an example; the {@link delay} operator already exists.
