# RxJS 9 test source models and lifecycle

## `cold()`

Each direct subscription creates an independent producer and diagram timeline.
Use it for `ColdObservable` and intentional producer-per-direct-subscription
contracts.

```ts
await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
  const source = cold('--a--|');

  expectObservable(source).toBe('--a--|');
  expectObservable(source, '---^').toBe('-----a--|');
  expectSubscriptions(source.subscriptions).toBe(['^----!', '---^----!']);
});
```

## `hot()`

The producer follows an absolute timeline and exists before an observer. Use
it for Subject-like/event-source behavior.

```ts
await rxTest(({ hot, expectObservable }) => {
  const source = hot('a-^-b--|');
  expectObservable(source).toBe('--b--|');
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
  const source = observable('--a--|');

  expectObservable(source, '^--!').toBe('--a');
  expectObservable(source, '-----^').toBe('-------a--|');
  expectSubscriptions(source.subscriptions).toBe(['^--!', '-----^----!']);
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
