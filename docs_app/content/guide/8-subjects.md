# 8. Subjects

## TLDR:

- Both an [observer](glossary-and-semantics#observer) and an [observable](glossary-and-semantics#observable). Inheriting from [`Observable`](API).
- The primary use case is [multicasting](glossary-and-semantics#multicast).
- The next use case is eventing, such as dealing with single-function event handlers in frameworks like React and Angular.
- A less common use case is a [reactive loop](#subjects-reactive-loops---a-tertiary-use-case.)
- Should not be used as substitute for creating an [`Observable`](API).
- Subjects are not reuseable. Once `error` or `complete` is called, the subject will no longer emit.

## "Subjects" Are From The Observer Pattern

The subject type, as it exists in RxJS, is really derivative of the subject you'd find the the [Observer Pattern](WIKIPEDIA). The observer pattern is as follows: There are two types, the "subject" and the "observer". They have an API that looks, _generally_, like this:

**Observer Pattern Types** (Prefixed with `OP_` because this is not RxJS)

```ts
interface OP_Observer<T> {
  /** Handle a value notification */
  notify(value: T): void;
}

interface OP_Subject<T> {
  /** Register an observer to be notified by this subject */
  addObserver(observer: OP_Observer<T>): void;
  /** Unregister an observer so it stops being notified by this subject */
  removeObserver(observer: OP_Observer<T>): void;
  /** Notify all registered observers of a value */
  notifyObservers(value: T): void;
}
```

If you look at the API above, and you squint a little, you'll notice by renaming a few things you'll find some familiar-looking methods in these interfaces. For one, you could rename `notify` to `next` in `OP_Observer`, and you'll have a partial RxJS [`Observer`](API) type. Also, looking at `OP_Subject`, we know of a type that has a method that accepts an observer: [`subscribe`](API) on [`Observable`](API). So if we rename `addObserver` to `subscribe`, we're pretty close. But what about `removeObserver`? That's easy, we can get rid of it entirely, and instead return a [`Subscription`](API) object that, when [unsubscribed](glossary-and-semantics#unsubscription), will remove the observer from the subject for us.

That brings us to here:

```ts
interface OP_Observer<T> {
  /** Handle a value notification */
  next(value: T): void;
}

interface OP_Subject<T> {
  /**
   * Register an observer to be notified by this subject, and return
   * a Subscription that will remove the observer when you call `unsubscribe()` on it.
   */
  subscribe(observer: OP_Observer<T>): Subcription;
  /** Notify all registered observers of a value */
  notifyObservers(value: T): void;
}
```

That only leaves us with that pesky `notifyObservers` method, which takes a value and returns `void`. WHich happens to be exactly what our `next` method did on `OP_Observer` (and RxJS [`Observer`](API)). So let's change `notifyObservers` to `next`. And, after we factor this out, we have this:

```ts
interface OP_Observer<T> {
  /** Handle a value notification */
  next(value: T): void;
}

interface OP_Subject<T> extends OP_Observer<T> {
  /**
   * Register an observer to be notified by this subject, and return
   * a Subscription that will remove the observer when you call `unsubscribe()` on it.
   */
  subscribe(observer: OP_Observer<T>): Subcription;
}
```

By adding a few additional methods we have exactly the same thing as what we have in RxJS:

```ts
interface Observer<T> {
  /** Handle a value notification */
  next(value: T): void;
  /** Handle an error notification */
  error(err: any): void;
  /** Handle completion */
  complete(): void;
}

interface Observable<T> {
  /**
   * Register an observer to be notified, and return
   * a Subscription that will remove the observer when you call `unsubscribe()` on it.
   */
  subscribe(observer: Observer<T>): Subcription;
}

interface Subject<T> extends Observable<T>, Observer<T> {}
```

## Subjects: Multicasting - The Primary Use Case

If the primary use case isn't apparent from the APIs described above, it can be best reiterated as follows: Subjects are a type where many observers can be notified of the same value simulatenously. The primary use case of a subject is [multicasting](glossary-and-semantics#multicast).

In terms of RxJS and observables, this might still not seem clear. But think about it, if a subject is an [`Observer`](API), then it can be used to subscribe to an [`Observable`](API) by being passed to [`subscribe`](API). And if, when you call `next` on the subject, it notifies all observers who have subscribed to it (thus "registering" themselves to be "notified", per the [observer pattern](#subjects-are-from-the-observer-pattern)), then a [`Subject`](API) can be used to [multicast](glossary-and-semantics#multicast) any observable like so:

### Example: Basic Multicast With A Subject

```ts
// Create a subject
const subject = new Subject();

// Subscribe our consumers to the subject, not the source
subject.subscribe(observerA);
subject.subscribe(observerB);
subject.subscribe(observerC);

// Connect the source, through a single subscription, to all consumers by
// pushing its values through the subject.
const connectionSubscription = source$.subscribe(subject);
```

Note that we subscribe to the `subject` _before_ we connect `source$` through the `subject`. This is to ensure that if `source$` has any synchronous emissions, they are pushed to our [consumers](glossary-and-semantics#consumer).

## Subjects: Eventing - The Secondary Use Case

The secondary use case for [`Subject`](API) and its kin, is to act as a way create an observable that we imperatively push notifications through later. This is similar to the use case of "deferreds" and promises.

This is particularly useful with odd eventing APIs that only allow one function to be registered. For example the eventing APIs of React or Angular, which allow you to register exactly one function via JSX or the template. Another example might be the property event handlers like `domElement.onclick` or `webSocket.onmessage` et al.

### Example: Harnessing Events In React

In React, using hooks, you would create a reference to the subject, so you can use it over and over again. The, in an effect, you would subscribe to the subject so you can set state appropriately.

```ts
export function MyComp() {
  // Create a reference to our subject
  const { current: subject } = useRef(new Subject<void>());

  // Set up some state to manipulate
  const [allowedClicks, setAllowedClicks] = useState(0);

  // When the component mounts (deps = [])
  useEffect(() => {
    // Create our observable
    const allowedClicks$ = subject.pipe(
      debounceTime(4000),
      map((_, i) => i)
    );

    // subscribe to our stream of allowed clicks and update state.
    const subs = allowedClicks$.subscribe(setAllowedClicks);

    // be sure to unsubscribe when the compnent unmounts.
    return () => subs.unsubscribe();
  }, []);

  // In our JSX, wire up the event to "next()" into the subject.
  return (
    <div>
      <button onClick={() => subject.next()}>Click Me</button>
      <p>Allowed: {allowedClicks}</p>
    </div>
  );
}
```

If you're using a class component, it would look like so:

```ts
export class MyComp extends React.Component {
  // Setup our initial state and create the propery we stash state in.
  state = {
    allowedClicks: 0,
  };

  // A placeholder for our subscription
  allowedClicksSubscription?: Subscription;

  // Create the subject we're going to push events through
  subject = new Subject<void>();

  // Setup our observable of allowed clicks
  allowedClicks$ = this.subject.pipe(
    debounceTime(4000),
    map((_, i) => i)
  );

  // When the componement mounts, subscribe to our observable
  // of allowed clicks and update state.
  componentDidMount() {
    this.allowedClicksSubscription = this.allowedClicks$.subscribe((allowedClicks) => this.setState({ allowedClicks }));
  }

  // When the component unmounts, unsubscribe from our allowed clicks subscription.
  componentWillUnmount() {
    this.allowedClicksSubscription?.unsubscribe();
  }

  // When our button is clicked, push an event through our subject.
  onClick = () => this.subject.next();

  render() {
    return (
      <div>
        <button onClick={this.onClick}>Click Me</button>
        <p>Allowed: {allowedClicks}</p>
      </div>
    );
  }
}
```

### Example: Harnessing Events In Angular

In Angular, you don't have to worry about teardown as much, because it has the ["async pipe" (`| async`)](LINK) helper that will both [subscribe](glossary-and-semantics#subscribe) and [teardown](glossary-and-semantics#teardown) for you.

```ts
@Component({
  // Note the (click) event pushing an event through the clicks subject.
  // Also note the `| async`, which is used to manage the subscription to
  // allowedClicks$
  template: `<div>
    <button (click)="clicks.next()">Click Me</button>
    <p>Allowed: {{ allowedClicks$ | async }}</p>
  </div>`,
})
export class MyComp {
  // Set up the subject we'll use to push values through
  clicks = new Subject<void>();

  // Set up the observable of allowed clicks, which we subscribe to
  // directly in the template.
  allowedClicks$ = this.clicks.pipe(
    debounceTime(4000),
    map((_, i) => i)
  );
}
```

## Subjects: Reactive loops - A Tertiary Use Case

Given that subjects are observers and can also _be observed_, another interesting use case for subjects is that they can actually _observe themselves_. This sometimes refered to as "recursion" or as the "snake eating its own tail" scenario. This is useful in situations where you want to crawl an asynchronous graph or manage backpressure.

```ts
const subject = new Subject<void>();

// Our reactive lop
subject
  .pipe(
    // Compose some async thing we want to execute, maybe it's fetching data
    // or animating something, it doesn't matter what it is.
    concatMap(() => ajax.getJSON('some/url/here')),
    // Use `tap` to perform a side effect before moving on
    tap((data) => {
      processDataAndUpdateView(data);
    })
  )
  // After the async action has finished, and you have kicked of the side effect,
  // notify the subject and start the process all over again
  .subscribe(subject);

// Prime the loop!
// Without this line, the loop will not be started and nothing will happen
subject.next();
```

## Use In Leiu Of Observable

Quite often subjects are abused by new RxJS users that are not sure how to create an [`Observable`](API) out of some other type that is producing values. In these cases, it's recommended that you use `new Observable` instead. If you think about it, it's not that much different:

```ts
// Not great ////////////////////////////////
const subject = new Subject();
const producer = new SomeProducer();
producer.ondata = (e) => subject.next(e);

// composition and subscription in here some where...
subject.pipe(/* ... stuff ... */).subscribe(updateView);

// Somewhere else in their code...
producer.destroy();
```

```ts
// Better ///////////////////////////////////
const source$ = new Observable((subscriber) => {
  const producer = new SomeProducer();
  producer.ondata = (e) => subscriber.next(e);
  return () => producer.destroy();
});

// composition and subscription in here some where...
const subscription = source$.pipe(/* ... stuff ... */).subscribe(updateView);

// Somewhere else in their code...
subscription.unsubscribe();
```

Using an Observable over a Subject for this is better for a few reasons:

1. It provides a uniform means of teardown, that will also work through operator composition with things like [`switchMap`](API) et al.
2. The resulting observable is repeatable and retry-able with operators like [`repeat`](API), [`repeatWhen`](API), [`retry`](API), and [`retryWhen`](API). As well as simply resubscribing to the source.
3. The result is by default unicast, but can be made multicast easily. However the other example cannot be made unicast.

## Subject Gotchas

**Subjects cannot be reused. If they complete or error, they are DONE.**. This is because subjects provide all of the same guarantees as [subscribers](glossary-and-semantics#subscription) and other forms of [observation](glossary-and-semantics#observation) in RxJS. You can't call `next` after `error` or `complete`. The implications of this are that various forms of multicasting cannot be resubscribed to, meaning operators like [`repeat`](API) and [`retry`](API), et al, have no effect on subjects or subject-derived observables. Subjects that have been notified of an [error](glossary-and-semantics#error) will emit the error again if you subscribe to them a second time. However, a subject will not error or do anything at all if you call `next`, `error`, or `complete` on them after they've closed due to `error` or `complete` being called on it.

---

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://licensebuttons.net/l/by/4.0/80x15.png" /></a>
This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
