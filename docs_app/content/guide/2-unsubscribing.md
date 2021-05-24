# 2. Unsubscribing

## TLDR:

- Calls to [`subscribe`](API) return a [`Subscription`](API) object.
- Calling [`unsubscribe`](API) on the [`Subscription`](API) object notifies the [producer](glossary-and-semantics#producer) to stop sending values, and triggers the [teardown](glossary-and-semantics#teardown) of any underlying resources the [producer](glossary-and-semantics#producer) has registered for teardown.
- Failure to [unsubscribe](glossary-and-semantics#unsubscribe) from asynchronous observables will result in unnecessary resource use, and even memory leaks.
- Any errors that occur during teardown will be collected and rethrown as an [`UnsubscriptoinError`](API).

## Overview

Just as you need to know how to start getting values from your observable, you must also need to know how to tell the [producer](glossary-and-semantics#producer) to stop sending values, and perhaps more importantly, to [teardown](glossary-and-semantics#teardown) and free up resources.

## Subscriptions

All calls to [`subscribe`](API) return a [`Subscription`](API) object. In order to end your [subscription](glossary-and-semantics#subscription) and tell the [producer](glossary-and-semantics#producer) to stop sending values and [teardown](API), you must call [`unsubscribe`](API).

When [`unsubscribe`](API) is called, it will synchronously trigger the [teardown](glossary-and-semantics#teardown) of the entire [stream](glossary-and-semantics#stream) and all underlying [producers](glossary-and-semantics#producer) from [cold](glossary-and-semantics#cold) sources. This means from that exact moment on, no values can be [nexted](glossary-and-semantics#next), and you cannot be [notified](glossary-and-semantics#notification) of any errors or completions.

By the time the [`unsubscribe`](API) call returns, an attempt to [teardown](glossary-and-semantics#teardown) has completed.

## Unsubscription Errors

On rare occasions, logic executed to [teardown](glossary-and-semantics#teardown) a [subscription](glossary-and-semantics#subscription) can throw an error. These thrown errors, if they occur synchronously during teardown, will be collected and reported at the end of the [`unsubscribe`](API) call. Since [subscriptions](glossary-and-semantics#subscription) are [chained](glossary-and-semantics#chaining), RxJS will attempt to execute all teardowns in the chain and free up as many resources as it can before it reports the error. The error will be synchronously thrown at the end of the [`unsubscribe`](API) call as an [`UnsubscriptionError`](API), and can be caught by wrapping the [`unsubscribe`](API) call in a `try-catch`.

```ts
const subscription = source$.subscribe(console.log);

try {
  subscription.unsubscribe();
} catch (unsubError) {
  // Any error in here will be an UnsubscriptionError, unless you
  // have other calls nested in your try { } block.
  console.error(`Unsubscription encountered ${unsubError.errors.length} errors`);
  for (const error of unsubError.errors) {
    console.error(error);
  }
}
```

## Do You Always Need To Unsubscribe?

Well, no... but **WHEN IN DOUBT, UNSUBSCRIBE**. Unsubscription is important because it helps RxJS provide deterministic resource management for your application. However, it is worth noting that while unsubscription will teardown underlying resources, errors and completions will _also_ teardown underlying resources in the same manner. So, to some degree, a completion is as good as an unsubscription in many cases.

### NO NEED to unsubscribe:

- **Subscriptions that should stay active for the life of your server/web document**. If it needs to stay up for as long as the host environment is open, then there is no need to tear it down. **HOWEVER**. If you have a web application that can be mounted and unmounted, you will want to unsubscribe from all subscriptions owned by that web application. Otherwise, when unmounting the app it will leave it subscriptions active and hang onto resources.
- **Subscriptions that you know will complete that are delivering a value you always want to get**. For example, if you're loading some expensive to calculate data that you know you're going to use eventually, and you don't want to get it twice, you might choose to allow an observable to run to completion, even if the original consuming code no longer cares about the value.
- **Synchronous observables**. By the time you get the `Subscription` back from a synchronous observable, it is already `complete`, and it has already torn down any underlying resources. There is no need to keep the `Subscription` in memory or unsubscribe from it later (It won't hurt much if you do, but it's unnecessary). Examples of these are things like the result of [`of`](API), [`from`](API), [`range`](API), et al.

### MUST unsubscribe:

- **Never-ending subscriptions**. If you do not unsubscribe from these, they will continue forever and consume memory and computing resources. Examples of this could be a web socket stream, or a simple interval. You don't need your app ticking along processing repetitive tasks it no longer cares about and consuming precious time on that single thread.
- **Long-running, expensive subscriptions**. Subscriptions whose actions or side effects are expensive or no longer necessary must be unsubscribed when no longer in use. This, again, is to free up processing capacity and memory. Large streaming results from HTTP or web sockets, even if you've engineered them to complete after some time, must be torn down when you no longer are interested in their results. This is done to prevent memory leaks and free up resources.
- **Subscriptions that register event handlers**. Subscriptions that register objects or functions (particularly functions with closures) with external event emitters and event targets must be torn down. Such things are a common cause of memory leaks, and functions registered and event handlers that close over other variables and objects (such as a component reference via `this`) can cause large things to be retained in memory indefinitely.

### SHOULD unsubscribe:

- **Single-value subscriptions you know will complete quickly**. Examples of this would be something like a quick HTTP GET or POST. It's not going to be the end of the world if you don't unsubscribe here. You're effectively opting for the same poor behavior you'd have gotten from a promise-based HTTP library in that case, as they do not have cancellation. However, this generally amounts to lazy programming, so it should still be avoided if possible.

## What About takeUntil and "Parent Subscriptions", etc?

We will cover that in [Advanced Subscription Management](LINK) later in the guide.

---

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://licensebuttons.net/l/by/4.0/80x15.png" /></a>
This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
