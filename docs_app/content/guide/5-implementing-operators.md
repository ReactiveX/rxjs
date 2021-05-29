# 5. Implementing Operators

## TLDR:

- Create a higher-order function to pass params in.
- Return a `(source: Observable<A>) => Observable<B>` function.
- _Be sure_ to wrap any [consumer](glossary-and-semantics#consumer)-provided functions/callbacks in a `try-catch` block, and push the errors to the [consumer](glossary-and-semantics#consumer) with the subscriber's `error` method.
- All errors should be pushed the the consumer with the subscriber's `error` method.
- Ensure errors and completions are propagated appropriately.
- Ensure any inner subscriptions are appropriately torn down.
- Avoid [common mistakes](#common-mistakes-when-creating-custom-operators).

### Very Basic Map Operator

(do not use this, use [map](API))

We can implement a very simple map operator as seen below. This is done in an overly simplistic way, to highlight the primary traits of an operator. The basic principle is that we have a higher-order function, that takes an argument, in this case a mapping function. That higher-order function returns a operator function that takes a source [`Observable`](API) and returns a new [`Observable`](API). The returned observable, when subscribed to, will in turn subscribe to the source observable, mapping the values it is [pushed](glossary-and-semantics#push) and forwarding them along with all other [notifications](glossary-and-semantics#notification) to the [consumer](glossary-and-semantics#consumer). It is also important that the [teardown](glossary-and-semantics#teardown) in the new observable [unsubscribes](glossary-and-semantics#unsubscribe) from the inner subscription it creates. This is done by returning the subscription (or a function that unsubscribes it) from the initializer.

```ts
function customMap<A, B>(fn: (value: A) => B) {
  // return a function that takes a source observable and returns a new observable!
  return (source: Observable<A>) =>
    new Observable<B>((subscriber) => {
      // The returned observable, upon subscription will subscribe to the source!
      const subscription = source.subscribe({
        // Perform the map transformation and forward the transformed
        // value to the subscriber
        next: (value) => subscriber.next(fn(value)),
        // Make sure to pass through error and complete notifications.
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });

      // Ensure the inner subscription is torn down.
      return subscription;
    });
}
```

And this can be used with `pipe` (more on that later), like so:

```ts
const source$ = of(1, 2, 3);

source$.pipe(customMap((x) => x + x)).subscribe(console.log);
```

The result of the above will be a new observable, that is [subscribed](glossary-and-semantics#subscription) to and emits the values `2`, `4`, and `6` before completing.

### Error Handling In Operators

The above [map example](#very-basic-map-operator) actually has a bug in it. What happens if the [consumer](glossary-and-semantics#consumer) provides a function to our `customMap` that throws an error?

```ts
source$
  .pipe(
    customMap((x) => {
      if (x === 2) {
        throw new Error('I hate twos!');
      }
      return x + x;
    })
  )
  .subscribe({
    next: console.log,
    error: console.error,
  });
```

Now, _ideally_, the error would be sent to the `error` handler which was provided to `subscribe` above. However that's not the case, because the `customMap` operator was poorly implemented. In order to ensure errors are propagated properly, we need to wrap the call to `fn` in a `try-catch` and ensure any errors thrown are pushed to the [consumer](glossary-and-semantics#consumer) via `subscriber.error`.

```ts
function customMap<A, B>(fn: (value: A) => B) {
  return (source: Observable<A>) =>
    new Observable<B>((subscriber) => {
      const subscription = source.subscribe({
        next: (value) => {
          // Make sure we're wrapping that consumer-provided
          // function in a try catch!
          let result: B;
          try {
            result = fn(value);
          } catch (err) {
            // push any errors to the consumer.
            subscriber.error(err);
            return;
          }
          subscriber.next(result);
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });

      return subscription;
    });
}
```

### Common Mistakes When Creating Custom Operators

1. **Creating them at all.** You may have been able to use one or more of RxJS's existing operators. Check the [operator decision tree](LINK) again.
2. **Forgetting to unsubscribe**. If you don't ensure that your inner subscription is torn down, you will create memory leaks. It's important to double check this. Testing your operator with the [`TestScheduler`](API) and [marble tests](LINK) can help you verify inner subscriptions are torn down by using [`expectSubscriptions`](API).
3. **Forgoing error handling**. A minor offense if you know and own ALL of the code that will be using your operator, but if you don't properly handle errors [as seen above](#error-handling-in-operators), the consequences will be inconsistent behavior for [consumers](glossary-and-semantics#consumer) or your operator.

---

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://licensebuttons.net/l/by/4.0/80x15.png" /></a>
This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
