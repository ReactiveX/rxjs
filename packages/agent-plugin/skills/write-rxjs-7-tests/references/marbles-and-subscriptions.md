# RxJS 7 marbles and subscription windows

## Run-mode basics

Inside `TestScheduler.run`, one `-` is one virtual frame and time progression
syntax such as `10ms` is available. Use `()` for simultaneous notifications,
`|` for completion, and `#` for error.

```ts
scheduler.run(({ cold, expectObservable }) => {
  const failure = new Error('failed');
  const source = cold(' -a-b-#', { a: 1, b: 2 }, failure);
  const expected = '    -x-y-#';

  expectObservable(source.pipe(map((value) => value * 10))).toBe(expected, { x: 10, y: 20 }, failure);
});
```

Align diagrams by semantic role, use domain names in value maps, and keep
irrelevant whitespace out of the expected timeline.

## Assert subscription windows

Values do not prove cancellation:

```ts
scheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
  const queries = hot('   a---b------|');
  const first = cold('     --x--y--|');
  const second = cold('        -z|');
  const firstSubs = '       ^---!';
  const secondSubs = '          ^-!';
  const expected = '      --x--z-----|';

  const result = queries.pipe(switchMap((query) => (query === 'a' ? first : second)));

  expectObservable(result).toBe(expected);
  expectSubscriptions(first.subscriptions).toBe(firstSubs);
  expectSubscriptions(second.subscriptions).toBe(secondSubs);
});
```

Check the actual frame math when adapting this pattern; subscription diagrams
are part of the contract, not decoration.

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
