# Observer

**What is an Observer?** An Observer is a consumer of values delivered by an Observable. Observers are simply a set of callbacks, one for each type of notification delivered by the Observable: `next`, `error`, and `complete`. The following is an example of a typical Observer object:

```js
var observer = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
  complete: () => console.log('Observer got a complete notification'),
};
```

To use the Observer, provide it to the `subscribe` of an Observable:

<!-- skip-example -->
```js
observable.subscribe(observer);
```

<span class="informal">Observers are just objects with three callbacks, one for each type of notification that an Observable may deliver.</span>

Observers in RxJS may also be *partial*. If you don't provide one of the callbacks, the execution of the Observable will still happen normally, except some types of notifications will be ignored, because they don't have a corresponding callback in the Observer.

The example below is an Observer without the `complete` callback:

```js
var observer = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
};
```

When subscribing to an Observable, you may also just provide the callbacks as arguments, without being attached to an Observer object, for instance like this:

<!-- skip-example -->
```js
observable.subscribe(x => console.log('Observer got a next value: ' + x));
```

Internally in `observable.subscribe`, it will create an Observer object using the first callback argument as the `next` handler. All three types of callbacks may be provided as arguments:

<!-- skip-example -->
```js
observable.subscribe(
  x => console.log('Observer got a next value: ' + x),
  err => console.error('Observer got an error: ' + err),
  () => console.log('Observer got a complete notification')
);
```
