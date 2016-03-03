# Subject

**What is a Subject?** An RxJS Subject is a special type of Observable that allows values to be multicasted to many Observers. While plain Observables are unicast (each subscribed Observer owns an independent execution of the Observable), Subjects are multicast.

<span class="informal">A Subject is like an Observable, but can multicast to many Observers. Subjects are like EventEmitters: they maintain a registry of many listeners.</span>

**Every Subject is an Observable.** Given a Subject, you can `subscribe` to it, providing an Observer, which will start receiving values normally. From the perspective of the Observer, it cannot tell whether the Observable execution is coming from a plain unicast Observable or a Subject.

Internally to the Subject, `subscribe` does not invoke a new execution that delivers values. It simply registers the given Observer in a list of Observers, similarly to how `addListener` usually works in other libraries and languages.

**Every Subject is an Observer.** It is an object with the methods `next(v)`, `error(e)`, and `complete()`. To feed a new value to the Subject, just call `next(theValue)`, and it will be multicast to the Observers registered to listen to the Subject.

In the example below, we have two Observers attached to a Subject, and we feed some values to the Subject:

```js
var subject = new Rx.Subject();

subject.subscribe({
  next: (v) => console.log('observerA: ' + v)
});
subject.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

subject.next(1);
subject.next(2);
```

With the following output on the console:

```none
observerA: 1
observerB: 1
observerA: 2
observerB: 2
```

Since a Subject is an Observer, this also means you may provide a Subject as the argument to the `subscribe` of any Observable, like the example below shows:

```js
var subject = new Rx.Subject();

subject.subscribe({
  next: (v) => console.log('observerA: ' + v)
});
subject.subscribe({
  next: (v) => console.log('observerB: ' + v)
});

var observable = Rx.Observable.fromArray([1, 2, 3]);

observable.subscribe(subject); // You can subscribe providing a Subject
```

Which executes as:

```none
observerA: 1
observerB: 1
observerA: 2
observerB: 2
observerA: 3
observerB: 3
```

With the approach above, we essentially just converted a unicast Observable execution to multicast, through the Subject. This demonstrates how Subjects are the only way of making any Observable execution be shared to multiple Observers. Under the hood, this is how the `multicast()` operator works.

Whenever we refer to "a multicasted Observable", that means an Observable execution that passes through a Subject. Otherwise, a "plain (unicast) Observable" behaves like an *invokable collection of future values*, with no sharing assumed.

There are a few specializations of the `Subject` type: `BehaviorSubject`, `ReplaySubject`, and `AsyncSubject`.

## BehaviorSubject

## ReplaySubject

## AsyncSubject
