# RxJS 7 common production patterns

These are starting shapes, not operator recipes. Preserve the domain's actual
lifecycle, concurrency, error, and retention requirements.

## Stable derived state

```ts
const visibleItems$ = combineLatest([items$, filter$]).pipe(
  map(([items, filter]) => items.filter((item) => matches(item, filter))),
  distinctUntilChanged(shallowArrayEqual)
);
```

Do not add `shareReplay(1)` merely because multiple consumers might exist.
Add sharing only after defining producer cost, retention, and reset policy.

## Event-driven state machine

```ts
type CounterEvent = { type: 'increment' } | { type: 'reset' };

const count$ = events$.pipe(
  scan((count, event) => (event.type === 'reset' ? 0 : count + 1), 0),
  startWith(0)
);
```

Keep reducer state immutable when consumers rely on referential comparison.

## Read after a trigger

```ts
const profile$ = refresh$.pipe(
  startWith(undefined),
  switchMap(() => api.loadProfile())
);
```

This explicitly makes newer refreshes replace older reads. Use `exhaustMap`
instead only if refresh clicks during an active read should be ignored.

## Ordered writes

```ts
const persisted$ = edits$.pipe(concatMap((edit) => api.persist(edit)));
```

If edits are high-rate, first decide whether to coalesce, reject, batch, or
bound them. A queue is a product decision, not free storage.

## Explicit shared replay

```ts
const liveProfile$ = profileUpdates$.pipe(
  share({
    connector: () => new ReplaySubject<Profile>(1),
    resetOnError: true,
    resetOnComplete: true,
    resetOnRefCountZero: true,
  })
);
```

This replays within the active consumer group and releases the connector when
the last consumer leaves. Change reset flags only for a documented cache or
restart contract.

## Imperative event ingress, Observable output

Class and closure-backed factory forms are both strong ownership boundaries.
The class exposes shared prototype methods:

```ts
class SearchModel {
  private readonly queryInput = new Subject<string>();

  readonly results$ = this.queryInput.pipe(
    debounceTime(150),
    distinctUntilChanged(),
    switchMap((query) => this.api.search(query))
  );

  setQuery(query: string): void {
    this.queryInput.next(query);
  }

  constructor(private readonly api: SearchApi) {}
}
```

Keep the Subject private. Public callers receive a named command method and a
read-only Observable contract.

A functional factory can expose the same authority as a readonly tuple:

```ts
function createSearch(api: SearchApi) {
  const queryInput = new Subject<string>();

  const results$ = queryInput.pipe(
    debounceTime(150),
    distinctUntilChanged(),
    switchMap((query) => api.search(query))
  );

  const setQuery = (query: string) => queryInput.next(query);

  return [setQuery, results$] as const;
}
```

The closure keeps the Subject private, the tuple keeps command/result order
and types readonly, and callers can destructure a compact capability boundary.
Choose the form that best fits the surrounding API. A class shares prototype
method implementations across instances; the functional form allocates its
command closure per factory call. That can make the class slightly more
efficient in some runtimes when many instances exist, but measure before
making performance the deciding factor.

## Resource wrapper

```ts
function observeMessages(url: string): Observable<MessageEvent> {
  return new Observable((subscriber) => {
    const socket = new WebSocket(url);
    const onMessage = (event: MessageEvent) => subscriber.next(event);
    const onError = () => subscriber.error(new Error('Socket failed'));
    const onClose = () => subscriber.complete();

    socket.addEventListener('message', onMessage);
    socket.addEventListener('error', onError);
    socket.addEventListener('close', onClose);

    return () => {
      socket.removeEventListener('message', onMessage);
      socket.removeEventListener('error', onError);
      socket.removeEventListener('close', onClose);
      socket.close();
    };
  });
}
```

Use built-in creation functions when they express the boundary completely.
Write a wrapper when producer setup, terminal behavior, and resource release
need one explicit contract.

## Promise conversion with settlement proof

```ts
const status = await firstValueFrom(status$.pipe(timeout({ first: 5_000 }), take(1)));
```

`firstValueFrom` needs an emission, completion/default, error, or cancellation
bound. `lastValueFrom` additionally needs completion. Without those bounds the
awaiting stack can remain retained indefinitely.

## Readability boundary

Extract domain policy, not random operator fragments:

```ts
function saveInOrder<T, R>(save: (value: T) => ObservableInput<R>) {
  return (source: Observable<T>) => source.pipe(concatMap(save));
}

const savedOrders$ = orders$.pipe(saveInOrder(saveOrder));
```

The name communicates why ordering exists. Keep one-off pipelines local when
extraction would add indirection without a reusable policy.
