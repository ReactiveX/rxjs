# RxJS 7 good and bad examples

Use these pairs as review prompts. The good form is not universal; it makes the
important policy visible so it can be checked against the product requirement.

## Subscribe once at the owner boundary

```ts
// Good: replacement and ownership are expressed in the stream.
const result$ = selectedId$.pipe(switchMap((id) => repository.load(id)));
```

```ts
// Bad: detached work, detached errors, and stale results can race.
selectedId$.subscribe((id) => {
  repository.load(id).subscribe((result) => render(result));
});
```

## Choose concurrency from the requirement

```ts
// Good: writes must retain order, so they are queued.
const saved$ = saveRequests$.pipe(concatMap((request) => repository.save(request)));
```

```ts
// Bad: switchMap cancels an earlier save when a later request arrives.
const saved$ = saveRequests$.pipe(switchMap((request) => repository.save(request)));
```

## Keep recoverable errors local

```ts
// Good: a failed refresh produces state for that refresh; later refreshes
// remain active.
const state$ = refresh$.pipe(
  switchMap(() =>
    repository.load().pipe(
      map((value) => ({ kind: 'ready' as const, value })),
      catchError((error) => of({ kind: 'failed' as const, error }))
    )
  )
);
```

```ts
// Bad for a persistent UI: one request error completes the outer interaction.
const state$ = refresh$.pipe(
  switchMap(() => repository.load()),
  catchError(() => EMPTY)
);
```

## Make sharing policy explicit

```ts
// Good when the stated contract is one shared producer, one retained value,
// retry after error, stable completed result, and disconnect while incomplete.
const settings$ = loadSettings().pipe(
  share({
    connector: () => new ReplaySubject<Settings>(1),
    resetOnError: true,
    resetOnComplete: false,
    resetOnRefCountZero: true,
  })
);
```

```ts
// Bad: "cache it" does not define lifetime, reset, or retention.
const settings$ = loadSettings().pipe(shareReplay(1));
```

## Expose reads, own writes

```ts
// Good: the class owns validation and write authority.
private readonly updates = new Subject<Update>();
readonly updates$ = this.updates.asObservable();
```

```ts
// Bad: any consumer can emit, error, or complete shared state.
readonly updates$ = new Subject<Update>();
```

## Bound Promise conversion

```ts
// Good: the first ready value or a timeout settles the Promise.
const value = await firstValueFrom(state$.pipe(filter(isReady), timeout({ first: 5_000 })));
```

```ts
// Bad for a possibly silent source: the async function can remain suspended.
const value = await firstValueFrom(state$);
```

## Own custom resources

```ts
// Good: unsubscription removes the exact installed listener.
const visibility$ = new Observable<DocumentVisibilityState>((subscriber) => {
  const onChange = () => subscriber.next(document.visibilityState);
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
});
```

```ts
// Bad: the listener outlives the subscription.
const visibility$ = new Observable<DocumentVisibilityState>((subscriber) => {
  document.addEventListener('visibilitychange', () => subscriber.next(document.visibilityState));
});
```

## Compose custom operators from public operators

```ts
// Good: protocol and teardown behavior come from tested public operators.
function successful<T>(): OperatorFunction<Result<T>, T> {
  return pipe(
    filter((result): result is Success<T> => result.ok),
    map((result) => result.value)
  );
}
```

```ts
// Bad: internal helpers are not a public compatibility surface.
import { operate } from 'rxjs/internal/util/lift';
```

## Name domain policy

```ts
// Good: the extracted name explains why this exact timing policy exists.
const validAddressChanges$ = addressInput$.pipe(normalizePostalAddress(), distinctUntilChanged(equalPostalAddress), debounceTime(250));
```

```ts
// Bad: a dense generic chain forces every reviewer to rediscover the domain
// policy and makes future edits more fragile.
const value$ = input$.pipe(
  map((x) => x.trim()),
  filter(Boolean),
  distinctUntilChanged(),
  debounceTime(250),
  shareReplay(1)
);
```
