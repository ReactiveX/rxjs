# 3. Creating An Observable

## TLDR:

- You should probably use a provided [creation function](API).
- Create an observable with the `new Observable` [constructor](API).
- The constructor wraps an initialization function that will be executed synchronously every time you call [`subscribe`](API).
- The initialization function gives you a [`Subscriber`](API) instance to push [notifications](glossary-and-semantics#notification) to [consumers](glossary-and-semantics#consumer).
- The initialization function is expected to return [teardown](glossary-and-semantics#teardown) logic, which is either a `() => void`, [`Subscription`](API), or `void` (if there is no teardown to be done).
- When `complete` or `error` are called on the [`Subscriber`] provided by the initialization function, it will execute the provided [teardown](glossary-and-semantics#`Subscriber`] provided by the initialization function, it will execute the provided [teardown) as soon as possible.

## Overview

Besides consuming observables, another thing you'll likely need to do is create new observables. Creating an observable is relatively straight forward, as it is effectively wrapping a function to be executed later with some guarantees. But more importantly, RxJS provides a host of observable [creation functions](API) that create observables for you in tested ways.

## Creation Functions

A creation function, in RxJS terms, is simply a standalone function provided by RxJS that takes some arguments and returns an [`Observable`](API). There are many examples of these creation functions, but the most common are:

- [`of`](API)
- [`from`](API)
- [`concat`](API)
- [`merge`](API)
- [`combineLatest`](API)
- [`forkJoin`](API)
- [`interval`](API)
- [`timer`](API)
- [`defer`](API)
- [`bindCallback`](API)
- et al...

It is highly recommended that you try to use these functions to create your observable. They are well tested, and used in a huge number of projects, and can generally be composed to create most observables you need.

## Observable Construction

Sometimes, however, RxJS does not offer exactly the creation function you're looking for. Perhaps you need to wrap some other API to create an observable, or there's some bit of nuance to the RxJS implementation you don't like. In that case, you can do what RxJS does with the creation functions under the hood, and use the `Observable` [constructor](API) directly.

### Common Case

In the most common case, you'll be wrapping types that asynchronously deliver data. Here's how the observable constructor is used, in a basic case with a contrived type called `SomeDataService`:

```ts
const source$ = new Observable((subscriber) => {
  // Set up you producer (if you need to) here
  const dataService = new SomeDataService();

  // Tie your subscriber to your producer here
  dataService.ondata = (data) => {
    // Push N values to your consumer with `subscriber.next`
    subscriber.next(data);
  };

  dataService.onerror = (err) => {
    // if you have an error, notify the consumer with `subscriber.error`
    subscriber.error(err);
  };

  dataService.onclose = () => {
    // If the producer is done pushing values, notify the consumer
    // with `subscriber.complete`
    subscriber.complete();
  };

  return () => {
    // Teardown logic goes here
    dataService.destroy();
  };
});
```

### Synchronous "firehoses"

Generally, it is recommended that you create observables that are asynchronous. However, sometimes it is necessary to create an observable that may need to deliver messages synchronously. Generally, there is no difference in how you would use the `Observable` [constructor](API), with the exception of what we call a "synchronous firehose".

A "synchronous firehose" is a data producer that will synchronously provide a very large number of values very quickly. In this case, you'll need to make sure you're able to stop whatever is consuming this "firehose" as soon as it is no longer necessary to push values.

This is tricky to explain. If an observable can deliver messages synchronously when you call [`subscribe`](API), and it delivers this "firehose", how could a [consumer](glossary-and-semantics#consumer) [unsubscribe](glossary-and-semantics#unsubscribe) from it? You don't get the [`Subscription`](API) object until [`subscribe`](API) returns! Well, the answer is operators like [`take`](API), [`takeWhile`](API), [`takeUntil`](API), and [`first`](API). We haven't started discussing operators quite yet, but they're important to consider when constructing a "synchronous firehose" type observable, because they can cause unsubscription during notification.

Let's take a look at the most basic "synchronous firehose":

```ts
// BAD: this is going to lock your thread on subscribe!
const firehose$ = new Observable((subscriber) => {
  let n = 0;
  while (true) {
    subscriber.notify(n++);
  }
});

firehose$
  .pipe(
    // We only wanted (and will only get) 10 values!
    take(10)
  )
  .subscribe(console.log); // Doom here.
```

The code above will indeed only log 10 values, but it will still lock your thread. So what gives? The answer may seem obvious: There's nothing to stop that `while` loop in the event that the `subscriber` can no longer push values to the [consumer](glossary-and-semantics#consumer).

#### Subscriber closed

Synchronously, when a subscriber has called `complete` or `error`, or when a consumer has [unsubscribed](glossary-and-semantics#unsubscribed), there is a flag property on [`Subscriber`](API) called [`closed`](API) that will be flipped to `true`. This is useful for checking whether to continue things like synchronous loops. (NOTE: That you do _NOT_ have to check `closed` every time before calling `next`, `error`, or `complete`, RxJS does an internal check there for you).

```ts
// BAD: this is going to lock your thread on subscribe!
const firehose$ = new Observable((subscriber) => {
  let n = 0;
  // This check will prevent this loop from running forever
  // as long as there is a `take`, etc.
  while (!subscriber.closed) {
    subscriber.notify(n++);
  }
});

firehose$
  .pipe(
    // We only wanted (and will only get) 10 values!
    take(10)
  )
  .subscribe(console.log); // Much better.
```

### Dealing With Inner Subscriptions

Quite often, when creating operators, or sometimes when creating functions that return observables, you'll find that you need to subscribe to other "inner" observables in the initialization function of the observable you're creating. These inner observables should be properly chained.

It's always okay to return a teardown function that calls `unsubscribe` on the inner subscription, but there are other useful methods of chaining subscriptions that RxJS provides.

#### Returning Subscription From Initialization

For helpful ergonomics, if you return a [`Subscription`](API) object as [teardown](glossary-and-semantics#teardown) from your initialization function, RxJS will handle that appropriately. There is no need to wrap an RxJS [`Subscription`](API) in a `() => void` function. All functions and subscriptions returned from the initialization function are technically added to the `subscriber` as a subscription.

This is often how [operators](glossary-and-semantics#operators) are created, which we will get to in a bit.

```ts
const originalSource$ = interval(1000);

const mySource$ = new Observable((subscriber) => {
  const subscription = originalSource$.subscribe({
    next: (value) => subscriber.next(value + value),
    error: (err) => subscriber.error(err),
    complete: () => subscriber.complete(),
  });

  return subscription;
});
```

#### Adding Inner Subscriptions To The Subscriber

Subscribers are both "safe" observers, providing guarantees mentioned above, as well as Subscriptions themselves. This means that subscribers have `add`, `remove`, and `unsubscribe` methods. We discuss this in a little more detail in [Advanced Subscription Management](LINK) later on. But, in short, the `add` and `remove` allow you to add and remove "child subscriptions" to a parent. Child subscriptions are automatically unsubscribed when the parent is unsubscribed. If a child subscription is unsubscribed undependently from the parent, it is removed from the parent automatically to free up memory.

```ts
const mySource$ = new Observable((subscriber) => {
  // This inner subscription to `originalSource$` will
  // be unsubscribed during teardown.
  subscriber.add(
    originalSource$.subscribe({
      next: (value) => subscriber.next(value + value),
      error: (err) => subscriber.error(err),
      complete: () => subscriber.complete(),
    })
  );

  subscriber.add(() => {
    // this will be called during teardown
  });

  return () => {
    // This is also technically added to
    // the subscriber with `subscriber.add`
    // immediately after being returned.
  };
});
```

---

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://licensebuttons.net/l/by/4.0/80x15.png" /></a>
This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
