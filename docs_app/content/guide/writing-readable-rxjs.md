# ????. Writing Readable RxJS

# TLDR:

- Don't write "mega observables". Break them up into smaller observables and functions.
- Use well-named custom operators.
- Add comments about the "whys", not the "hows".
- Be sure to have your code reviewed thoroughly.

## Readability vs Understanding

Often, whether it's RxJS-related, or JavaScript, or SQL, or any programming language, when people say "This code isn't readable!", what they often mean is "I don't understand what this code does". The problem at
hand is that one developer used some abstractions provided by a language or library, and, at least at the time, understood details about what was happening "under the hood" of these abstractions. They understood not just "how" it was working, but _why_ they needed it to work that way. Then another developer comes along, and they "can't read" the first developers code. The fact is, they can indeed "read" the code, but they don't _understand_ the code. Why does the next developer not understand the code?

The next developer will have a hard time **understanding** your code if they lack one or both of these things:

1. Context around why the code is doing what it is doing.
2. Knowledge of what the abstractions your using do.

It's very important, in _all_ of your code, not just the RxJS-related stuff, that these two things are conveyed cleanly, and concisely, to the next developer to come across your code.

## Break Your Code Up

You wouldn't write a "mega function" in most cases, don't write "mega observables". Observables are effectively functions. As functions don't do anything until you call the, observables don't do anything until you _subscribe_ to them. When you're building an observable by chaining operators together, what you're doing is effectively writing a function by adding lines of code to it, so to speak. Very long functions can be hard to understand because they can be hard to follow. Variable declarations can slowly move away from where they are used over the evolution of the code, and the local variable context gets cluttered with names that can start to conflict with one another.

The very nature of reactive programming with observables is that each piece is processed as an individual "step". Every operator returns a new observable. This means that you can break single "mega observable" into smaller observables. This can help with unit testing, in particular.

**Mega observable**

This a _small_ "mega observable"... It's a large block of RxJS with one start point and one exit.

```ts
getConfig().pipe(
    catchError(err => {
        displayError(`Critical: Unable to get config`);
        throw err;
    }),
    concatMap(
        config => forkJoin([
            service.authenticateUser(config.authURL).pipe(
                catchError(err => {
                    displayError(`Authentication error: ${err.message}`);
                    throw err;
                })
            ),
            service.establishConnection(config.dataServiceURL).pipe(
                retryWhen(errors$ => errors$.pipe(
                    concatMap(err => {
                        displayRetryMessage(`Attempting to establish connection...`);
                        return timer(3000);
                    })
                ))
            )
        ])
    ),
    concatMap(([ auth, connection ]) =>
             connection.loadInitialData(auth).pipe(
                 catchError(err => {
                     log(err);
                     displayError(`Unable get initial data`);
                     return EMPTY;
                 }),
                 map(initialData => normalizeData(initialData))
             )
         )
     )
)
.subscribe(
    data => displayDataToUser(data)
)
```

**Broken Up Into Parts**

```ts
const config$ = getConfig().pipe(
  catchError((err) => {
    displayError(`Critical: Unable to get config`);
    throw err;
  })
);

const getAuthenticatedUser = (authURL: string) => {
  return service.authenticateUser(authURL).pipe(
    catchError((err) => {
      displayError(`Authentication error: ${err.message}`);
      throw err;
    })
  );
};

const getDataConnection = (dataServiceURL: string) => {
  return service.establishConnection(dataServiceURL).pipe(
    retryWhen((errors$) =>
      errors$.pipe(
        concatMap((err) => {
          displayRetryMessage(`Attempting to establish connection...`);
          return timer(3000);
        })
      )
    )
  );
};

const authenticateAndConnect$ = config$.pipe(
  concatMap((config) => forkJoin([getAuthenticatedUser(config.authURL), getDataConnection(config.dataServiceURL)]))
);

const loadInitialData = (auth: UserAuthentiation, connection: ServiceConnection) => {
  return connection.loadInitialData(auth).pipe(
    catchError((err) => {
      log(err);
      displayError(`Unable get initial data`);
      return EMPTY;
    }),
    map((initialData) => normalizeData(initialData))
  );
};

const initialData$ = authenticateAndConnect$.pipe(concatMap(([auth, connection]) => loadInitialData(auth, connection)));

initialData$.subscribe((data) => displayDataToUser(data));
```

## RxJS Names Are Challenging

Normally, with abstractions, ideally, the abstractions have names that clearly convey what they are doing under the hood and possibly even their use case. Unfortunately, RxJS is a little rough around the edges in this area. Many of our names were inherited from a more than 10-year history dating back to a port from DotNet's Rx implementation. While we have been able to try to change and standardize some of the names (`mergeMap` or `exhaustMap`, for example), there are still some names that exist that don't make much sense to outsiders, such as `BehaviorSubject`. The obvious thing to do would seem to be rename these things in RxJS to names that make more sense. However, given the wide use and momentum of the library, these sorts of changes are costly, take a long time to execute, and just don't make sense at that sort of scale.

The point is, to the unindoctrinated, `saveButtonClicks$.pipe(exhaustMap(() => orderService.saveOrder(cart))))` looks like gobbledygook. If they have never seen an `exhaustMap` before, they are likely very confused and already starting to hate RxJS.

## Using Custom Operators To Improve Readability

Since pipeable operators were introduced in RxJS 5.5, we have had the ability to quickly and easily create custom operators using simple functional concepts. One of the key advantages to this the ability to create operators that are really wrapping other operators with names that concisely convey what the code is doing.

Let's take the previous example, where clicks were being mapped to order saves with `exhaustMap`:

**Not Very Readable**

```ts
saveButtonClicks$
  .pipe(
    exhaustMap(
      () =>
        orderService.saveOrder(cart).pipe(
          catchError((err) => {
            notifyOrderSubmissionError(err);
            return EMPTY;
          })
        ),
      tap(() => emptyCart())
    )
  )
  .subscribe((orderResponse) => displayReceipt(orderResponse));
```

In the case above, we have a small chain of operators to do some work. Someone that knows RxJS well might make sense of this quickly. We're making sure people don't double submit an order, and if the save comes back successfully, we're clearing the order form. But the point is, to someone that doesn't _know the abstractions and/or the context_, this code will be hard to read!

**Improved Readability With A Custom Operator**

```ts
function emptyCartAfterSave(): OperatorFunction<SavedOrderResponse, SavedOrderResponse> {
  return tap(() => emptyCart());
}

function handleOrderSubmissionErrors(): OperatorFunction<SavedOrderResponse, SavedOrderResponse> {
  return catchError((err) => {
    notifyOrderSubmissionError(err);
    return EMPTY;
  });
}

function saveOrderAndPreventDoubleSubmission(): OperatorFunction<any, SavedOrderResponse> {
  return exhaustMap(() => {
    orderService.saveOrder(cart).pipe(handleOrderSubmissionErrors(), emptyCartAfterSave());
  });
}

// later

saveButtonClicks$.pipe(saveOrderAndPreventDoubleSubmission()).subscribe((orderResponse) => displayReceipt(orderResponse));
```

Now, when people read the code that is "doing the work", they will see well-named functions used as operators that clearly convey what they are doing at why. Of course, it's worth noting that this adds some indirection, however, it might even clue our next developer into what `exhaustMap` does, at least at a rudimentary level. But of course we can do more there...

## Name Things Effectively

Ideally, most of the names of your variables, functions, methods, and custom operators are "self-documenting". There probably isn't such thing as 100% "self-documenting" code, but good names can help give the next developer cues about intent and the inner workings the code in question.

In our examples, we frequently will give very generic names like `source$` or `stream$`. That's because our examples are often intentionally generic and simplified to show behavior. This is _not_ how you should name things in your application.

When naming variables, custom operators, functions, etc, err on the side of specificity. Give names that provide some insight into the context, use case, or inner workings of the thing. Instead names like `state$`, or `stateStream$`, provide a name that gives more insight into what sort of state, or where it is used. `applicationState$`, `componentLocalState$`, `retrievedRegionOrStateInfo$`. See? All of those could have been named "`stateStream$`" or "`state$`", but in giving them better names, without even having the context of the code around it, we can more easily see what sort of data these variables might contain.

It is important to note, though, that a name alone is never going to give the next reader the entire story about that variable on it's own.

### Quick Note On "Finnish Notation" (\$ suffix)

Adding a `$` suffix to variable names pointing to observable instances is something that started long ago with [Andre Staltz](https://twitter.com/andrestaltz), and continues to be widely practiced today. The RxJS team, does not "officially" think this practice is required or even "better" than not doing so. We have found it advantageous to use Finnish Notation in our documentation because it clearly calls out which variables are observables, and let's face it, we have a lot of documentation on this site that involve important variables that are observables.

Finnish Notation can be useful in situations where you may have a variable of static data that is similarly named to another variable that is an observable. For example, a component with a state property of `incomingOrders` and an observable stream of `incomingOrders$` that is continuously updating it.

## Writing Effective Comments

Writing effective and useful comments is the hallmark of a great engineer. The most important thing about a comment, isn't necessarily the "what", but the "why". As much as good naming and breaking up your code into custom operators may help, they can't always give the next developer all of the information they may need when they have to revisit the code.

When you're thinking of the next developer, consider that they may not understand most of the abstractions you're using, let alone RxJS. And even if they do understand _all_ of the abstractions you're using, they may not understand _why_ you're using them.

Let's revisit the example above with our `saveOrderAndPreventDoubleSubmission` operator and add some comments that might help the next developer understand _why_ it's written the way it is:

```ts
/**
 * This is an operator used on an observable of save button clicks in our checkout component,
 * when it receives a click event, it will trigger a save unless one is already in progress.
 * If an error is encountered during save, the user will be notified. The resulting observable will
 * only emit a value once the order has been saved successfully and the cart has been emptied.
 */
function saveOrderAndPreventDoubleSubmission(): OperatorFunction<any, SavedOrderResponse> {
  // exhaustMap is used here to prevent the double submission of the saveOrder call.
  return exhaustMap(() => {
    orderService.saveOrder(cart).pipe(
      // If we don't handle errors inside of the exhaustMap, save button clicks will stop working
      // after the first error.
      handleOrderSubmissionErrors(),
      // It's important that we empty our cart inside of the exhaustMap, to ensure
      // that work is done before another save order is triggered. Otherwise, a user
      // may end up trying to save the same cart data twice.
      emptyCartAfterSave()
    );
  });
}
```

What the goal is for the comments above is really just to give the next developer (or your future self) more context as to why you made particular decisions with the code. Some of it may be obvious to you now, or it may become more obvious to you over time, but that doesn't mean you should not create useful comments for people that don't have the same level of understanding of the code base as you. The "What if you get hit by a bus?" factor should always apply.

---

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://licensebuttons.net/l/by/4.0/80x15.png" /></a>
This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
