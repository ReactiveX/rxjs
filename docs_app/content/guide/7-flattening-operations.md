# 7. Flattening Operations

## TLDR:

- "Flattening" is unwrapping nested (inner) Observables. (`Observable<Observable<T>> -> Observable<T>`)
- There are four major flattening operations in RxJS:
  - **concat**: [`concatMap`](API), [`concatAll`](API), [`concat`](API), and [`concatWith`](API). Flattening one inner observable at a time, in order, without skipping any.
  - **merge**: [`mergeMap`](API), [`mergeAll`](API), [`merge`](API), and [`mergeWith`](API). Flattening every inner observable, as soon as it can, without skipping any.
  - **switch**: [`switchMap`](API), [`switchAll`](API). Flattening one inner observable at a time, but unsubscribing from it and "switching" to the newest one as soon as it arrives.
  - **exhaust**: [`exhaustMap`](API), [`exhaust`](API). Flattening one inner observable at a time, skipping all other inner observables until the one it is subscribed to is completely exhausted (completed).
- If you're dealing with HTTP, you _probably_ wanted [`concatMap`](API) and not [`switchMap`](API).

## Overview

Since observables are containers that can contain themselves, they can be "unwrapped" or "flattened". This is a concept we touched on earlier in ["what is an operator?"](4-what-is-an-operator.md#Containers). The idea is simple enough, and can be demonstrated visually with an array: `[[1], [2, 3, 4], [5], [6, 7]]`, flattened, would be `[1, 2, 3, 4, 5, 6, 7]`. What we did was "unwrap" all of the inner arrays, and "flatten" their values into a single top level result. We can do the same thing with Observables, only to much greater effect.

## Flattening Observables Manually

In order to flatten an Observable, we must first have an "observable of observables", or in TypeScript `Observable<Observable<T>>`. The flattening process is complicated to do correctly with proper semantics, but if you were to try to do it manually, it might look like this:

```ts
/**
 * An example flatten operator (DO NOT USE)
 */
function flattenAll<T>(source: Observable<Observable<T>>) {
    // We take our Observable<Observable<T>> and return an Observable<T>
    return new Observable<T>(subscriber => {
        const subscription = new Subscription();

        // Subscribe to the "outer" source
        subscription.add(source.subscribe({
            next(innerSource: Observable<T>) {
                // Subscribe to each "inner source" to get their values
                subscription.add(
                    innerSource.subscribe({
                        next(value: T) {
                            // Push the values from the inner source to the consumer
                            subscriber.next(value),
                        }
                        // ??? What to do here? See below
                    })
                )
            },
            // ???? What to od here? See below.
        }));
        return subscription;
    })
}
```

Now the above example is pretty simple, but it's really just to give you the basic idea of how we can flatten an `Observable<Observable<T>>`. There are some issues with it the example above:

1. What happens when the inner subscription has an error?
2. Do inner completion notifications matter?
3. Do we really want to stop pushing values to the producer _just_ because the outer producer has completed? What if the inner producers aren't complete yet? We won't get all of the values!

These are all important matters, and RxJS resolves these questions with a set of guarantees around the primary flattening operations.

## RxJS Flattening Operator Guarantees

- **All errors are forwarded.** Any error on an outer or inner observable will be pushed do the consumer and stop the subscription.
- **Source and inner sources must complete.** RxJS flattening operators will return observables whose [subscriptions](glossary-and-semantics#subscription) will not [complete](glossary-and-semantics#complete) until:

  1. The outer [subscription](glossary-and-semantics#subscription) is [complete](glossary-and-semantics#complete).
  2. All active inner [subscriptions](glossary-and-semantics#subscription) have completed\*.

  (\* there's some slight technical nuance here with the [`switchMap`](API) and [`switchAll`](API) operators.)

## Merge (merge, mergeMap, mergeAll, mergeWith)

Merge is probably the simplest strategy to describe. By default, it will subscribe to every inner observable, as soon as it can, and forward all values from those inner [subscriptions](glossary-and-semantics#subscription) to the [consumer](glossary-and-semantics#consumer).

### When to use

- When you don't care about the order of the values or their arrival, you just want them as soon as possible.
- When you want to kick off [side effects](glossary-and-semantics#side effects) with observables from notifications. Let's say you want to start an animation with every user action, or that sort of thing, and you want to let those animations run to completion.
- Merging, in particular, [`mergeMap`](API), is a useful operator right after a [`groupBy`](API) operator. It allows the developer to compose behaviors with the grouped observable emitted by `groupBy`, and then have them rejoin a single observable to be consumed.

### When NOT to use

- When the order of your values from your inner observables matter.
- HTTP requests where the response matters. (See the previous line item). If your inner observables wrap http requests, then the results of one of those inner subscriptions could arrive after those of a later inner observable. That means that you might end up with out of date data. In particular, you would not want to use this with an HTTP GET. However, if you have an HTTP request that is a pure side effect and you do not care about the response, merge might be a reasonable performance optimization for you.

### Concurrency Limits (Advanced)

Setting a concurrency limit is an advanced feature of some of the merge operators and functions. It allows you to decide how many inner subscriptions to create concurrently, and will queue other inner observables until one of the inner concurrent subscriptions completes, then it will dequeue an inner observable and subscribe to it, pushing its values to the [consumer](glossary-and-semantics#consumer).

Interestingly, [concat](#concat-concat-concatmap-concatall-concatwith) is a "merge" with a concurrency limit of 1.

## Concat (concat, concatMap, concatAll, concatWith)

Concat should be the go-to for most people's flattening needs in general RxJS use. This strategy will subscribe to one and only one inner observable at a time, queuing up any other inner observables that arrive during that inner [subscription](glossary-and-semantics#subscription). When that inner subscription [completes](glossary-and-semantics#completes), the next one is dequeued and subscribed to.

### When to use

- Whenever order matters. If order is so important that you're willing to defer when each inner observable is subscribed to in order to make sure the results do not come back out of order, concat is the right choice.
- Any HTTP request where all requests must be made, and the responses matter. If you're making a series of HTTP requests, and you need to make sure the responses are processed in order, you should use a concat strategy.

### When NOT to use

- Never use a concat strategy with extremely long-lived inner observables, or inner subscriptions that never complete. If it never completes, it cannot concatenate. Imagine another universe where you were trying to concat an array that was _infinitely long_ with any other array. You never get to where you're adding the contents of the second array because you cannot finish reading the first. Observables that never end cannot be concatenated.
- When you have inner subscriptions you want to start right away. If this is the case, you'll probably want to use a [merge](#merge-merge-mergemap-mergeall-mergewith) or even a switch strategy.

## Switching (switchMap, switchAll)

Switching is a strategy that gets a decent amount of hype in RxJS tutorials. This comes from it's implicit cancellation behavior. This strategy will subscribe to one and only one inner observable at a time, but will subscribe to it as soon as it arrives. In order to ensure there is only one active inner subscription, it will unsubscribe from the previous inner subscription when the new one arrives. The switch strategy is the only strategy that will automatically unsubscribe from inner subscription to start the next one.

It's called the "switch" strategy because it "switches" from whatever inner subscription it has to the next one it gets, as soon as it gets it.

### When to use

- Switch is particularly useful when dealing with situations where you want start the next subscription right away, and you do not care about the values of the previous one any more.
- HTTP GETs involved with things like lookahead searches, or user-initiated HTTP GETS. It starts the request right away, and disregards the previous one, as you may not care about it.
- Toggling between different observables. Let's say you had an animation loop and you wanted to turn it on and off, you could toggle between your animation loop observable and an empty observable using a switch strategy.

### When NOT to use

- Never use switchMap when the results that come back from your requests matter.
- Do not use switchMap with HTTP requests where you care about the responses. In particular, HTTP methods like DELETE, PUT, and POST should not be used with a switching strategy if the responses are going to update the view. When in doubt, use the [concat strategy](#concat-concat-concatmap-concatall-concatwith).

## Exhaust (exhaust, exhaustMap)

Probably the least popular choice of our flattening strategies, but not because it's not useful. The exhaust strategy is sort of the "inverse of switching", in that it will still only allow one inner subscription at at time, but it will "exhaust" all values from that inner subscription, waiting for it to [complete](glossary-and-semantics#complete) before allowing another inner observable to be subscribed to. While there's one active inner subscription, all incoming inner subscriptions will be dropped.

### When to use

- This strategy is useful for when you do not want to spam your server with expensive duplicate requests.
- "Submit only once" type behavior, where you have something like an order button, and you don't want to user to click it more than one time and send more than one order. (Yes. yes, "but I can disable the button". If you only want to rely on DOM manipulation to protect you, that's your prerogative.)
- To handle start requests for expensive subscriptions. Maybe starting a single websocket running, or a server instance, that sort of thing.

## Why aren't there more? I need [feature here]!

Well, there are certainly _many_ other ways to flatten an observable. There are common scenarios that are covered by other RxJS operator libraries and we try to keep an eye on those and the requests made in our [GitHub Issues](https://github.com/ReactiveX/rxjs/issues). Someday that feature you're looking for may be added.

---

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://licensebuttons.net/l/by/4.0/80x15.png" /></a>
This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
