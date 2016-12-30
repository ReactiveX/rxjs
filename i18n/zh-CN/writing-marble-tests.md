# Writing Marble Tests

"Marble Tests" are tests that use a specialized VirtualScheduler called the `TestScheduler`. They enable us to test
asynchronous operations in a synchronous and dependable manner. The "marble notation" is something that's been adapted
from many teachings and documents by people such as @jhusain, @headinthebox, @mattpodwysocki and @staltz. In fact,
@staltz first recommended this as a DSL for creating unit tests, and it has since been altered and adopted.

#### links

- [Contribution](../CONTRIBUTING.md)
- [Code of Conduct](../CODE_OF_CONDUCT.md)

## Basic methods

The unit tests have helper methods that have been added to make creating tests easier.

- `hot(marbles: string, values?: object, error?: any)` - creates a "hot" observable (a subject) that will behave 
  as though it's already "running" when the test begins. An interesting difference is that `hot` marbles allow a 
  `^` character to signal where the "zero frame" is. That is the point at which the subscription to observables 
  being tested begins.
- `cold(marbles: string, values?: object, error?: any)` - creates a "cold" observable whose subscription starts when 
  the test begins.
- `expectObservable(actual: Observable<T>).toBe(marbles: string, values?: object, error?: any)` - schedules an assertion
  for when the TestScheduler flushes. The TestScheduler will automatically flush at the end of your jasmine `it` block.
- `expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]).toBe(subscriptionMarbles: string)` - like `expectObservable` schedules an assertion for when the testScheduler flushes. Both `cold()` and `hot()` return an observable with a property `subscriptions` of type `SubscriptionLog[]`. Give `subscriptions` as parameter to `expectSubscriptions` to assert whether it matches the `subscriptionsMarbles` marble diagram given in `toBe()`. Subscription marble diagrams are slightly different than Observable marble diagrams. Read more below.

### Ergonomic defaults for `hot` and `cold`

In both `hot` and `cold` methods, value charecters specified in marble diagrams are emitted as strings unless a `values`
argument is passed to the method. Therefor:

`hot('--a--b')` will emit `"a"` and `"b"` whereas

`hot('--a--b', { a: 1, b: 2 })` will emit `1` and `2`.

Likewise, unspecified errors will just default to the string `"error"`, so:

`hot('---#')` will emit error `"error"` whereas

`hot('---#', null, new SpecialError('test'))` will emit `new SpecialError('test')`


## Marble Syntax

Marble syntax is a string represents events happening over "time". The first character of any marble string
always represents the "zero frame". A "frame" is somewhat analogous to a virtual millisecond.

- `"-"` time: 10 "frames" of time passage.
- `"|"` complete: The successful completion of an observable. This is the observable producer signaling `complete()`
- `"#"` error: An error terminating the observable. This is the observable producer signaling `error()`
- `"a"` any character: All other characters represent a value being emitted by the producure signaling `next()`
- `"()"` sync groupings: When multiple events need to single in the same frame synchronously, parenthesis are used
  to group those events. You can group nexted values, a completion or an error in this manner. The position of the 
  initial `(` determines the time at which its values are emitted.
- `"^"` subscription point: (hot observables only) shows the point at which the tested observables will be subscribed
  to the hot observable. This is the "zero frame" for that observable, every frame before the `^` will be negative.

### Examples

`'-'` or `'------'`: Equivalent to `Observable.never()`, or an observable that never emits or completes

`|`: Equivalent to `Observable.empty()`

`#`: Equivalent to `Observable.throw()`

`'--a--'`: An observable that waits 20 "frames", emits value `a` and then never completes.

`'--a--b--|`: On frame 20 emit `a`, on frame 50 emit `b`, and on frame 80, `complete`

`'--a--b--#`: On frame 20 emit `a`, on frame 50 emit `b`, and on frame 80, `error`

`'-a-^-b--|`: In a hot observable, on frame -20 emit `a`, then on frame 20 emit `b`, and on frame 50, `complete`.

`'--(abc)-|'`: on frame 20, emit `a`, `b`, and `c`, then on frame 80 `complete`

`'-----(a|)'`: on frame 50, emit `a` and `complete`.

## Subscription Marble Syntax

The subscription marble syntax is slightly different to conventional marble syntax. It represents the **subscription** and an **unsubscription** points happening over time. There should be no other type of event represented in such diagram.

- `"-"` time: 10 "frames" of the passage.
- `"^"` subscription point: shows the point in time at which a subscription happen.
- `"!"` unsubscription point: shows the point in time at which a subscription is unsubscribed.

There should be **at most one** `^` point in a subscription marble diagram, and **at most one** `!` point. Other than that, the `-` character is the only one allowed in a subscription marble diagram.

### Examples

`'-'` or `'------'`: no subscription ever happened.

`'--^--'`: a subscription happened after 20 "frames" of time passed, and the subscription was not unsubscribed.

`'--^--!-`: on frame 20 a subscription happened, and on frame 50 was unsubscribed.

## Anatomy of a Test

A basic test might look as follows:

```js

var e1 = hot('----a--^--b-------c--|');
var e2 = hot(  '---d-^--e---------f-----|');
var expected =      '---(be)----c-f-----|';

expectObservable(e1.merge(e2)).toBe(expected);
```

- The `^` characters of `hot` observables should **always** be aligned.
- The **first charactor** of `cold` observables or expected observables should **always** be aligned
  with each other, and with the `^` of hot observables.
- Use default emission values when you can. Specify `values` when you have to.

A test example with specified values:

```js
var values = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  x: 1 + 3, // a + c
  y: 2 + 4, // b + d
}
var e1 =    hot('---a---b---|', values);
var e2 =    hot('-----c---d---|', values);
var expected =  '-----x---y---|';

expectObservable(e1.zip(e2, function(x, y) { return x + y; }))
  .toBe(expected, values);
```

- Use the same hash to look up all values, this ensures that multiple uses of the same character have the
  same value.
- Make the result values as obvious as possible as to what they represent, these are *tests* afterall, we want
  clarity more than efficiency, so `x: 1 + 3, // a + c` is better than just `x: 4`. The former conveys *why* it's 4,
  the latter does not.

A test example with subscription assertions:

```js
var x = cold(        '--a---b---c--|');
var xsubs =    '------^-------!';
var y = cold(                '---d--e---f---|');
var ysubs =    '--------------^-------------!';
var e1 = hot(  '------x-------y------|', { x: x, y: y });
var expected = '--------a---b----d--e---f---|';

expectObservable(e1.switch()).toBe(expected);
expectSubscriptions(x.subscriptions).toBe(xsubs);
expectSubscriptions(y.subscriptions).toBe(ysubs);
```

- Align the start of `xsubs` and `ysubs` diagrams with `expected` diagram.
- Notice how the `x` cold observable is unsubscribed at the same time `e1` emits `y`.

In most tests it will be unnecessary to test subscription and unsubscription points, be either obvious or can be implied from the `expected` diagram. In those cases do not write subscription assertions. In test cases that have inner subscriptions or cold observables with multiple subscribers, these subscription assertions can be useful.

## Generating PNG marble diagrams from tests

Typically, each test case in Jasmine is written as `it('should do something', function () { /* ... */ })`. To mark a test case for PNG diagram generation, you must use the `asDiagram(label)` function, like this:

<!-- skip-example -->
```js
it.asDiagram(operatorLabel)('should do something', function () {
  // ...
});
```

For instance, with `zip`, we would write

```js
it.asDiagram('zip')('should zip by concatenating', function () {
  var e1 =    hot('---a---b---|');
  var e2 =    hot('-----c---d---|');
  var expected =  '-----x---y---|';
  var values = { x: 'ac', y: 'bd' };

  var result = e1.zip(e2, function(x, y) { return String(x) + String(y); });

  expectObservable(result).toBe(expected, values);
});
```

Then, when running `npm run tests2png`, this test case will be parsed and a PNG file `zip.png` (filename determined by `${operatorLabel}.png`) will be created in the `img/` folder.
