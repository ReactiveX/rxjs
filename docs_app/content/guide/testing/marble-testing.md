# Testing RxJS Code with Marble Diagrams

<div class="alert is-helpful">
  <span>This guide refers to usage of marble diagrams when using the new <code>testScheduler.run(callback)</code>. Some details here do not apply to using the TestScheduler manually, without using the <code>run()</code> helper.</span>
</div>

We can test our _asynchronous_ RxJS code _synchronously_ and deterministically by virtualizing time using the TestScheduler. **Marble diagrams** provide a visual way for us to represent the behavior of an Observable. We can use them to assert that a particular Observable behaves as expected, as well as to create [hot and cold Observables](https://medium.com/@benlesh/hot-vs-cold-observables-f8094ed53339) we can use as mocks.

> At this time, the TestScheduler can only be used to test code that uses RxJS schedulers - `AsyncScheduler`, etc. If the code consumes a Promise, for example, it cannot be reliably tested with `TestScheduler`, but instead should be tested more traditionally. See the [Known Issues](#known-issues) section for more details.

```ts
import { TestScheduler } from 'rxjs/testing';
import { throttleTime } from 'rxjs/operators';

const testScheduler = new TestScheduler((actual, expected) => {
  // asserting the two objects are equal - required
  // for TestScheduler assertions to work via your test framework
  // e.g. using chai.
  expect(actual).deep.equal(expected);
});

// This test runs synchronously.
it('generates the stream correctly', () => {
  testScheduler.run((helpers) => {
    const { cold, time, expectObservable, expectSubscriptions } = helpers;
    const e1 = cold(' -a--b--c---|');
    const e1subs = '  ^----------!';
    const t = time('   ---|       '); // t = 3
    const expected = '-a-----c---|';

    expectObservable(e1.pipe(throttleTime(t))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
```

## API

The callback function you provide to `testScheduler.run(callback)` is called with `helpers` object that contains functions you'll use to write your tests.

<div class="alert is-helpful">
  <span>
    When the code inside this callback is being executed, any operator that uses timers/AsyncScheduler (like delay, debounceTime, etc.,) will automatically use the TestScheduler instead, so that we have "virtual time". You do not need to pass the TestScheduler to them, like in the past.
  </span>
</div>

```ts
testScheduler.run((helpers) => {
  const { cold, hot, expectObservable, expectSubscriptions, flush, time, animate } = helpers;
  // use them
});
```

Although `run()` executes entirely synchronously, the helper functions inside your callback function do not! These functions **schedule assertions** that will execute either when your callback completes or when you explicitly call `flush()`. Be wary of calling synchronous assertions, for example `expect`, from your testing library of choice, from within the callback. See [Synchronous Assertion](#synchronous-assertion) for more information on how to do this.

- `cold(marbleDiagram: string, values?: object, error?: any)` - creates a "cold" observable whose subscription starts when the test begins.
- `hot(marbleDiagram: string, values?: object, error?: any)` - creates a "hot" observable (like a subject) that will behave as though it's already "running" when the test begins. An interesting difference is that `hot` marbles allow a `^` character to signal where the "zero frame" is. That is the point at which the subscription to observables being tested begins.
- `expectObservable(actual: Observable<T>, subscriptionMarbles?: string).toBe(marbleDiagram: string, values?: object, error?: any)` - schedules an assertion for when the TestScheduler flushes. Give `subscriptionMarbles` as parameter to change the schedule of subscription and unsubscription. If you don't provide the `subscriptionMarbles` parameter it will subscribe at the beginning and never unsubscribe. Read below about subscription marble diagram.
- `expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]).toBe(subscriptionMarbles: string)` - like `expectObservable` schedules an assertion for when the testScheduler flushes. Both `cold()` and `hot()` return an observable with a property `subscriptions` of type `SubscriptionLog[]`. Give `subscriptions` as parameter to `expectSubscriptions` to assert whether it matches the `subscriptionsMarbles` marble diagram given in `toBe()`. Subscription marble diagrams are slightly different than Observable marble diagrams. Read more below.
- `flush()` - immediately starts virtual time. Not often used since `run()` will automatically flush for you when your callback returns, but in some cases you may wish to flush more than once or otherwise have more control.
- `time()` - converts marbles into a number indicating number of frames. It can be used by operators expecting a specific timeout. It measures time based on the position of the complete (`|`) signal:

  ```ts
  testScheduler.run((helpers) => {
    const { time, cold } = helpers;
    const source = cold('---a--b--|');
    const t = time('        --|    ');
    //                         --|
    const expected = '   -----a--b|';
    const result = source.pipe(delay(t));
    expectObservable(result).toBe(expected);
  });
  ```

- `animate()` - specifies when requested animation frames will be 'painted'. `animate` accepts a marble diagram and each value emission in the diagram indicates when a 'paint' occurs - at which time, any queued `requestAnimationFrame` callbacks will be executed. Call `animate` at the beginning of your test and align the marble diagrams so that it's clear when the callbacks will be executed:

  ```ts
  testScheduler.run((helpers) => {
    const { animate, cold } = helpers;
    animate('              ---x---x---x---x');
    const requests = cold('-r-------r------');
    /* ... */
    const expected = '     ---a-------b----';
  });
  ```

## Marble syntax

In the context of TestScheduler, a marble diagram is a string containing special syntax representing events happening over virtual time. Time progresses by _frames_. The first character of any marble string always represents the _zero frame_, or the start of time. Inside of `testScheduler.run(callback)` the frameTimeFactor is set to 1, which means one frame is equal to one virtual millisecond.

How many virtual milliseconds one frame represents depends on the value of `TestScheduler.frameTimeFactor`. For legacy reasons the value of `frameTimeFactor` is 1 _only_ when your code inside the `testScheduler.run(callback)` callback is running. Outside of it, it's set to 10. This will likely change in a future version of RxJS so that it is always 1.

> IMPORTANT: This syntax guide refers to usage of marble diagrams when using the new `testScheduler.run(callback)`. The semantics of marble diagrams when using the TestScheduler manually are different, and some features like the new time progression syntax are not supported.

- `' '` whitespace: horizontal whitespace is ignored, and can be used to help vertically align multiple marble diagrams.
- `'-'` frame: 1 "frame" of virtual time passing (see above description of frames).
- `[0-9]+[ms|s|m]` time progression: the time progression syntax lets you progress virtual time by a specific amount. It's a number, followed by a time unit of `ms` (milliseconds), `s` (seconds), or `m` (minutes) without any space between them, e.g. `a 10ms b`. See [Time progression syntax](#time-progression-syntax) for more details.
- `'|'` complete: The successful completion of an observable. This is the observable producer signaling `complete()`.
- `'#'` error: An error terminating the observable. This is the observable producer signaling `error()`.
- `[a-z0-9]` e.g. `'a'` any alphanumeric character: Represents a value being emitted by the producer signaling `next()`. Also consider that you could map this into an object or an array like this:

<!-- prettier-ignore -->
  ```ts
  const expected = '400ms (a-b|)';
  const values = {
    a: 'value emitted',
    b: 'another value emitted',
  };

  expectObservable(someStreamForTesting).toBe(expected, values);

  // This would work also
  const expected = '400ms (0-1|)';
  const values = [
    'value emitted',
    'another value emitted'
  ];

  expectObservable(someStreamForTesting).toBe(expected, values);
  ```

- `'()'` sync groupings: When multiple events need to be in the same frame synchronously, parentheses are used to group those events. You can group next'd values, a completion, or an error in this manner. The position of the initial `(` determines the time at which its values are emitted. While it can be counter-intuitive at first, after all the values have synchronously emitted time will progress a number of frames equal to the number of ASCII characters in the group, including the parentheses. e.g. `'(abc)'` will emit the values of a, b, and c synchronously in the same frame and then advance virtual time by 5 frames, `'(abc)'.length === 5`. This is done because it often helps you vertically align your marble diagrams, but it's a known pain point in real-world testing. [Learn more about known issues](#known-issues).
- `'^'` subscription point: (hot observables only) shows the point at which the tested observables will be subscribed to the hot observable. This is the "zero frame" for that observable, every frame before the `^` will be negative. Negative time might seem pointless, but there are in fact advanced cases where this is necessary, usually involving ReplaySubjects.

### Time progression syntax

The new time progression syntax takes inspiration from the CSS duration syntax. It's a number (integer or floating point) immediately followed by a unit; ms (milliseconds), s (seconds), m (minutes). e.g. `100ms`, `1.4s`, `5.25m`.

When it's not the first character of the diagram it must be padded a space before/after to disambiguate it from a series of marbles. e.g. `a 1ms b` needs the spaces because `a1msb` will be interpreted as `['a', '1', 'm', 's', 'b']` where each of these characters is a value that will be next()'d as-is.

**NOTE**: You may have to subtract 1 millisecond from the time you want to progress because the alphanumeric marbles (representing an actual emitted value) _advance time 1 virtual frame_ themselves already, after they emit. This can be counter-intuitive and frustrating, but for now it is indeed correct.

<!-- prettier-ignore -->
```ts
const input = ' -a-b-c|';
const expected = '-- 9ms a 9ms b 9ms (c|)';

// Depending on your personal preferences you could also
// use frame dashes to keep vertical alignment with the input.
// const input = ' -a-b-c|';
// const expected = '------- 4ms a 9ms b 9ms (c|)';
// or
// const expected = '-----------a 9ms b 9ms (c|)';

const result = cold(input).pipe(
  concatMap((d) => of(d).pipe(
    delay(10)
  ))
);

expectObservable(result).toBe(expected);
```

### Examples

`'-'` or `'------'`: Equivalent to {@link NEVER}, or an observable that never emits or errors or completes.

`|`: Equivalent to {@link EMPTY}, or an observable that never emits and completes immediately.

`#`: Equivalent to {@link throwError}, or an observable that never emits and errors immediately.

`'--a--'`: An observable that waits 2 "frames", emits value `a` on frame 2 and then never completes.

`'--a--b--|'`: On frame 2 emit `a`, on frame 5 emit `b`, and on frame 8, `complete`.

`'--a--b--#'`: On frame 2 emit `a`, on frame 5 emit `b`, and on frame 8, `error`.

`'-a-^-b--|'`: In a hot observable, on frame -2 emit `a`, then on frame 2 emit `b`, and on frame 5, `complete`.

`'--(abc)-|'`: on frame 2 emit `a`, `b`, and `c`, then on frame 8, `complete`.

`'-----(a|)'`: on frame 5 emit `a` and `complete`.

`'a 9ms b 9s c|'`: on frame 0 emit `a`, on frame 10 emit `b`, on frame 9,011 emit `c`, then on frame 9,012 `complete`.

`'--a 2.5m b'`: on frame 2 emit `a`, on frame 150,003 emit `b` and never complete.

## Subscription marbles

The `expectSubscriptions` helper allows you to assert that a `cold()` or `hot()` Observable you created was subscribed/unsubscribed to at the correct point in time. The `subscriptionMarbles` parameter to `expectObservable` allows your test to defer subscription to a later virtual time, and/or unsubscribe even if the observable being tested has not yet completed.

The subscription marble syntax is slightly different to conventional marble syntax.

- `'-'` time: 1 frame time passing.
- `[0-9]+[ms|s|m]` time progression: the time progression syntax lets you progress virtual time by a specific amount. It's a number, followed by a time unit of `ms` (milliseconds), `s` (seconds), or `m` (minutes) without any space between them, e.g. `a 10ms b`. See [Time progression syntax](#time-progression-syntax) for more details.
- `'^'` subscription point: shows the point in time at which a subscription happens.
- `'!'` unsubscription point: shows the point in time at which a subscription is unsubscribed.

There should be **at most one** `^` point in a subscription marble diagram, and **at most one** `!` point. Other than that, the `-` character is the only one allowed in a subscription marble diagram.

### Examples

`'-'` or `'------'`: no subscription ever happened.

`'--^--'`: a subscription happened after 2 "frames" of time passed, and the subscription was not unsubscribed.

`'--^--!-'`: on frame 2 a subscription happened, and on frame 5 was unsubscribed.

`'500ms ^ 1s !'`: on frame 500 a subscription happened, and on frame 1,501 was unsubscribed.

Given a hot source, test multiple subscribers that subscribe at different times:

```ts
testScheduler.run(({ hot, expectObservable }) => {
  const source = hot('--a--a--a--a--a--a--a--');
  const sub1 = '      --^-----------!';
  const sub2 = '      ---------^--------!';
  const expect1 = '   --a--a--a--a--';
  const expect2 = '   -----------a--a--a-';

  expectObservable(source, sub1).toBe(expect1);
  expectObservable(source, sub2).toBe(expect2);
});
```

Manually unsubscribe from a source that will never complete:

```ts
it('should repeat forever', () => {
  const testScheduler = createScheduler();

  testScheduler.run(({ expectObservable }) => {
    const foreverStream$ = interval(1).pipe(mapTo('a'));

    // Omitting this arg may crash the test suite.
    const unsub = '------!';

    expectObservable(foreverStream$, unsub).toBe('-aaaaa');
  });
});
```

## Synchronous Assertion

Sometimes, we need to assert changes in state _after_ an observable stream has completed - such as when a side effect like `tap` updates a variable. Outside of Marbles testing with TestScheduler, we might think of this as creating a delay or waiting before making our assertion.

For example:

```ts
let eventCount = 0;

const s1 = cold('--a--b|', { a: 'x', b: 'y' });

// side effect using 'tap' updates a variable
const result = s1.pipe(tap(() => eventCount++));

expectObservable(result).toBe('--a--b|', { a: 'x', b: 'y' });

// flush - run 'virtual time' to complete all outstanding hot or cold observables
flush();

expect(eventCount).toBe(2);
```

In the above situation we need the observable stream to complete so that we can test the variable was set to the correct value. The TestScheduler runs in 'virtual time' (synchronously), but doesn't normally run (and complete) until the testScheduler callback returns. The flush() method manually triggers the virtual time so that we can test the local variable after the observable completes.

---

## Known issues

### RxJS code that consumes Promises cannot be directly tested

If you have RxJS code that uses asynchronous scheduling - e.g. Promises, etc. - you can't reliably use marble diagrams _for that particular code_. This is because those other scheduling methods won't be virtualized or known to TestScheduler.

The solution is to test that code in isolation, with the traditional asynchronous testing methods of your testing framework. The specifics depend on your testing framework of choice, but here's a pseudo-code example:

```ts
// Some RxJS code that also consumes a Promise, so TestScheduler won't be able
// to correctly virtualize and the test will always be really asynchronous.
const myAsyncCode = () => from(Promise.resolve('something'));

it('has async code', (done) => {
  myAsyncCode().subscribe((d) => {
    assertEqual(d, 'something');
    done();
  });
});
```

On a related note, you also can't currently assert delays of zero, even with `AsyncScheduler`, e.g. `delay(0)` is like saying `setTimeout(work, 0)`. This schedules a new ["task" aka "macrotask"](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/), so it's asynchronous, but without an explicit passage of time.

### Behavior is different outside of `testScheduler.run(callback)`

The `TestScheduler` has been around since v5, but was actually intended for testing RxJS itself by the maintainers, rather than for use in regular user apps. Because of this, some of the default behaviors and features of the TestScheduler did not work well (or at all) for users. In v6 we introduced the `testScheduler.run(callback)` method which allowed us to provide new defaults and features in a non-breaking way, but it's still possible to [use the TestScheduler outside](https://github.com/ReactiveX/rxjs/blob/7113ae4b451dd8463fae71b68edab96079d089df/docs_app/content/guide/testing/internal-marble-tests.md) of `testScheduler.run(callback)`. It's important to note that if you do so, there are some major differences in how it will behave.

- `TestScheduler` helper methods have more verbose names, like `testScheduler.createColdObservable()` instead of `cold()`.
- The testScheduler instance is _not_ automatically used by operators that use `AsyncScheduler`, e.g. `delay`, `debounceTime`, etc., so you have to explicitly pass it to them.
- There is NO support for time progression syntax e.g. `-a 100ms b-|`.
- 1 frame is 10 virtual milliseconds by default. i.e. `TestScheduler.frameTimeFactor = 10`.
- Each whitespace `' '` equals 1 frame, same as a hyphen `'-'`.
- There is a hard maximum number of frames set at 750 i.e. `maxFrames = 750`. After 750 they are silently ignored.
- You must explicitly flush the scheduler.

While at this time usage of the TestScheduler outside of `testScheduler.run(callback)` has not been officially deprecated, it is discouraged because it is likely to cause confusion.
