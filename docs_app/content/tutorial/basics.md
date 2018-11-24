# The basics

## Converting to observables

<!-- skip-example -->

```ts
import { Observable } from 'rxjs';

// From one or multiple values
const ofObser = Observable.of('foo', 'bar');

// From array of values
const fromObser = Observable.from([1, 2, 3]);

// From an event
const fromEventObser = Observable.fromEvent(
  document.querySelector('button'),
  'click'
);

// From a Promise
const fromPromiseObser = Observable.fromPromise(fetch('/users'));

// From a callback (last argument is a callback)
// fs.exists = (path, cb(exists))
var exists = Observable.bindCallback(fs.exists);
exists('file.txt').subscribe(exists => console.log('Does file exist?', exists));

// From a callback (last argument is a callback)
// fs.rename = (pathA, pathB, cb(err, result))
var rename = Observable.bindNodeCallback(fs.rename);
rename('file.txt', 'else.txt').subscribe(() => console.log('Renamed!'));
```

## Creating observables

Externally produce new events.

```ts
import { Subject } from 'rxjs';

var myObservable = new Subject();
myObservable.subscribe(value => console.log(value));
myObservable.next('foo');
```

Internally produce new events.

```ts
var myObservable = Observable.create(observer => {
  observer.next('foo');
  setTimeout(() => observer.next('bar'), 1000);
});
myObservable.subscribe(value => console.log(value));
```

Which one you choose depends on the scenario. The normal **Observable** is great when you want to wrap functionality that produces values over time. An example would be a websocket connection. With **Subject** you can trigger new events from anywhere really and you can connect existing observables to it.

## Controlling the flow

```ts
import { Observable, pipe } from 'rxjs';
import {
  map,
  delay,
  filter,
  throttleTime,
  debounceTime,
  take,
  takeUntil
} from 'rxjs/operators';

// typing "hello world"
var input = Observable.fromEvent(document.querySelector('input'), 'input');

// Filter out target values less than 3 characters long
input
  .pipe(
    filter(event => event.target.value.length > 2),
    map(event => event.target.value)
  )
  .subscribe(value => console.log(value)); // "hel"

// Delay the events
input
  .pipe(
    delay(200),
    map(event => event.target.value)
  )
  .subscribe(value => console.log(value)); // "h" -200ms-> "e" -200ms-> "l" ...

// Only let through an event every 200 ms
input
  .pipe(
    throttleTime(200),
    map(event => event.target.value)
  )
  .subscribe(value => console.log(value)); // "h" -200ms-> "w"

// Let through latest event after 200 ms
input
  .pipe(
    debounceTime(200),
    map(event => event.target.value)
  )
  .subscribe(value => console.log(value)); // "o" -200ms-> "d"

// Stop the stream of events after 3 events
input
  .pipe(
    take(3),
    map(event => event.target.value)
  )
  .subscribe(value => console.log(value)); // "hel"

// Passes through events until other observable triggers an event
var stopStream = Observable.fromEvent(
  document.querySelector('button'),
  'click'
);
input
  .pipe(
    takeUntil(stopStream),
    map(event => event.target.value)
  )
  .subscribe(value => console.log(value)); // "hello" (click)
```

## Producing values

```ts
import { Observable, pipe } from 'rxjs';
import {
  map,
  pluck,
  pairwise,
  distinct,
  distinctUntilChanged
} from 'rxjs/operators';

// typing "hello world"
var input = Observable.fromEvent(document.querySelector('input'), 'input');

// Pass on a new value
input
  .pipe(map(event => event.target.value))
  .subscribe(value => console.log(value)); // "h"

// Pass on a new value by plucking it
input.pipe(pluck('target', 'value')).subscribe(value => console.log(value)); // "h"

// Pass the two previous values
input
  .pipe(
    pluck('target', 'value'),
    pairwise()
  )
  .subscribe(value => console.log(value)); // ["h", "e"]

// Only pass unique values through
input
  .pipe(
    pluck('target', 'value'),
    distinct()
  )
  .subscribe(value => console.log(value)); // "helo wrd"

// Do not pass repeating values through
input
  .pipe(
    pluck('target', 'value'),
    distinctUntilChanged()
  )
  .subscribe(value => console.log(value)); // "helo world"
```
