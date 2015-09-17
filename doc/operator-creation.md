# Operator Creation

There are many ways to create an operator for RxJS. In this version of RxJS, performance was the primary consideration, as such, operator creation 
in a way that adheres to the existing structures in this library may not be straight forward. This is an attempt to document how to 
create an operator either for yourself, or for this library.

For how to develop a custom operator for *this* library, [see below](#advanced).

## DIY Custom Operators for End Users


### Guidelines

In the most common case, users might like to create an operator to be used only by by their app. These can be developed in 
any way the developer sees fit, but here are some guidelines:

1. __Operators should always return an Observable__. You're performing operations on unknown sets of things to create new sets.
  It only makes sense to return a new set. If you create a method that returns something other than an Observable, it's not an operator,
  and that's fine.
2. __Be sure to manage subscriptions__ created inside of the Observable your operator returns. Your operator is going to have to
  subscribe to the source (or `this`) inside of the returned Observable, be sure that it's returned as part of unsubscribe handler or 
  subscription.
3. __Be sure to handle exceptions from passed functions__. If you're implementing an operator that takes a function as an argument, 
  when you call it, you'll want to wrap it in a `try/catch` and send the error down the `error()` path on the observable.
4. __Be sure to teardown scarce resources__ in your unsubscribe handler of your returned Observable. If you're setting up event handlers
  or a web socket, or something like that, the unsubscribe handler is a great place to remove that event handler or close that socket.
  


### Example

```js
function mySimpleOperator(someCallback) {
   // We *could* do a `var self = this;` here to close over, but see next comment
   return Observable.create(subscriber => {
     // because we're in an arrow function `this` is from the outer scope.
     var source = this;
     
     // save our inner subscription
     var subscription = source.subscribe(value => {
       // important: catch errors from user-provided callbacks
       try {
         subscriber.next(someCallback(value));
       } catch(err) {
         subscriber.error(err);
       }
     }, 
     // be sure to handle errors and completions as appropriate and
     // send them along
     err => subscriber.error(err),
     () => subscriber.complete());
     
     // to return now
     return subscription;
   });
}
```

### Adding the operator to Observable

There are a few ways to do this. It's really down to needs and preference:

1) Use the ES7 function bind operator (`::`) available in transpilers like [BabelJS](http://babeljs.io):

```js
someObservable::mySimpleOperator(x => x + '!');
```

2) Create your own Observable subclass and override `lift` to return it:

```js
class MyObservable extends Observable {
  lift(operator) {
    const observable = new MyObservable(); //<-- important part here
    observable.source = this;
    observable.operator = operator;
    return observable;
  }
  
  // put it here .. or ..
  customOperator() {
    /* do things and return an Observable */ 
  }
}

// ... put it here...
MyObservable.prototype.mySimpleOperator = mySimpleOperator;
```

3) Patch `Observable.prototype` directly:

```js
Observable.prototype.mySimpleOperator = mySimpleOperator;

// ... and later .../

someObservable.mySimpleOperator(x => x + '!');
```


## <a id="advanced"></a>Creating An Operator For Inclusion In *This* Library

__To create an operator for inclusion in this library, it's probably best to work from prior art__. Something 
like the `filter` operator would be a good start. It's not expected that you'll be able to read
this section and suddenly be an expert operator contributor.

**If you find yourself confused, DO NOT worry. Follow prior examples in the repo, submit a PR, and we'll work with you.** 

Hopefully the information provided here will give context to decisions made while developing operators in this library.
There are a few things to know and (try to) understand while developing operators:

1. All operator methods are actually created in separate modules from `Observable`. This is so developers can
 "build their own observable" by pulling in operator methods an adding them to observable in their own module.
 It also means operators can be brought in ad-hock and used directly, either with the ES7 function bind operator
 in Babel (`::`) or by using it with `.call()`.
2. Every operator has an `Operator` class. The `Operator` class is really a `Subscriber` "factory". It's 
 what gets passed into the `lift` method to make the "magic" happen. It's sole job is to create the operation's 
 `Subscriber` instance on subscription.
3. Every operator has a `Subscriber` class. This class does *all* of the logic for the operation. It's job is to 
 handle values being nexted in (generally by overriding `_next()`) and forward it along to the `destination`, 
 which is the next observer in the chain.
   - It's important to note that the `destination` Observer set on any `Subscriber` serves as more than just
   the destinations for the events passing through, If the `destination` is a `Subscriber` it also is used to set up
   a shared underlying `Subscription`, which, in fact, is also a `Subscriber`, and is the first `Subscriber` in the 
   chain.
   - Subscribers all have `add` and `remove` methods that are used for adding and removing inner subscriptions to
   the shared underlying subscription.
   - When you `subscribe` to an Observable, the functions or Observer you passed are used to create the final `destination`
   `Subscriber` for the chain. It's this `Subscriber` that is really also the shared `Subscriptoin` for the operator chain.
   
### Inner Subscriptions

An "inner subscriber" or "inner subscription" is any subscription created inside of an operator's primary Subscriber. For example,
if you were to create your own "merge" operator of some sort, the Observables that are arriving on the source observable that you
want to "merge" will need to be subscribed to. Those subscriptions will be inner subscriptions. One interesting thing about
inner subscriptions in this library is that if you pass and set a `destination` on them, they will try to use that destination
for their `unsubscribe` calls. Meaning if you call `unsubscribe` on them, it might not do anything. As such, it's usually desireable
not to set the `destination` of inner subscriptions. An example of this might be the switch operators, that have a single underlying
inner subscription that needs to unsubscribe independent of the main subscription.

If you find yourself creating inner subscriptions, it might also be worth checking to see if the observable being passed `_isScalar`, 
because if it is, you can pull the `value` out of it directly and improve the performance of your operator when it's operating over
scalar observables. For reference a scalar observable is any observable that has a single static value underneath it. `Observable.of('foo')` will
return a `ScalarObservable`, likewise, resolved `PromiseObservable`s will act as scalars.