# Observable

Observables represent an unknown amount of values over an unknown range of time. Additionally they are push-based collections of multiple values and fill the missing spot in the following table:

|          | Single Value                                                                                              | Multiple Values                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Pull** | [`Function`](https://developer.mozilla.org/en-US/docs/Glossary/Function)                                  | [`Iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) |
| **Push** | [`Promise`](https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Promise) | [`Observable`](/api/index/class/Observable)                                                         |

**Example.** The following is an Observable that pushes the values `1`, `2`, `3` immediately (synchronously) when subscribed, and the value `4` after one second has passed since the subscribe call, then completes:

```ts
import { Observable } from "rxjs";

const observable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.next(4);
    subscriber.complete();
  }, 1000);
});
```

## Pull versus Push

_Pull_ and _Push_ are two different protocols that describe how a data _Producer_ can communicate with a data _Consumer_.

**What is Pull?** In Pull systems, the Consumer determines when it receives data. The Producer itself is unaware of when the data will be delivered.

Every JavaScript Function is a Pull system. The function is a Producer of data, and the code that calls the function is consuming it by "pulling" out a _single_ return value from its call.

ES2015 introduced [generator functions and iterators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) (`function*`), another type of Pull system. Code that calls `iterator.next()` is the Consumer, "pulling" out _multiple_ values from the iterator (the Producer).

|          | Producer                                   | Consumer                                    |
| -------- | ------------------------------------------ | ------------------------------------------- |
| **Pull** | **Passive:** produces data when requested. | **Active:** decides when data is requested. |
| **Push** | **Active:** produces data at its own pace. | **Passive:** reacts to received data.       |

**What is Push?** In Push systems, the Producer determines when to send data to the Consumer. The Consumer is unaware of when it will receive that data.

Promises are the most common type of Push system in JavaScript today. A Promise (the Producer) delivers a resolved value to registered callbacks (the Consumers), but unlike functions, it is the Promise which is in charge of determining precisely when that value is "pushed" to the callbacks.

RxJS introduces Observables, a new Push system for JavaScript. An Observable is a Producer of multiple values, "pushing" them to Observers (Consumers).

- A **Function** is a lazily evaluated computation that synchronously returns a single value on invocation.
- A **Promise** is a computation that eventually return a single value.
- An **Observable** is a lazily evaluated computation that can synchronously or asynchronously return zero to (potentially) infinite values from the time it's invoked onwards.

## Observables are lazy

Consider the following:

```ts
function foo() {
  console.log("Hello");
  return 42;
}

const x = foo.call(); // same as foo()
console.log(x);
const y = foo.call(); // same as foo()
console.log(y);
```

You can write the same behavior above, but with Observables:

```ts
import { Observable } from "rxjs";

const foo = new Observable(subscriber => {
  console.log("Hello");
  subscriber.next(42);
});

foo.subscribe(x => {
  console.log(x);
});
foo.subscribe(y => {
  console.log(y);
});
```

Both code examples have the exact same output!

This happens because both functions and Observables are lazy computations. If you don't call the function, the `console.log('Hello')` won't happen. Also with Observables, if you don't "call" it (with `subscribe`), the `console.log('Hello')` won't happen.

Additionally, "calling" or "subscribing" is an isolated operation: two function calls trigger two separate side effects, and two Observable subscribes trigger two separate side effects.

<span class="informal">Subscribing to an Observable is analogous to calling a Function.</span>

## Observables are either synchronous or asynchronous

Even though writing RxJS code looks pretty similar to asynchronous code, it is as synchronous as possible. As long as there are no asynchronous operations involved an Observable will be completely synchronous.

## What is the difference between an Observable and a function

**Observables can "return" multiple values over time**, something which functions cannot. You can't do this:

```js
function foo() {
  console.log("Hello");
  return 42;
  return 100; // dead code. will never happen
}
```

Functions can only return one value. Observables, however, can do this:

```ts
import { Observable } from "rxjs";

const foo = new Observable(subscriber => {
  console.log("Hello");
  subscriber.next(42);
  subscriber.next(100); // "return" another value
  subscriber.next(200); // "return" yet another
});

console.log("before");
foo.subscribe(x => {
  console.log(x);
});
console.log("after");
```

Conclusion:

- `func.call()` means "_give me one value synchronously_"
- `observable.subscribe()` means "_give me any amount of values, either synchronously or asynchronously_"

## Anatomy of an Observable

Observables are **created** using `new Observable` or a creation operator, are **subscribed** to with an Observer, **execute** to deliver `next` / `error` / `complete` notifications to the Observer, and their execution may be **disposed**. These four aspects are all encoded in an Observable instance, but some of these aspects are related to other types, like Observer and Subscription.

### Creating Observables

The `Observable` constructor takes one argument: the `subscribe` function.

The following example creates an Observable to emit the string `'hi'` every second to a subscriber.

```ts
import { Observable } from "rxjs";

const observable = new Observable(subscriber => {
  const id = setInterval(() => {
    subscriber.next("hi");
  }, 1000);
});
```

<span class="informal">Observables can be created with `new Observable`. Most commonly, observables are created using creation functions, like `of`, `from`, `interval`, etc.</span>

### Subscribing to Observables

The variable `observable` in the example can be _subscribed_ to, like this:

```ts
observable.subscribe(x => console.log(x));
```

When calling `observable.subscribe`, the function passed to the constructor in `new Observable(subscriber => {...})` is run for that given subscriber. Each call to `observable.subscribe` triggers its own independent setup for that given subscriber.

<span class="informal">Subscribing to an Observable is like calling a function, providing callbacks where the data will be delivered to.</span>

A `subscribe` call is the way to start an "Observable execution" and deliver values to an Observer of that execution.

### Executing Observables

The code inside `new Observable(subscriber => {...})` represents an "Observable execution", a lazy computation that only happens every time the `subscribe` method is called. The execution produces multiple values over time, either synchronously or asynchronously.

There are three types of values an Observable Execution can deliver:

- "Next" notification: sends a value such as a Number, a String, an Object, etc.
- "Error" notification: sends a JavaScript Error or exception.
- "Complete" notification: does not send a value.

"Next" notifications are the most important and most common type: they represent actual data being delivered to a subscriber. "Error" and "Complete" notifications happen only once during the Observable Execution, and there can only be either one of them.

<span class="informal">In an Observable Execution, zero to infinite Next notifications may be delivered. If either an Error or Complete notification is delivered, then nothing else can be delivered afterward.</span>

Observables strictly adhere to the Observable Contract, so the following code would not deliver the Next notification `4`:

```ts
import { Observable } from "rxjs";

const observable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
  subscriber.next(4); // Is not delivered because it would violate the contract
});
```

### Disposing Observable Executions

Because Observable Executions may be infinite, and it's common for an Observer to want to abort execution in finite time. Therefore we need an API for canceling such an execution. Since each execution is exclusive to one Observer only, it has to have a way to stop the execution.

Calling `observable.subscribe` returns an object, the `Subscription`:

```ts
const subscription = observable.subscribe(x => console.log(x));
```

The Subscription represents the ongoing execution, and has a minimal API which allows you to cancel that execution. Read more about the [`Subscription` type here](./guide/subscription). With `subscription.unsubscribe()` you can cancel the ongoing execution:

```ts
import { from } from "rxjs";

const observable = from([10, 20, 30]);
const subscription = observable.subscribe(x => console.log(x));
// Later:
subscription.unsubscribe();
```

<span class="informal">When you subscribe, you get back a Subscription, which represents the ongoing execution. Just call `unsubscribe()` to cancel the execution.</span>

Each Observable must define how to dispose resources of that execution when instantiating the Observable. You can do that by returning a custom `unsubscribe` function from within the constructor.

For instance, this is how we clear an interval execution set with `setInterval`:

```js
const observable = new Observable(function subscribe(subscriber) {
  // Keep track of the interval resource
  const intervalId = setInterval(() => {
    subscriber.next("hi");
  }, 1000);

  // Provide a way of canceling and disposing the interval resource
  return function unsubscribe() {
    clearInterval(intervalId);
  };
});
```
