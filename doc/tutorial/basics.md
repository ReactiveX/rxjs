# The basics

## Converting to observables
<!-- skip-example -->
```js
// From one or multiple values
Rx.Observable.of('foo', 'bar');

// From array of values
Rx.Observable.from([1,2,3]);

// From an event
Rx.Observable.fromEvent(document.querySelector('button'), 'click');

// From a Promise
Rx.Observable.fromPromise(fetch('/users'));

// From a callback (last argument is a callback)
// fs.exists = (path, cb(exists))
var exists = Rx.Observable.bindCallback(fs.exists);
exists('file.txt').subscribe(exists => console.log('Does file exist?', exists));

// From a callback (last argument is a callback)
// fs.rename = (pathA, pathB, cb(err, result))
var rename = Rx.Observable.bindNodeCallback(fs.rename);
rename('file.txt', 'else.txt').subscribe(() => console.log('Renamed!'));
```

## Creating observables
Externally produce new events.
```js
var myObservable = new Rx.Subject();
myObservable.subscribe(value => console.log(value));
myObservable.next('foo');
```

Internally produce new events.
```js
var myObservable = Rx.Observable.create(observer => {
  observer.next('foo');
  setTimeout(() => observer.next('bar'), 1000);
});
myObservable.subscribe(value => console.log(value));
```

Which one you choose depends on the scenario. The normal **Observable** is great when you want to wrap functionality that produces values over time. An example would be a websocket connection. With **Subject** you can trigger new events from anywhere really and you can connect existing observables to it.

## Controlling the flow
```js
// typing "hello world"
var input = Rx.Observable.fromEvent(document.querySelector('input'), 'keypress');

// Filter out target values less than 3 characters long
input.filter(event => event.target.value.length > 2)
  .subscribe(value => console.log(value)); // "hel"

// Delay the events
input.delay(200)
  .subscribe(value => console.log(value)); // "h" -200ms-> "e" -200ms-> "l" ...

// Only let through an event every 200 ms
input.throttleTime(200)
  .subscribe(value => console.log(value)); // "h" -200ms-> "w"

// Let through latest event after 200 ms
input.debounceTime(200)
  .subscribe(value => console.log(value)); // "o" -200ms-> "d"

// Stop the stream of events after 3 events
input.take(3)
  .subscribe(value => console.log(value)); // "hel"

// Passes through events until other observable triggers an event
var stopStream = Rx.Observable.fromEvent(document.querySelector('button'), 'click');
input.takeUntil(stopStream)
  .subscribe(value => console.log(value)); // "hello" (click)
```

## Producing values
```js
// typing "hello world"
var input = Rx.Observable.fromEvent(document.querySelector('input'), 'keypress');

// Pass on a new key press
input.map(event => event.key)
  .subscribe(value => console.log(value)); // "h"

// Pass on a new key press by plucking it
input.pluck('key')
  .subscribe(value => console.log(value)); // "h"

// Pass paired the two previous key presses
input.pluck('key').pairwise()
  .subscribe(value => console.log(value)); // ["h", "e"], ["l", "l"], ...

// Only pass unique key presses through
input.pluck('key').distinct()
  .subscribe(value => console.log(value)); // "h", "e", "l", "o", " ", "w", "r", "d"

// Do not pass repeating key presses through
input.pluck('key').distinctUntilChanged()
  .subscribe(value => console.log(value)); // "h", "e", "l", "o", " ", "w", "o", "r", "l", "d"
```
