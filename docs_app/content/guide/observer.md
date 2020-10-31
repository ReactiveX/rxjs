# Observer

**What is an Observer?** An Observer is a consumer of values delivered by an Observable. Observers are a set of callbacks, one for each type of notification delivered by the Observable: `next`, `error`, and `complete`. The following is an example of a typical Observer object:

```ts
const observer = {
  next: x => console.log("Observer got a next value: " + x),
  error: err => console.error("Observer got an error: " + err),
  complete: () => console.log("Observer got a complete notification")
};
```

To use the Observer, provide it to the `subscribe` call of an Observable:

```ts
observable.subscribe(observer);
```

<span class="informal">Observers are objects with three callbacks, one for each type of notification that an Observable may deliver.</span>

Observers in RxJS may also be _partial_. If you don't provide one of the callbacks, the execution of the Observable will still happen normally. Be aware that some types of notifications will be ignored because they don't have a corresponding callback registered.

The example below is an Observer without the `complete` callback:

```ts
const observer = {
  next: x => console.log("Observer got a next value: " + x),
  error: err => console.error("Observer got an error: " + err)
};
```

When subscribing to an Observable, eferences to callback functions as the arguments, without wrapping it in an object:

```ts
observable.subscribe(x => console.log("Observer got a next value: " + x));
```

You can also use this mechanism to provide all three types of callbacks as arguments:

```ts
observable.subscribe(
  x => console.log("Observer got a next value: " + x),
  err => console.error("Observer got an error: " + err),
  () => console.log("Observer got a complete notification")
);
```
