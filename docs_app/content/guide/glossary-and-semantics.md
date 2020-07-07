# RxJS: Glossary And Semantics

When discussing and documenting observables, it's important to have a common language and a known set of rules around what is going on. This document is an attempt to standardize these things so we can try to control the language in our docs, and hopefully other publications about RxJS, so we can discuss reactive programming with RxJS on consistent terms.

While not all of the documentation for RxJS reflects this terminology, it is a goal of the team to ensure it does, and to ensure the language and names around the library use this document as a source of truth and unified language.

## Major Entities

There are high level entities that are frequently discussed. It's important to define them seperately from other lower-level concepts, because they relate to the nature of observable.

### Consumer

The code that is subscribing to the observable. This is whoever is being _notified_ of [nexted](#Next) values, and [errors](#Error) or [completions](#Complete).

### Producer

Any system or thing that is the source of values that are being pushed out of the observable subscription to the consumer. This can be a wide variety of things, from a `WebSocket` to a simple iteration over an `Array`. The producer is most often created during the [subscribe](#Subscribe) action, and therefor "owned" by a [subscription](#Subscription) in a 1:1 way, but that is not always the case. A producer may be shared between many subscriptions, if it is created outside of the [subscribe](#Subscribe) action, in which case it is one-to-many, resulting in a [multicast](#Multicast).

### Subscription

A contract where a [consumer](#Consumer) is [observing](#Observation) values pushed by a [producer](#Producer). The subscription (not to be confused with the `Subscription` class or type), is an ongoing process that amounts to the function of the observable from the Consumer's perspective. Subcription starts the moment a [subscribe](#Subscribe) action is initiated, even before the [subscribe](#Subscribe) action is finished.

### Observable

The primary type in RxJS. At its highest level, an observable represents a template for connecting an [Observer](#Observer), as a [consumer](#Consumer), to a [producer](#Producer), via a [subscribe](#Subscribe) action, resulting in a [subscription](#Subscription).

### Observer

The manifestation of a [consumer](#Consumer). A type that may have some (or all) handlers for each type of [notification](#Notification): [next](#Next), [error](#Error), and [complete](#Complete). Having all three types of handlers generally gets this to be called an "observer", where if it is missing any of the notification handlers, it may be called a ["partial observer"](#Partial_Observer).

## Major Actions

There are specific actions and events that occur between major entities in RxJS that need to be defined. These major actions are the highest level events that occur within various parts in RxJS.

### Subscribe

The act of a [consumer](#Consumer) requesting an Observable set up a [subscription](#Subscription) so that it may [observe](#Observation) a [producer](#Producer). A subscribe action can occur with an observable via many different mechanisms. The primary mechanism is the [`subscribe` method](/api/index/class/Observable#subscribe) on the [Observable class](/api/index/class/Observable). Other mechanisms include the [`forEach` method](/api/index/class/Observable#forEach), functions like [`lastValueFrom`](/api/index/function/lastValueFrom), and [`firstValueFrom`](/api/index/function/firstValueFrom), and the deprecated [`toPromise` method](/api/index/class/Observable#forEach).

### Teardown

The act of cleaning up resources used by a producer. This is guaranteed to happen on `error`, `complete`, or if unsubscription occurs. This is not to be confused with [unsubscription](#Unsubscription), but it does always happen during unsubscription.

### Unsubscription

The act of a [consumer](#Consumer) telling a [producer](#Producer) is is no longer interested in recieving values. Causes [Teardown](#Teardown)

### Observation

A [consumer](#Consumer) reacting to [next](#Next), [error](#Error), or [complete](#Complete) [notifications](#Notification). This can only happen _during_ [subscription](#Subscription).

### Observation Chain

When an [observable](#Observable) uses another [observable](#Observable) as a [producer](#Producer), an "observation chain" is set up. That is a chain of [observation](#Observation) such that multiple [observers](#Observer) are [notifying](#Notifcation) each other in a unidirectional way toward the final [consumer](#Consumer).

### Next

A value has been pushed to the [consumer](#Consumer) to be [observed](#Observation). Will only happen during [subscription](#Subscription), and cannot happen after [error](#Error), [complete](#Error), or [unsubscription](#Unsubscription). Logically, this also means it cannot happen after [teardown](#Teardown).

### Error

The [producer](#Producer) has encountered a problem and is notifying the [consumer](#Consumer). This is a notification that the [producer](#Producer) will no longer send values and will [teardown](#Teardown). This cannot occur after [complete](#Complete), any other [error](#Error), or [unsubscription](#Unsubscription). Logically, this also means it cannot happen after [teardown](#Teardown).

### Complete

The [producer](#Producer) is notifying the [consumer](#Consumer) that it is done [nexting](#Next) values, without error, will send no more values, and it will [teardown](#Teardown). [Completion](#Complete) cannot occur after an [error](#Error), or [unsubscribe](#Unsubscription). [Complete](#Complete) cannot be called twice. [Complete](#Complete), if it occurs, will always happen before [teardown](#Teardown).

### Notification

The act of a [producer](#Producer) pushing [nexted](#Next) values, [errors](#Error) or [completions](#Complete) to a [consumer](#Consumer) to be [observed](#Observation). Not to be confused with the [`Notification` type](/api/index/class/Notification), which is notification manifested as a JavaScript object.

## Major Concepts

Some of what we discuss is conceptual. These are mostly common traits of behaviors that can manifest in observables or in push-based reactive systems.

### Multicast

The act of one [producer](#Producer) being [observed](#Observation) by **many** [consumers](#Consumer).

### Unicast

The act of one [producer](#Producer) being [observed](#Observation) **only one** [consumer](#Consumer). An observable is "unicast" when it only connects one [producer](#Producer) to one [consumer](#consumer). Unicast doesn't necessarily mean ["cold"](#Cold).

### Cold

An observable is "cold" when it creates a new [producer](#Producer) during [subscribe](#Subscribe) for every new [subscription](#Subscription). As a result, a "cold" observables are _always_ [unicast](#Unicast), being one [producer](#Producer) [observed](#Observation) by one [consumer](#Consumer). Cold observables can be made [hot](#Hot) but not the other way around.

### Hot

An observable is "hot", when its [producer](#Producer) was created outside of the context of the [subscribe](#Subscribe) action. This means that the "hot" observable is almost always [multicast](#Multicast). It is possible that a "hot" observable is still _technically_ unicast, if it is engineered to only allow one [subscription](#Subscription) at a time, however, there is no straightforward mechanism for this in RxJS, and the scenario is a unlikely. For the purposes of discussion, all "hot" observables can be assumed to be [multicast](#Multicast). Hot observables cannot be made [cold](#Cold).

### Push

[Observables](#Observable) are a push-based type. That means rather than having the [consumer](#Consumer) call a function or perform some other action to get a value, the [consumer](#Consumer) receives values as soon as the [producer](#Producer) has produced them, via a registered [next](#Next) handler.


### Pull 

Pull-based systems are the opposite of [push](#Push)-based. In a pull-based type or system, the [consumer](#Consumer) must request each value the [producer](#Producer) has produced manually, perhaps long after the [producer](#Producer) has actually done so. Examples of such systems are [Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function) and [Iterators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) 

## Minor Entities

### Operator

A factory function that creates an [operator function](#Operator_Function). Examples of this in rxjs are functions like [`map`](/api/operators/map) and [`mergeMap`](/api/operators/mergeMap), which are generally passed to [`pipe`](/api/index/class/Observable#pipe). The result of calling many operators, and passing their resulting [operator functions](#Operator_Function) into pipe on an observable [source](#Source) will be another [observable](#Observable), and will generally not result in [subscription](#Subscription).

### Operator Function

A function that takes an [observable](#Observable), and maps it to a new [observable](#Observable). Nothing more, nothing less. Operator functions are created by [operators](#Operator). If you were to call an rxjs operator like [map](/api/operators/map) and put the return value in a variable, the returned value would be an operator function.

### Operation

An action taken while handling a [notification](#Notification), as set up by an [operator](#Operator) and/or [operator function](#Operator_Function). In RxJS, a developer can chain several [operator functions](#Operator_Function) together by calling [operators](#Operator) and passing the created [operator functions](#Operator_Function) to the [`pipe`](/api/index/class/Observable#pipe) method of [`Observable`](/api/index/class/Observable), which results in a new [observable](#Observable). During [subscription](#Subscription) to that observable, operations are performed in an order dictated by the [observation chain](#Observation_Chain).

### Stream

A "stream" or "streaming" in the case of observables, refers to the collection of [operations](#Operation), as they are processed during a [subscription](#Subscription). This is not to be confused with node [Streams](https://nodejs.org/api/stream.html), and the word "stream", on its own, should be used _sparingly_ in documentation and articles. Instead, prefer [observation chain](#Observation_Chain), [operations](#Operation), or [subscription](#Subscription). "Streaming" is less ambiguous, and is fine to use given this defined meaning.

### Source
A [observable](#Observable) or [valid observable input](#Observable_Inputs) having been converted to an observable, that will supply values to another [observable](#Observable), either as the result of an [operator](#Operator) or other function that creates one observable as another. This [source](#Source), will be the [producer](#Producer) for the resulting [observable](#Observable) and all of its [subscriptions](#Subscriptions). Sources may generally be any type of observable.

### Observable Inputs

A "observable input" ([defined as a type here](/api/index/type-alias/ObservableInput)), is any type that can easily converted to an [Observable](#Observable). Observable Inputs may sometimes be referred to as "valid observable sources".

### Notifier

An [observable](#Observable) that is being used to notify another [observable](#Observable) that it needs to perform some action. The action should only occur on a [next notification](#Next), and never on [error](#Error) or [complete](#Complete). Generally, notifiers are used with specific operators, such as [`takeUntil`](/api/operators/takeUntil), [`buffer`](/api/operators/buffer), or [`delayWhen`](/api/operators/delayWhen). A notifier may be passed directly, or it may be returned by a callback.

### Inner Source

One, of possibly many [sources](#Source), which are [subscribed](#Subscribe) to automatically within a single [subscription](#Subscription) to another observable. Examples of an "inner source" include the [observable inputs](#Observable_Inputs) returned by the mapping function in a [mergeMap](/api/operators/mergeMap) [operator](#Operator). (e.g. `source.pipe(mergeMap(value => createInnerSource(value))))`, were `createInnerSource` returns any valid [observable input](#Observable_Input)).

### Partial Observer

An [observer](#Observer) that lacks all necessary [notification](#Notification) handlers. Generally these are supplied by user-land [consumer](#Consumer) code. A "full observer" or "observer" would simply be an observer than had all [notification](#Notification) handlers.

## Other Concepts

### Unhandled Errors

An "unhandled error" is any [error](#Error) that is not handled by a [consumer](#Consumer)-provided function, which is generally provided during the [subscribe](#Subscribe) action. If no error handler was provided, RxJS will assume the error is "unhandled" and rethrow the error on a new callstack or prevent ["producer interference"](Producer_Interference)

### Producer Interference

[Producer](#Producer) interference happens when an error is allowed to unwind the callstack the RxJS callstack during [notification](#Notification). When this happens, the error could break things like for-loops in [upstream](#Upstream_and_Downstream) [sources](#Source) that are [notifying](#Notification) [consumers](#Consumer) during a [multicast](#Multicast). That would cause the other [consumers](#Consumer) in that [multicast](#Multicast) to suddenly stop receiving values without logical explanation. As of version 6, RxJS goes out of its way to prevent producer interference by ensuring that all unhandled errors are thrown on a separate callstack.

### Upstream And Downstream

The order in which [notifications](#Notification) are processed by [operations](#Operation) in a [stream](#Stream) have a directionality to them. "Upstream" refers to an [operation](#Operation) that was already processed before the current [operation](#Operation), and "downstream" refers to an [operation](#Operation) that _will_ be processed _after_ the current [operation](#Operation). See also: [Streaming](#Stream).