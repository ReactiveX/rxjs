# Why Observables?

## You Probably Want Cancellation

Before you pull the RxJS rip-cord and jump back into promises, you should know that not only can observables be used _exactly like_ promises, they also provide a means of cancelling underlying data production and tearing down resources.

Plain and simple, promises _cannot_ be cancelled. You can force rejection on them, through complicated composition, but you cannot notify a promise that you are no longer interested in it's value and have it stop using resources in your system.

For example: If you have a promise-based HTTP API, used in a trivial way, even with `fetch`'s [`AbortSignal`](MDN), at best, there is code that will execute and errors that will need to be handled. At worst (and this is currently the common case), a response will come back from the server, take up your thread to process the request, maybe even parse the JSON, only to hit some code where it checks a boolean flag you've set to tell it you no longer care about the work it has done.

If your HTTP implementation is observable based, when you cancel, it will abort the underlying HTTP request, the browser will not handle the response, and all code related to it ceases to run. There's no special "abort error" to handle, etc. (Unless you've chose to subscribe to your observable using a [promise interop](LINK_TO_PROMISE_INTEROP_SECTION) API).

## A Uniform Interface For Anything On The Web

An observable can be `0` to `Infinity` values, immediately, or over any amount of time. It can embody the setup of any resource, the execution of any side effect, and provides a uniform mechanism for signalling your code is no longer interested in the values.

This uniform interface provides a single type that represents a collection, which means there are [plenty of things you can do with that collection](4-what-is-an-operator.md#collections), in uniform, reusable ways, using [operators](glossary-and-semantics#operator).

## Guaranteed Memory Management

All [teardown](glossary-and-semantics#teardown) logic registered by an Observable _must_ be called if subscription [completes](glossary-and-semantics#complete), [errors](glossary-and-semantics#error), or the [consumer](glossary-and-semantics#consumer) [unsubscribes](glossary-and-semantics#unsubscription), signalling it no longer wants to be [pushed](glossary-and-semantics#push) values.

If all resources are set up and consumed with the same type, they all return the same-shaped teardown mechanism, in this case a [`Subscription`](API). [Subscriptions can be composed](TODO) and this can greatly improve the ergonomics around preventing memory leaks in your application.

---

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://licensebuttons.net/l/by/4.0/80x15.png" /></a>
This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
