# Vue 3.5

Create the subscription once inside the owning component or effect scope and
register cleanup with that scope. Expose view state through `ref`,
`shallowRef`, or `computed`; do not subscribe from a computed getter.

```ts
function useObservable<T>(source: Observable<T>, initial: T) {
  const value = shallowRef(initial);
  const controller = new AbortController();

  source.subscribe((next) => (value.value = next), { signal: controller.signal });
  onScopeDispose(() => controller.abort());
  return readonly(value);
}
```

That is RxJS 9 ownership. For RxJS 7, retain the returned `Subscription` and
unsubscribe on scope disposal.

When reactive inputs select a stream, make switching policy explicit. A stale
read may use `switchMap`/`.switchMap()`. State-changing commands should queue
by default. Use watcher cleanup to cancel work created directly by a watcher;
do not leave an inner subscription detached.

For SSR, avoid browser sources during setup on the server, provide an initial
value that hydrates consistently, and decide whether a shared service source
belongs to the request, application, or component scope. Test nested effect
scope disposal, remount, late shared consumers, and error-to-state behavior.
