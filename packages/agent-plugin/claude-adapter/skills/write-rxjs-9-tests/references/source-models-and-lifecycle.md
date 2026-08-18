# RxJS 9 test source models and lifecycle

## `cold()`

Each direct subscription creates an independent producer and diagram timeline.
Use it for `ColdObservable` and intentional producer-per-direct-subscription
contracts.

```ts
await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
  const sourceMarbles = '             --a--|';
  const firstExpected = '             --a--|';
  const secondWindow = '              ---^------!';
  const secondExpected = '            -----a--|';
  const producerWindows = [
    '                                 ^----!', // First direct subscription.
    '                                 ---^----!', // Second direct subscription.
  ];
  const source = cold(sourceMarbles);

  expectObservable(source).toBe(firstExpected);
  expectObservable(source, secondWindow).toBe(secondExpected);
  expectSubscriptions(source.subscriptions).toBe(producerWindows);
});
```

## `hot()`

The producer follows an absolute timeline and exists before an observer. Use
it for Subject-like/event-source behavior.

```ts
await rxTest(({ hot, expectObservable }) => {
  const sourceMarbles = '   a-^-b--|';
  const expected = '          --b--|';
  const source = hot(sourceMarbles);

  expectObservable(source).toBe(expected);
});
```

The caret in a hot diagram establishes virtual time zero; earlier values are
not observed.

## `observable()`

This exercises platform active-producer lifecycle. First observer starts the
producer, concurrent observers join from their time, final observer close ends
the producer, and later observation restarts it.

```ts
await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
  const sourceMarbles = '       --a--|';
  const firstWindow = '         ^--!';
  const firstExpected = '       --a';
  const restartWindow = '       -----^------!';
  const restartExpected = '     -------a--|';
  const producerWindows = [
    '                           ^--!', // Initial active-producer period.
    '                           -----^----!', // Restarted producer.
  ];
  const source = observable(sourceMarbles);

  expectObservable(source, firstWindow).toBe(firstExpected);
  expectObservable(source, restartWindow).toBe(restartExpected);
  expectSubscriptions(source.subscriptions).toBe(producerWindows);
});
```

## Choose, do not translate mechanically

An old RxJS 7 cold marble does not prove that `cold()` is the correct RxJS 9
model. Select from the target lifecycle decision. Conversely, using
`observable()` everywhere can silently turn independent producer expectations
into shared ones.

Use `expectSubscriptions` on:

- cold sources to assert direct subscription windows;
- hot sources to assert observer attachment windows; and
- platform sources to assert active producer windows.

Marble parsers ignore alignment whitespace. Use that deliberately: keep source
diagrams, observation windows, expected output, and producer subscriptions in
fixed-width columns. The vertical picture should reveal timing before a reader
does frame arithmetic.
