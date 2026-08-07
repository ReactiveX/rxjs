# RxJS 7 review examples

## Detached request lifetime

```ts
// Before
routeIds$.subscribe((id) => {
  repository.load(id).subscribe(render);
});

// Candidate correction when newest route replaces the old request
const page$ = routeIds$.pipe(switchMap((id) => repository.load(id)));
```

Actionable finding: the inner request remains detached from the route
subscription's cancellation/error path and older results can overwrite the
new route. Use one higher-order chain and test overlapping request windows.

## Incorrect write replacement

```ts
// Before
const saved$ = saveClicks$.pipe(switchMap(() => saveDraft(snapshot())));

// Candidate correction when every save must finish in order
const saved$ = saveClicks$.pipe(concatMap(() => saveDraft(snapshot())));
```

The correction is only valid if queue growth is bounded. If saves may be
coalesced, state that different domain policy instead.

The same defect is especially subtle for delete-then-update-view code: the
server can complete every deletion while `switchMap` discards an earlier
success response, so the client never removes that item from its view.

## Outer recovery ends an interaction

```ts
// Before
const result$ = queries$.pipe(
  switchMap(search),
  catchError(() => of([]))
);
```

Finding: after one failed search, `of([])` emits once and completes; later
queries are ignored. Move recovery inside `switchMap` when each request is
independently recoverable.

## Public writable state

```ts
// Before
readonly state$ = new BehaviorSubject<State>(initialState);

// Candidate boundary
private readonly stateSubject = new BehaviorSubject(initialState);
readonly state$ = this.stateSubject.asObservable();
```

Finding: callers can bypass validation and terminate shared state. The
candidate narrows authority but does not by itself fix scattered mutable
transitions; review those separately.

## Unbounded Promise conversion

```ts
// Before
const ready = await firstValueFrom(state$);

// Candidate when only a ready state within five seconds is valid
const ready = await firstValueFrom(state$.pipe(filter(isReady), timeout({ first: 5_000 })));
```

Finding: the original can resolve with the wrong state or remain pending on a
silent source. The bound and predicate must come from the actual caller
contract.

## Incomplete custom operator

```ts
// Before
const double = () => (source: Observable<number>) =>
  new Observable<number>((subscriber) => {
    source.subscribe((value) => subscriber.next(value * 2));
  });
```

Finding: source error/completion and downstream unsubscription are not
forwarded. Prefer `map((value) => value * 2)`; if low-level construction is
required, forward the full protocol and return the source subscription.
