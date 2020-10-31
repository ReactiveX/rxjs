# Introduction

RxJS is a library implementing the reactive programming paradigm for Javascript. This programming paradigm mainly handles the propagation of change. In reactive programming, one specifies how to "react" on such a propagated change. Taking a look at the following code example clarifies the behavior of reactive programming.

```ts
let a = 10;
let b = 10;
let c = a + b;
a = 20;

console.log(c);
```

Generally, considering usual programming paradigms the code above will log `20`. In a fully reactive approach the code would consider the change in the variable `a` and therefore log `30` instead.

This is only an example demonstrating the behavior of reactive programming.

## RxJS in a Nutshell

RxJS comes with some mechanism to enable developers to implement in a reactive manner.

- **Observable:** represents a set of an undefined amount of values.
- **Observer:** is a collection of callbacks that knows how to listen to values delivered by the Observable.
- **Subscription:** represents the life-cycle of an Observable.
- **Operators:** are functions that manipulate an existing Observable.
- **Subject:** is the equivalent to an EventEmitter.

## Capabilities of RxJS

RxJS provides one general mechanism to treat **synchronous** and **asynchronous** code the same way. On top of that, it provides functions similar to the [Array#extras](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/1.6). This enables developers to perform operations on an Observable in a similar way than they are already used to from working with Arrays.

Additionally, it provides one single interface to handle callbacks, Promises and Event-Emitter the exact same way.

All these features are provided by the [Observable](./guide/observable) class.

## First examples

Normally you register event listeners.

```ts
document.addEventListener("click", () => console.log("Clicked!"));
```

Using RxJS you create an Observable instead.

```ts
import { fromEvent } from "rxjs";

fromEvent(document, "click").subscribe(() => console.log("Clicked!"));
```
