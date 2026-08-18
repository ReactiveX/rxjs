# RxJS 9 good and bad examples

Use each pair to expose policy for review. The good example is only good when
its stated lifecycle matches the product requirement.

## Prefer the platform method when its contract fits

```ts
// Good: no operator extension import or browser bundle bytes are needed.
const names = users.map((user) => user.name);
```

```ts
// Bad: importing the exact Symbol adds an extension when the platform contract
// already fits this platform-lifecycle receiver.
import { map } from 'rxjs/map';
const names = users[map]((user) => user.name);
```

The Symbol form is correct when its semantics differ or a `ColdObservable`
result must remain producer-per-subscription. An unrelated `Symbol('map')` is
never a substitute for the exported exact key.

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
// Good: platform flatMap runs one write at a time and retains input order.
const saved = writes.flatMap(persist);
```

```ts
// Bad: stale-work replacement can abort a required write.
const saved = writes.switchMap(persist);
```

If each delete response removes an item from the client view, the bad form can
discard an earlier response even though the server completed that deletion.
Use `[mergeMap]` only when parallelization is intentional, and `[exhaustMap]`
when an action such as “Place order” must be locked until it settles.

## Recover at the correct scope

```ts
// Good: later searches survive one failed request.
const results = queries.switchMap((query) => search(query).catch((error) => Observable.from([{ error }])));
```

```ts
// Bad for a long-lived interaction: it ends after the first request failure.
const results = queries.switchMap(search).catch(() => Observable.from([]));
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

A readonly tuple factory is also a good narrow boundary:

```ts
function createUpdates() {
  const updates = new Subject<Update>();
  return [(update: Update) => updates.next(update), updates.asObservable()] as const;
}
```

Do not require a class when the tuple is the clearer API. Prefer a class when
shared prototype methods or object identity matter; measure any allocation or
dispatch difference in the target runtime.

## Compose domain policy before defining a Symbol

```ts
// Good for local reuse: no prototype extension is required.
const accepted = () => (source: Observable<Event>) => source.filter((event) => event.accepted);

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

```ts
// Good for a deliberately fluent public library API.
import { create } from 'rxjs/create';

export const accepted: unique symbol = Symbol('accepted');

declare global {
  interface Observable<T> {
    [accepted](this: Observable<Event>): Observable<Event>;
  }
}

Observable.prototype[accepted] = function (this: Observable<Event>) {
  return this[create]<Event>((subscriber) => {
    try {
      this.subscribe(
        {
          next: (event) => {
            if (event.accepted) subscriber.next(event);
          },
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );
    } catch (error) {
      subscriber.error(error);
    }
  });
};
```

The module import establishes both installation and Symbol identity. `[create]`
preserves the receiver's construction policy, and forwarding the output signal
ties upstream observation to downstream cancellation.

```ts
// Bad: unrelated packages or incompatible versions can share and overwrite
// this global-registry slot.
export const accepted = Symbol.for('accepted');
```

Use `Symbol.for()` only with a namespaced, version-aware public protocol that
defines duplicate installation, compatibility, property overwrite/refusal,
and cross-realm behavior. A descriptive registry key alone is unsafe.

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
