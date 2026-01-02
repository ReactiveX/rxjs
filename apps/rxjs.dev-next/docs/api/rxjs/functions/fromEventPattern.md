[API](../../index.md) / [rxjs](../index.md) / fromEventPattern

# Function: fromEventPattern()

> Creates an Observable from an arbitrary API for registering event handlers.

## Description

<span class="informal">When that method for adding event handler was something [fromEvent](fromEvent.md)
was not prepared for.</span>

![](/images/marble-diagrams/fromEventPattern.png)

`fromEventPattern` allows you to convert into an Observable any API that supports registering handler functions
for events. It is similar to [fromEvent](fromEvent.md), but far
more flexible. In fact, all use cases of [fromEvent](fromEvent.md) could be easily handled by
`fromEventPattern` (although in slightly more verbose way).

This operator accepts as a first argument an `addHandler` function, which will be injected with
handler parameter. That handler is actually an event handler function that you now can pass
to API expecting it. `addHandler` will be called whenever Observable
returned by the operator is subscribed, so registering handler in API will not
necessarily happen when `fromEventPattern` is called.

After registration, every time an event that we listen to happens,
Observable returned by `fromEventPattern` will emit value that event handler
function was called with. Note that if event handler was called with more
than one argument, second and following arguments will not appear in the Observable.

If API you are using allows to unregister event handlers as well, you can pass to `fromEventPattern`
another function - `removeHandler` - as a second parameter. It will be injected
with the same handler function as before, which now you can use to unregister
it from the API. `removeHandler` will be called when consumer of resulting Observable
unsubscribes from it.

In some APIs unregistering is actually handled differently. Method registering an event handler
returns some kind of token, which is later used to identify which function should
be unregistered or it itself has method that unregisters event handler.
If that is the case with your API, make sure token returned
by registering method is returned by `addHandler`. Then it will be passed
as a second argument to `removeHandler`, where you will be able to use it.

If you need access to all event handler parameters (not only the first one),
or you need to transform them in any way, you can call `fromEventPattern` with optional
third parameter - project function which will accept all arguments passed to
event handler when it is called. Whatever is returned from project function will appear on
resulting stream instead of usual event handlers first argument. This means
that default project can be thought of as function that takes its first parameter
and ignores the rest.

## Example

Emits clicks happening on the DOM document

```ts
import { fromEventPattern } from 'rxjs';

function addClickHandler(handler) {
  document.addEventListener('click', handler);
}

function removeClickHandler(handler) {
  document.removeEventListener('click', handler);
}

const clicks = fromEventPattern(addClickHandler, removeClickHandler);
clicks.subscribe((x) => console.log(x));

// Whenever you click anywhere in the browser, DOM MouseEvent
// object will be logged.
```

Use with API that returns cancellation token

```ts
import { fromEventPattern } from 'rxjs';

const token = someAPI.registerEventHandler(function () {});
someAPI.unregisterEventHandler(token); // this APIs cancellation method accepts
// not handler itself, but special token.

const someAPIObservable = fromEventPattern(
  function (handler) {
    return someAPI.registerEventHandler(handler);
  }, // Note that we return the token here...
  function (handler, token) {
    someAPI.unregisterEventHandler(token);
  } // ...to then use it here.
);
```

Use with project function

```ts
import { fromEventPattern } from 'rxjs';

someAPI.registerEventHandler((eventType, eventMessage) => {
  console.log(eventType, eventMessage); // Logs 'EVENT_TYPE' 'EVENT_MESSAGE' to console.
});

const someAPIObservable = fromEventPattern(
  handler => someAPI.registerEventHandler(handler),
  handler => someAPI.unregisterEventHandler(handler)
  (eventType, eventMessage) => eventType + ' --- ' + eventMessage // without that function only 'EVENT_TYPE'
);                                                                // would be emitted by the Observable

someAPIObservable.subscribe(value => console.log(value));

// Logs:
// 'EVENT_TYPE --- EVENT_MESSAGE'
```

## See

- [fromEvent](fromEvent.md)
- [bindCallback](bindCallback.md)
- [bindNodeCallback](bindNodeCallback.md)

somehow to the actual source of events.

it from the event source. If `addHandler` returns some kind of token, `removeHandler` function
will have it as a second parameter.

handler and should return a single value.

## Parameters

### `addHandler`

A function that takes a `handler` function as argument and attaches it

### `removeHandler`

A function that takes a `handler` function as an argument and removes

### `resultSelector`

A function to transform results. It takes the arguments from the event

## Returns

`Observable`

which, when an event happens, emits first parameter passed to registered event handler. Alternatively it emits whatever project function returns at that moment.

## Call Signature

```ts
function fromEventPattern<>(
  addHandler: (handler: NodeEventHandler) => any,
  removeHandler?: (handler: NodeEventHandler, signal?: any) => void
): Observable<T>;
```

Defined in: [rxjs/src/internal/observable/fromEventPattern.ts:5](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/fromEventPattern.ts#L5)

### Parameters

| Parameter        | Type                                                        |
| ---------------- | ----------------------------------------------------------- |
| `addHandler`     | (`handler`: `NodeEventHandler`) => `any`                    |
| `removeHandler?` | (`handler`: `NodeEventHandler`, `signal?`: `any`) => `void` |

### Returns

[`Observable`](../classes/Observable.md)\<`T`\>

## Call Signature

```ts
function fromEventPattern<>(
  addHandler: (handler: NodeEventHandler) => any,
  removeHandler?: (handler: NodeEventHandler, signal?: any) => void,
  resultSelector?: (...args: any[]) => T
): Observable<T>;
```

Defined in: [rxjs/src/internal/observable/fromEventPattern.ts:9](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/fromEventPattern.ts#L9)

### Parameters

| Parameter         | Type                                                        |
| ----------------- | ----------------------------------------------------------- |
| `addHandler`      | (`handler`: `NodeEventHandler`) => `any`                    |
| `removeHandler?`  | (`handler`: `NodeEventHandler`, `signal?`: `any`) => `void` |
| `resultSelector?` | (...`args`: `any`[]) => `T`                                 |

### Returns

[`Observable`](../classes/Observable.md)\<`T`\>
