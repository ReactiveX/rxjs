### RxJS best practices

RxJS is very large and contains lots of functions, operators and other stuff which makes it a complex ecosystem, but for lots of applications it can be as simple as knowing what `Observables` are and what can be done with them with some `operators`. But for larger codebases it is important to have code written in a way that allows for reusability, readability and composability. This guide may help overcome common ba practices and adopt a reactive mindset necessary for righting concise RxJS code.

## .subscribe ends composability
When we call `.subscribe` on any `Observable` what we do is get rid of said `Observable` and then only focus on the values that it produces. When we call `.subscribe` we can no longer continue composing operators (`.subscribe` returns a `Subscription`, on which we can no longer call `.pipe` and use RxJS operators), and composability is **the** greatest feature of RxJS.  Obviously, without subscribing to most `Observables`, we won't have a working application. In practice, frameworks like Angular offer solutions that allow to use `Observable` values directly without explicitly subscribing to them, a great example is the `async` pipe. 
So while subscribing is obviously not directly discouraged, we should be generally very careful when doing it, as to understand that the stream in question is no longer to be modified and can only be used as a source of values, nothing more.

## Using imperative logic in .subscribe instead of operators

Another problem that developers face when using `.subscribe` is performing complex operations on values from a source `Observable`. Especially bad scenarios involve using conditional operators and loops inside `.subscribe` callbacks, instead of composing `Observables` using pipes. Here are some common mistakes:

### Using an if statement when subscribing

In this piece of code, an operations is performed on a value emitted from a source observable if some condition is true:

    of(1, 2, 3, 4, 5).subscribe(
        value => {
            if (value % 2 === 0) {
                doSomething(value);
            }
        }
    );

Problem with this code is that we perform imperative logic on an `Observable`, ultimately defeating the purpose of reactive programming. This code can be improved using the `filter` operator:

    of(1, 2, 3, 4, 5).pipe(
        filter(value => value % 2 === 0),
    ).subscribe(value => doSomething(value));

A more complex example is writing an if-else statement. That can be improved using the `partition` function:

    const [evens$, odds$] = partition(
        of(1, 2, 3, 4, 5),
        value => value % 2 === 0,
    );

    evens$.subscribe(value => doSomethingWithEvens(value));
    odds$.subscribe(value => doSomethingWithOdds(value));

### Nested subscribe calls

Another tempting mistake is subscribing to another `Observable` in the `subscribe` callback of the first one. This mostly happens when we want to receive some data and then create a new `Observable` using that data (fro example, when using Angular's `HttpClient`). Doing so creates unnecessary levels of nested `Observables` and makes it harder to reason about those streams. Instead, use operators like `mergeMap`, `switchMap`, `concatMap` and `exhaustMap`, depending on the problem at hand. For example, instead of this:

    fromEvent(document.querySelector('input'), 'input').subscribe(event => {
        ajax(`http://my-api/search?query=${event.target.value}`).subscribe(response => {
            // handle the response
        });
    });

Do this:

    fromEvent(document.querySelector('input'), 'input').pipe(
        switchMap(event => ajax(`http://my-api/search?query=${event.target.value}`))
    ).subscribe(response => {
        // handle the response
    }); 


### In general, heavy logic when subscribing is discouraged

Here is a rule of thumb: 

- A `subscribe` that has an anonymous function with many lines of code is bad;
- A `subscribe` that has a named function as an argument is acceptable if nothing else can be done to simplify it using operators;
- A `subscribe` that has an anonymous function with a single line of code is good;
- A `subscribe` that has no arguments is great (though rare)
- No `subscribe` is ideal

## Avoiding memory leaks

The way RxJS operates creates a way for memory leaks to appear in applications that use it. Usually it happens when a consumer subscribes to an `Observable` and the `Observable` itself never terminates naturally (for example, an `Observable` created by `interval`, which emits values in equal periods of time), and no one unsubscribes from it or terminates it manually. The simplest way to do that is directly unsubscribe when the subscription is no longer necessary:

    const seconds$ = interval(1000);
    const subscription = seconds$.subscribe(console.log)

    // for example, unsubscribe when user hits a button

    document.querySelector('button').addEventListener('click, () => subscription.unsubscribe())

But this approach is imperative and does not convey explicitly when the subscription will terminate; if the two parts of code are separate from each other, just looking at the source `Observable` won't allow us to understand for just how long will the `Observable` sequence run. So a better approach is to use `takeUntil`:

    interval(1000).pipe(
        takeUntil(notifier$),
    ).subscribe(console.log)

In this example just looking at the `Observable` is enough to know exactly when it will terminate: when the `notifier$` `Observable` emits. Also, this is the widely accepted approach in the Angular community.

### Be careful to avoid takeUntil leaks

When `takeUntil` is not used correctly, it can lead to memory leaks too. As a rule of thumb, always place `takeUntil` as the last operator in the `pipe`. 

## Don't subclass

Sometimes, it can be tempting to build our own version of an `Observable` using existing classes. In particular, some developers might extend the existing `Observable` class to add some functionality and then use the "better" version throughout the app. But problems can arise in the future, for example, if the base classes are updated with the new versions of the RxJS library, as those classes are tightly coupled. Also, implementing a bae class that can work requires the developer to implement the `lift` method, which in turn makes the consumer application aware of the internal implementation details of the library. This [thread](https://github.com/ReactiveX/rxjs/issues/5431) contains a detailed discussion of the matter. 


## Use linting rules

It can be tedious to review projects endlessly to make sure every little detail is kept in line with the best practices, so it is a good idea to use linting rules. One example is [eslint-plugin-rxjs](https://github.com/cartant/eslint-plugin-rxjs), which has rules guarding from most bad practices mentioned in this section. If you use RxJS with Angular, another nice tool to have is [eslint-plugin-rxjs-angular](https://github.com/cartant/eslint-plugin-rxjs-angular). 