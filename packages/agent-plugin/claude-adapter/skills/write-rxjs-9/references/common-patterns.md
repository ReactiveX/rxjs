# Common RxJS 9 patterns

These recipes expose lifecycle and policy. Adjust them to the product rather
than copying operator sequences blindly.

## Replace stale reads

```ts
import { debounce } from 'rxjs/debounce';
import { distinctUntilChanged } from 'rxjs/distinct-until-changed';

const queries = input
  .when('input')
  .map(() => input.value.trim())
  [debounce](200)
  [distinctUntilChanged]();

const results = queries.switchMap((query) => api.search(query));
```

The newest query replaces the previous request. The platform source and its
derived platform Observables share one active producer among concurrent UI
observers.

## Queue ordered writes by default

The platform `.flatMap()` method queues one inner at a time:

```ts
const saved = saveRequests.flatMap((request) => repository.save(request));
```

This is the safe, easy-to-reason-about starting point. Do not substitute
`.switchMap()` for writes that must finish, or unbounded `[mergeMap]` for work
with a fixed resource budget.

## Bound intentional overlap

```ts
import { mergeMap } from 'rxjs/merge-map';

const thumbnails = imageRequests[mergeMap](renderThumbnail, {
  concurrent: 4,
});
```

State what the buffer can retain if input can arrive faster than four tasks
complete.

## Build state from events

```ts
import { distinctUntilChanged } from 'rxjs/distinct-until-changed';
import { scan } from 'rxjs/scan';

type CounterEvent = { type: 'incremented' } | { type: 'reset'; value: number };

const count = events[scan]((count, event: CounterEvent) => (event.type === 'incremented' ? count + 1 : event.value), 0)[
  distinctUntilChanged
]();
```

This keeps transition policy in one reducer instead of distributing
read-modify-write calls across Subject users.

## Sample state only when triggered

```ts
import { withLatestFrom } from 'rxjs/with-latest-from';

const submissions = submitClicks[withLatestFrom]([formState], (_click, state) => state);
```

The trigger controls emission. If both inputs should independently cause an
emission, use `combineLatest` and document its initial-value requirement.

## Keep event ingress private

A class is a good boundary when an object identity and shared prototype methods
fit the surrounding design:

```ts
import { Subject } from 'rxjs';

class RefreshController {
  readonly #refreshRequests = new Subject<void>();
  readonly refreshRequests = this.#refreshRequests.asObservable();

  refresh(): void {
    this.#refreshRequests.next(undefined);
  }
}
```

Consumers can observe but cannot inject values or terminate the controller's
event source.

A functional factory can provide the same encapsulation with a readonly tuple:

```ts
import { debounce } from 'rxjs/debounce';
import { distinctUntilChanged } from 'rxjs/distinct-until-changed';
function createSearch(api: SearchApi) {
  const queryInput = new Subject<string>();

  const results = queryInput[debounce](150)
    [distinctUntilChanged]()
    .switchMap((query) => api.search(query));

  const setQuery = (query: string) => queryInput.next(query);

  return [setQuery, results] as const;
}
```

The factory creates a command closure per call; a class can share method
implementations on its prototype and may be slightly more efficient for large
instance counts in some runtimes. Treat that as a measurable tradeoff, not a
universal reason to reject the functional form.

## Wrap a resource with signal ownership

```ts
function messages(socket: WebSocket): Observable<MessageEvent> {
  return new Observable((subscriber) => {
    const next = (event: MessageEvent) => subscriber.next(event);
    const error = () => subscriber.error(new Error('WebSocket failed'));
    const complete = () => subscriber.complete();

    socket.addEventListener('message', next);
    socket.addEventListener('error', error);
    socket.addEventListener('close', complete);

    subscriber.addTeardown(() => {
      socket.removeEventListener('message', next);
      socket.removeEventListener('error', error);
      socket.removeEventListener('close', complete);
    });
  });
}
```

Use `EventTarget.when()` for ordinary DOM events and `fromEventPattern` for
callback APIs when those public adapters already fit.

## Consume one bounded value

```ts
import { timeout } from 'rxjs/timeout';

const readyState = await states.filter(isReadyState)[timeout]({ first: 5_000 }).first();
```

The platform Promise method `first()` is string-named and accepts an optional
subscription signal. It is not the RxJS `[first]` Observable operator.

## Extract readable domain transformations

```ts
import { pipe } from 'rxjs/pipe';

const validReadings = () => (source: Observable<Reading>) => source.filter((reading) => reading.valid);

const toLabels = () => (source: Observable<Reading>) => source.map((reading) => reading.label);

const labels = readings[pipe](validReadings(), toLabels());
```

Use named transformations when a long chain hides domain intent. A new public
Symbol is unnecessary for an application-local policy.
