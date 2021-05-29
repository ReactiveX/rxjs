# 4. What Is An Operator?

## TLDR:

- Observables are a container for a collection of values over time.
- Operators are functions that take an [`Observable`](API) and return a new [`Observable`]. `(source: Observable<A>) => Observable<B>`.
- Operators are applied through the [`pipe` method](API).
- RxJS's "operators" are actually higher-order functions, that return [operator functions](glossary-and-semantics#operator-function).
- There are A LOT of possibilities for operators.

## Overview

To understand what operators are, why they are useful, and why there are so many of them, it's important to understand at a very high level, that an [observable](glossary-and-semantics#observable) is a collection of values over time. You have this thing, your observable, and you can call [`subscribe`](API), and tell it to start pushing values to you, and it can [complete](glossary-and-semantics#complete) and tell you when it's done, or you can [`unsubscribe`](glossary-and-semantics#unsubscribe) and tell it when you no longer want values. It is, a collection that gives you a sort of linear access to its values, over time.

## Collections

The reason it is important to distinguish that an observable is a collection, is that **all collections have operations you can perform on them**. This actually jumps out of the realm of programming and into the rest of the universe. Imagine, for instance, you had a collection of apples. You could take that collection of apples, and "filter" out all of the bad apples, leaving you a collection of good apples. You could then "concatenate" them with a larger set of good apples you had "filtered" earlier. _Then_, you could take your good apples, and use a knife on them and "map" (or reduce) them into a collection of apple parts. _Then_ you could "filter" out the cores. You get the idea.

Generally, you can always "map" a collection to a new collection, by virtue of the fact it has any values in it.

You can do things like "filter" a collection as long as a new collection can be created of smaller size.

You can do things like "concatenate" a collection with another collection _only_ if that collection has an "end". (Our apples have an end, in that there's presumably a finite number of apples).

## Containers

The idea of a "container" is simple. It holds things. Okay, easy right? But an interesting thing about containers is, some types of containers can hold "inner containers" of the same type. Boxes inside of boxes. Arrays inside of arrays. Observables inside of observables.

If you have a container type, that can contains a collection of the same type of containers, that container can be _flattened_. That is to say, that you could systematically look in a container, pull out any containers you find, and dump their contents into a new container of the same type.

Visually, in JavaScript that might look like this (shown with array literals):

```ts
[[1, 2, 3], [4, 5], [6]].flat() === [1, 2, 3, 4, 5, 6];
```

In terms of our apples above, that would be a box of boxes of apples, that you could then take out and dump into a new box of just apples.

## Collections And Containers In JavaScript

There are quite a few collections and containers already in existence in JavaScript. It's worth noting a few of them for comparisons here:

### Arrays

The most common collections of things we deal with in JavaScript are [Arrays](MDN_LINK_HERE). Arrays are collections that can be accessed synchronously, and randomly at indices. You can [map](MDN) an array into a new array of the same size. You can create an array of a smaller size (provided your current array isn't length of `0`), so it can be [filtered](MDN) to a new array. And arrays have a definitive "end" to them, which is represented in array literals with `]`, and at runtime by checking to see if your index is outside of the bounds provided by the `length`, therefor arrays can be [concatenated](MDN). Arrays can also be [flattened](MDN), as you can have an array of arrays.

### Promises

Yes, believe it or not, a promise is indeed a "collection". It's a collection of exactly one thing, no more no less. That means they're slightly more limited, but they can be mapped, with [`then`](MDN), concatenated (also `then`), and flattened (which is done automatically with, you guessed it... `then`). However, they can't be placed "inside" of one another. And they can't be "filtered", (there has to be one value or a rejection). So without even getting into their lack of cancellation, it's fair to say they're limited in terms of available operations.

### Iterables

There is a whole bit that we could go into here about how [Observable is the "dual" of Iterable](FIND_LINK), however, for brevity's sake: Iterables are [pull](glossary-and-semantics#pull)-based collections/containers of values, in which you can use an [Iterator](MDN) (or iteration via `for..of`) in order to [pull](glossary-and-semantics#pull) one value out at a time. Iterables can "contain" other Iterables. They can be any size. And Iterables signal their end by providing a `done` value in an [iteration result](MDN). They can be mapped, filtered, flattened, concatenated, et al.

If this topic interests, you, it's probably also worth looking at [async iterables](MDN), and libraries related to it, like [ixjs](https://github.com/reactivex/ixjs).

### Observables

Observables actually exist in the wild in various forms, but here we're obviously going to be talking about RxJS [`Observables`](API).

Observables are a container ("opened via subscription") that holds values that are pushed over time. Observables [complete](glossary-and-semantics#complete), so you know when they've ended. Observables can also be of any size. Almost all operations that can be performed on the types above can also be performed on [`Observables`](API).

## Operators

You've made it this far, and you're probably thinking, "All of that is great... So what are operators?"

An "operator" is sort of a blanket term for a thing that can perform an operation on a collection that results in a new collection. For example, `filter` and `map` are both "operators" for [`Array`](MDN).

To that end, an operator in RxJS is a function that takes an [`Observable`](API) and returns a new [`Observable`](API). Operators in RxJS are implemented as higher-order functions that return a function that takes a source [`Observable`](API) and returns a brand new [`Observable`](API).

There are so many operators with `Observable` because, not only do we have values as a dimension of how we can transform the observable, but since the values can arrive over time, we there is a temporal nature to observable, meaning not only can you synchronously [`map`](API) or [`filter`](API) an observable, but you can also [`delay`](API) [pushed](glossary-and-semantics#push) [notifications](glossary-and-semantics#notification) from arriving to the [consumer](glossary-and-semantics#consumer).

---

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://licensebuttons.net/l/by/4.0/80x15.png" /></a>
This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
