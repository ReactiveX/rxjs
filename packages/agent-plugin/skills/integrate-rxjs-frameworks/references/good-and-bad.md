# Good and bad framework integration

## Stable owner

```ts
// Good: one controller per component owner.
const controller = useMemo(() => createSearch(api), [api]);

// Bad: a new Subject, pipeline, and commands on every render.
const controller = createSearch(api);
```

## Cleanup the correct contract

```ts
// Good RxJS 9
const owner = new AbortController();
source.subscribe(render, { signal: owner.signal });
onCleanup(() => owner.abort());

// Bad: platform subscribe returns undefined.
const subscription = source.subscribe(render);
onCleanup(() => subscription.unsubscribe());
```

For RxJS 7 the latter ownership shape is correct because `subscribe()` returns
a `Subscription`; version context determines the finding.

## Keep SSR import safe

```ts
// Good: create the browser source inside client lifecycle.
onMount(() => observe(button.when('click')));

// Bad: module initialization touches the DOM during server import.
const clicks = document.querySelector('button')!.when('click');
```

## Test product behavior

Do not re-test `switchMap` or `exhaustMap`. Test that stale search results never
render, duplicate order clicks start one request, every successful delete
updates view state, and unmount reaches the real resource.
