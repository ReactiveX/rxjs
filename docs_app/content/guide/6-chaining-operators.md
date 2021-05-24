# 6. Chaining Operators

## TLDR:

- `pipe` is a functional programming concept that executes functions in order, passing the result of each one to the next.
- Use the `Observable` [`pipe`](API) method to chain operators together and build new Observables.
- You can create many small chains to shorten larger chains.

## Overview

One of the central points of RxJS is combining its many operators in interesting and useful ways. This is done by [chaining](glossary-and-semantics#chaining) the operators together using functional programming tricks built into RxJS for convenience.

If an operator, as stated in ["what is an operator"](4-what-is-an-operator.md#Operators), is a "thing that can perform an operation" on a collection, then we might be able to go back to our [collection of apples example](4-what-is-an-operator.md#Collections) from that section.

Let's say we had a machine that would sort the apples (bad and good), and we also had a machine that could peel apples, and perhaps a machine that could slice the apples. We could then, in theory, chain them all together with some sort of conveyor and sort, peel, and slice the apples all in one overall operation. In this example we would be [chaining](CL) the operations, and the apples, as we processed them would be [streaming](glossary-and-semantics#chaining) through those operations.

## Functional Chaining With Pipe

Functional `pipe` is a high-level functional programming concept. The idea is to take a chain of unary functions (functions with one input and one output), and create from them a single unary function. That function given an input, executes all of the supplied functions, in the order they were supplied, and then returns the final output.

The simplest version of this is the [`pipe`](API) function exported by RxJS, which is very lightweight, and identical to many other implementations from other libraries such as [Ramda](https://ramdajs.com), et al.

The example below illustrates that `pipe(a, b, c)(x)` is the same as `c(b(a(x)))`.

```ts
import { Observable, pipe } from 'rxjs';

function double(input: string): string {
  return `${input} and ${input}`;
}

function makeExciting(input: string): string {
  return input + '!!!';
}

function allCaps(input: string): string {
  return input.toUpperCase();
}

const applyAllPiped = pipe(double, makeExciting, allCaps);

const applyAllManually = (input: string) => allCaps(makeExciting(double(input)));

console.log(applyAllPiped('more')); // "MORE AND MORE!!!"
console.log(applyAllManually('more')); // "MORE AND MORE!!!"
```

## So What Is Pipe, Really?

Pipe is a simple function that looks (basically) like this in JavaScript (The TypeScript definition gets a little hairy, so I'll just give this example in plain JS):

```ts
function pipe(...fns) {
  return (input) => fns.reduce((prev, fn) => fn(prev), input);
}

// or a more readable version (this is identical in behavior):

function pipe(...fns) {
  return (input) => {
    let result = input;
    for (const fn of fns) {
      result = fn(input);
    }
    return result;
  };
}
```

There are edge cases to cover, of course, like zero arguments, but overall this is the concept.

## Piping Operators

Since operators are all higher-order functions that return unary functions of the shape `(source: Observable<A>) => Observable<B>`, that means they can be combined with [`pipe`](API).

```ts
import { pipe } from 'rxjs';
import { map, filter } from 'rxjs/operators';

// Here we're combining 3 operators into a single operator function
// that is `(source: Observable<Apple>) => Observable<PeeledAppleSlice[]>`
const processApples = pipe(
  // `(source: Observable<Apple>) => Observable<Apple>`
  filter((apple) => apple.quality === 'GOOD'),
  // `(source: Observable<Apple>) => Observable<PeeledApple>`
  map((apple) => createPeeledApple(apple)),
  // `(source: Observable<PeeledApple>) => Observable<PeeledAppleSlice[]>`
  map((peeledApple) => slice(peeledApple))
);
```

Note that `processApples` above is **NOT** an observable. It's just a function. It's a function built from three other functions that were returned by calls to [`filter`](API), [`map`](API), and another [`map`](API), in that order. You can now use it like so:

```ts
import { Observable, pipe } from 'rxjs';
import { map, filter } from 'rxjs/operators';

const apples$: Observable<Apple> = getApples();

const processApples = pipe(
  filter((apple) => apple.quality === 'GOOD'),
  map((apple) => createPeeledApple(apple)),
  map((peeledApple) => slice(peeledApple))
);

processApples(apples$).subscribe(console.log);
```

This is nice because you can reuse the operator function `processApples`, however, it's somewhat cumbersome to read, and unergonomic, so for convenience, RxJS has added a [`pipe` method](API) directly to [`Observable`](API). With the observable pipe method, the above is equivalent to:

```ts
import { Observable, map, filter } from 'rxjs/operators';

const apples$: Observable<Apple> = getApples();

apples$
  .pipe(
    filter((apple) => apple.quality === 'GOOD'),
    map((apple) => createPeeledApple(apple)),
    map((peeledApple) => slice(peeledApple))
  )
  .subscribe(console.log);
```

Furthermore, the `processApples` function above, is an [`OperatorFunction`](API), or a function that takes an observable and returns a new observable. And can be used directly with the [`Observable`](API) [`pipe`](API) method.

```ts
import { Observable, pipe } from 'rxjs';
import { map, filter } from 'rxjs/operators';

const apples$: Observable<Apple> = getApples();

const processApples = pipe(
  filter((apple) => apple.quality === 'GOOD'),
  map((apple) => createPeeledApple(apple)),
  map((peeledApple) => slice(peeledApple))
);

apples$.pipe(processApples).subscribe(console.log);
```

### The Pipeline Operator ECMAScript Proposal

A notable development in the wild is the [ECMAScript Pipeline Operator Proposal](https://github.com/tc39/proposal-pipeline-operator) that is currently being examined by the [TC39](https://tc39.es/), which is the standards committee that governs language features in JavaScript. All forms of this operator (JavaScript operator, sorry I know that is confusing), do effectively the same thing as what the simple `pipe` function does above, however, it's done in a way that is more readable, universal, and easier to flow types through, than what we're currently doing in RxJS.

What that looks like is this (with the most commonly accepted proposal):

```ts
import { Observable, map, filter } from 'rxjs/operators';

const apples$: Observable<Apple> = getApples();

apples$
    |> filter(apple => apple.quality === 'GOOD'),
    |> map(apple => createPeeledApple(apple)),
    |> map(peeledApple => slice(peeledApple))
    |> .subscribe(console.log);
```

Currently, this is still sort of "pie in the sky", but we welcome you to try it out. There are various
Babel plugins and event an [experimental branch of TypeScript](https://github.com/microsoft/TypeScript/pull/38305) that allow you to use this feature.

It's very interesting because then you can use a similar approach to RxJS's operators with other types like Arrays, Iterator, et al.

---

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://licensebuttons.net/l/by/4.0/80x15.png" /></a>
This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
