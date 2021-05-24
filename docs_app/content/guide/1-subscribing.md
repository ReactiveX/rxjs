# 1. Subscribing to an Observable

## TLDR:

- Observables don't do anything until you call [subscribe](/api/index/class/Observable#subscribe-)
- Calling [subscribe](/api/index/class/Observable#subscribe-) will synchronously execute code that sets up the subscription, telling the underlying [producer](glossary-and-semantics#producer) to start pushing values to your code (the [consumer](glossary-and-semantics#consumer)).
- [subscribe](API) may be called with _one function_ that is the [next](glossary-and-semantics#next) handler, _OR_ an [`Observer`](API) object, which has a [next](glossary-and-semantics#next), [error](glossary-and-semantics#error), and/or [complete](glossary-and-semantics#complete) handler on it.
- If no [error](glossary-and-semantics#error) handler is provided, RxJS will assume all error notifications are "unhandled"; RxJS will rethrow them on a different call stack.

## Overview

Chances are, the first time you encounter an [Observable](API), it is because you have had one returned to you by some other API. In this case, the most helpful thing for you to know is how to get values from the observable, and the semantics of [subscription](glossary-and-semantics#subscription)

> The first thing to know is, an observable doesn't "do" anything.

An observable is actually _not_ a "stream"; Observables are templates for [subscriptions](glossary-and-semantics#subscription), through which your code (the [consumer](glossary-and-semantics#consumer)), will tell a [producer](glossary-and-semantics#producer) to start pushing values to it by subscribing to an observable, creating a [subscription](glossary-and-semantics#subscription).

## Basic Subscription

```ts
const source$ = getSomeObservable();

source$.subscribe((value) => {
  // do something with each value as it is pushed to your code
  console.log(value);
});
```

The most basic form of subscription is to subscribe to the observable with a single function as the argument to [`subscribe`](API). This will execute the observable's initialization function and create the [subscription](glossary-and-semantics#subscription).

## Subscription With An Observer

```ts
const source$ = getSomeObservable();

source$.subscribe({
  next(value) {
    // Do something with each value as it is pushed to your code
    console.log(value);
  },
  error(err) {
    // Whatever is producing and pushing values has encountered an error
    // and will no longer send values
    console.error(err);
  },
  complete() {
    // The producer pushing values is done pushing values, and wishes to notify
    // your code that you will no longer receive values.
    console.log('done');
  },
});
```

An `Observer` is an interface, basically any object with a `next`, `error`, and `complete` method on it. A "partial observer" is any object with at least one of those methods. Observers are a means of passing three handlers to the subscription so that a [producer](glossary-and-semantics#producer) can notify your code (the [consumer](glossary-and-semantics#consumer)). The `next` handler is called when the producer pushes a value to the consumer. The `error` handler is called when the producer has encountered an error and must stop sending values. The `complete` handler is called when the producer has pushed all values to the consumer and will push no more.

## Unhandled Errors

If you call subscribe with one function ([Basic Subscription](#Basic_Subscription)), or with a partial [observer](#Subscription_With_An_Observer) that does not have an [error](glossary-and-semantics#error) handler, RxJS will treat all errors pushed by the [producer](glossary-and-semantics#producer) as "unhandled". This means that the developer did nothing to handle the error.

All unhandled errors will be rethrown in a different call context. This is done for a variety of reasons, but what is important to know is: Even if your observable is totally synchronous, an error from your observable _cannot be caught_ by wrapping the [`subscribe`](API) call in a `try-catch` block.

### Handled Errors

Simply by providing an [error](glossary-and-semantics#error) callback to your [`subscribe`](API) call, via an [observer](#Subscription_With_An_Observer) (or by the deprecated error callback argument), RxJS will treat errors pushed by the [producer](glossary-and-semantics#producer) has "handled". This means whatever that error handler function does is all the handling that will be provided for that error.

---

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://licensebuttons.net/l/by/4.0/80x15.png" /></a>
This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
