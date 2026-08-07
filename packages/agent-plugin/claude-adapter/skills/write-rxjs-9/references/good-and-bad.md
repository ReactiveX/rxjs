# RxJS 9 good and bad examples

Use each pair to expose policy for review. The good example is only good when
its stated lifecycle matches the product requirement.

## Import exact Symbols

```ts
// Good: the import is the exact installed RxJS key.
import { map } from 'rxjs/map';
const names = users[map]((user) => user.name);
```

```ts
// Bad: an unrelated descriptive Symbol does not address the RxJS extension.
const map = Symbol('map');
const names = users[map]((user) => user.name);
```

## Choose platform or per-subscription production

```ts
// Good when concurrent observers should share one active socket producer.
const messages = new Observable<Message>((subscriber) => {
  const socket = connect();
  subscriber.addTeardown(() => socket.close());
  socket.onmessage = (message) => subscriber.next(message);
});
```

```ts
// Bad when each caller expected an independent socket: platform observers of
// this instance share its current active producer.
const messages = new Observable<Message>(openIndependentSocket);
```

Use `ColdObservable` for the second requirement and document duplicated work.

## Cancel with the owner signal

```ts
// Good: cancellation belongs to the request boundary.
const controller = new AbortController();
results.subscribe(render, { signal: controller.signal });
request.signal.addEventListener('abort', () => controller.abort(), { once: true });
```

```ts
// Bad: platform subscribe returns undefined, not a Subscription.
const subscription = results.subscribe(render);
subscription.unsubscribe();
```

## Register teardown

```ts
// Good: the platform Subscriber owns the timer.
const clock = new Observable<number>((subscriber) => {
  const id = setInterval(() => subscriber.next(Date.now()), 1_000);
  subscriber.addTeardown(() => clearInterval(id));
});
```

```ts
// Bad: returning teardown is RxJS 7 constructor behavior.
const clock = new Observable<number>((subscriber) => {
  const id = setInterval(() => subscriber.next(Date.now()), 1_000);
  return () => clearInterval(id);
});
```

## Queue writes explicitly

```ts
// Good: one write runs at a time and input order is retained.
const saved = writes[mergeMap](persist, { concurrent: 1 });
```

```ts
// Bad: stale-work replacement can abort a required write.
const saved = writes[switchMap](persist);
```

## Recover at the correct scope

```ts
// Good: later searches survive one failed request.
const results = queries[switchMap]((query) => search(query)[catchError]((error) => Observable.from([{ error }])));
```

```ts
// Bad for a long-lived interaction: it ends after the first request failure.
const results = queries[switchMap](search)[catchError](() => Observable.from([]));
```

## Respect the input boundary

```ts
// Good: Observable.from supports async iterables.
const lines = Observable.from(readLines());
```

```ts
// Bad: an arbitrary legacy subscribable is not a platform ObservableValue.
const source = Observable.from({
  subscribe(observer) {
    /* ... */
  },
});
```

## Keep Subject writes private

```ts
// Good: consumers receive an immutable Observable view.
readonly #updates = new Subject<Update>();
readonly updates = this.#updates.asObservable();
```

```ts
// Bad: every consumer can inject or terminate shared state.
readonly updates = new Subject<Update>();
```

## Compose domain policy before defining a Symbol

```ts
// Good for local reuse: no prototype extension is required.
const accepted = () => (source: Observable<Event>) => source[filter]((event) => event.accepted);

const events = input[pipe](accepted());
```

```ts
// Bad: a string patch collides with the platform surface.
Observable.prototype.accepted = function () {
  /* ... */
};
```

If a fluent public library API is warranted, export and install an exact
module-owned Symbol and construct through public `[create]`.

## Do not assume replay on late platform observers

```ts
// Good: document that late platform observers join from subscription time.
const stateChanges = new Observable<State>(startStateProducer);
```

```ts
// Bad assumption: adding [shareReplay] does not force the platform initializer
// to rerun for each late concurrent observer.
const currentStateForEveryone = stateChanges[shareReplay](1);
```

Use an intentional current-state or per-direct-observer API when every late
observer must receive retained state.
