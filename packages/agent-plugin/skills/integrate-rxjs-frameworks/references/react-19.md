# React 19.2

Never subscribe during render. A render can be restarted or discarded, and a
subscription created there has no reliable cleanup owner.

## Effect-owned observation

Use an effect for a component-local side effect. Keep the Observable identity
stable with module/service ownership or `useMemo`; include every input that
changes the source.

```ts
useEffect(() => {
  const controller = new AbortController();
  source.subscribe(setValue, { signal: controller.signal });
  return () => controller.abort();
}, [source]);
```

That is the RxJS 9 form. RxJS 7 cleanup returns
`() => subscription.unsubscribe()`. Do not mix the two contracts.

## External-store integration

Use `useSyncExternalStore` only for an actual external store with stable
`subscribe`, `getSnapshot`, and `getServerSnapshot` functions. `getSnapshot`
must return a cached value until the store changes; it must not subscribe or
allocate. The store—not each render—owns current state and ref-counted source
observation.

```ts
function useSearchStore(store: SearchStore) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
```

A class store can supply prototype methods; a factory can return a readonly
tuple or record of stable closures. Both are valid if identity is stable and
cleanup is correct.

## SSR, errors, and transitions

`getServerSnapshot` must match the value used for hydration. Delay DOM and
browser event sources until client lifecycle. Decide whether Observable errors
become view state, reach an error boundary through framework state, or are
reported terminally; a thrown async observer callback is not automatically a
React error-boundary error.

Test Strict Mode-compatible mount/cleanup/remount behavior, stale closures,
overlapping reads, source identity changes, SSR snapshot equality, and final
listener/source teardown.
