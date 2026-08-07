# RxJS 7 marbles and subscription windows

## Run-mode basics

Inside `TestScheduler.run`, one `-` is one virtual frame and time progression
syntax such as `10ms` is available. Use `()` for simultaneous notifications,
`|` for completion, and `#` for error.

```ts
scheduler.run(({ cold, expectObservable }) => {
  const failure = new Error('failed');
  const sourceMarbles = '   -a-b-#';
  const expectedMarbles = ' -x-y-#';
  const source = cold(sourceMarbles, { a: 1, b: 2 }, failure);

  expectObservable(source.pipe(map((value) => value * 10))).toBe(expectedMarbles, { x: 10, y: 20 }, failure);
});
```

Whitespace in run-mode marble strings is ignored so diagrams can be aligned in
fixed-width columns. Use that feature deliberately. Align diagrams by semantic
role and use domain names in value maps.

## Assert subscription windows

Values do not prove cancellation:

```ts
scheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
  const queriesMarbles = '    a---b------|';
  const firstMarbles = '          --x--y--|';
  const secondMarbles = '             -z|';
  const expectedMarbles = '      --x--z-----|';
  const firstSubscriptions = '  ^---!';
  const secondSubscriptions = '     ^-!';
  const queries = hot(queriesMarbles);
  const first = cold(firstMarbles);
  const second = cold(secondMarbles);

  const result = queries.pipe(switchMap((query) => (query === 'a' ? first : second)));

  expectObservable(result).toBe(expectedMarbles);
  expectSubscriptions(first.subscriptions).toBe(firstSubscriptions);
  expectSubscriptions(second.subscriptions).toBe(secondSubscriptions);
});
```

Check the actual frame math when adapting this pattern; subscription diagrams
are part of the contract, not decoration. Keep all timelines in a vertical
column so cancellation is visible without mentally stripping labels.

## Hot versus cold

- `cold()` starts its diagram at each subscription and records independent
  producer windows.
- `hot()` follows one absolute timeline whose producer exists before a given
  observer.

Choose from production behavior. A cold source is not a convenient default for
a Subject-based integration, and a hot source is not a substitute for shared
ref-counted cold production.

## Higher-order values

Use value maps containing inner Observables when testing flattening, and assert
each inner's `subscriptions`. A flattened output alone can hide whether an
inner was canceled, queued, or remained active after downstream unsubscribe.

## Explicit unsubscription

Pass a subscription marble to `expectObservable` to stop observation, then
assert the source window ends at the same point. Use this for `takeUntil`,
component disposal, shared zero-ref-count disconnect, and custom teardown.
