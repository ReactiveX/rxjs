[API](../../index.md) / [index](../index.md) / fromEvent

# Function: fromEvent()

> Creates an Observable that emits events of a specific type coming from the
> given event target.

## Description

<span class="informal">Creates an Observable from DOM events, or Node.js
EventEmitter events or others.</span>

![](fromEvent.png)

`fromEvent` accepts as a first argument event target, which is an object with methods
for registering event handler functions. As a second argument it takes string that indicates
type of event we want to listen for. `fromEvent` supports selected types of event targets,
which are described in detail below. If your event target does not match any of the ones listed,
you should use [fromEventPattern](fromEventPattern.md), which can be used on arbitrary APIs.
When it comes to APIs supported by `fromEvent`, their methods for adding and removing event
handler functions have different names, but they all accept a string describing event type
and function itself, which will be called whenever said event happens.

Every time resulting Observable is subscribed, event handler function will be registered
to event target on given event type. When that event fires, value
passed as a first argument to registered function will be emitted by output Observable.
When Observable is unsubscribed, function will be unregistered from event target.

Note that if event target calls registered function with more than one argument, second
and following arguments will not appear in resulting stream. In order to get access to them,
you can pass to `fromEvent` optional project function, which will be called with all arguments
passed to event handler. Output Observable will then emit value returned by project function,
instead of the usual value.

Remember that event targets listed below are checked via duck typing. It means that
no matter what kind of object you have and no matter what environment you work in,
you can safely use `fromEvent` on that object if it exposes described methods (provided
of course they behave as was described above). So for example if Node.js library exposes
event target which has the same method names as DOM EventTarget, `fromEvent` is still
a good choice.

If the API you use is more callback then event handler oriented (subscribed
callback function fires only once and thus there is no need to manually
unregister it), you should use [bindCallback](bindCallback.md) or [bindNodeCallback](bindNodeCallback.md)
instead.

`fromEvent` supports following types of event targets:

**DOM EventTarget**

This is an object with `addEventListener` and `removeEventListener` methods.

In the browser, `addEventListener` accepts - apart from event type string and event
handler function arguments - optional third parameter, which is either an object or boolean,
both used for additional configuration how and when passed function will be called. When
`fromEvent` is used with event target of that type, you can provide this values
as third parameter as well.

**Node.js EventEmitter**

An object with `addListener` and `removeListener` methods.

**JQuery-style event target**

An object with `on` and `off` methods

**DOM NodeList**

List of DOM Nodes, returned for example by `document.querySelectorAll` or `Node.childNodes`.

Although this collection is not event target in itself, `fromEvent` will iterate over all Nodes
it contains and install event handler function in every of them. When returned Observable
is unsubscribed, function will be removed from all Nodes.

**DOM HtmlCollection**

Just as in case of NodeList it is a collection of DOM nodes. Here as well event handler function is
installed and removed in each of elements.

## Examples

Emit clicks happening on the DOM document

```ts
import { fromEvent } from 'rxjs';

const clicks = fromEvent(document, 'click');
clicks.subscribe(x => console.log(x));

// Results in:
// MouseEvent object logged to console every time a click
// occurs on the document.
```

Use `addEventListener` with capture option

```ts
import { fromEvent } from 'rxjs';

const div = document.createElement('div');
div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
document.body.appendChild(div);

// note optional configuration parameter which will be passed to addEventListener
const clicksInDocument = fromEvent(document, 'click', { capture: true });
const clicksInDiv = fromEvent(div, 'click');

clicksInDocument.subscribe(() => console.log('document'));
clicksInDiv.subscribe(() => console.log('div'));

// By default events bubble UP in DOM tree, so normally
// when we would click on div in document
// "div" would be logged first and then "document".
// Since we specified optional `capture` option, document
// will catch event when it goes DOWN DOM tree, so console
// will log "document" and then "div".
```

## See

 - [bindCallback](bindCallback.md)
 - [bindNodeCallback](bindNodeCallback.md)
 - [fromEventPattern](fromEventPattern.md)


NodeList or HTMLCollection to attach the event handler to.




`addEventListener` or `on` functions.


arguments from the event handler and should return a single value.

## Parameters

### `target`

The DOM EventTarget, Node.js EventEmitter, JQuery-like event target,

### `eventName`

The event name of interest, being emitted by the `target`.

### `options`

Options to pass through to the underlying `addListener`,

### `resultSelector`

A mapping function used to transform events. It takes the


## Returns

`An`

Observable emitting events registered through 's listener handlers.


## Call Signature

```ts
function fromEvent<>(target: 
  | HasEventTargetAddRemove<T>
| ArrayLike<HasEventTargetAddRemove<T>>, eventName: string): Observable<T>;
```

Defined in: [internal/observable/fromEvent.ts:63](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/fromEvent.ts#L63)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | \| `HasEventTargetAddRemove`\<`T`\> \| `ArrayLike`\<`HasEventTargetAddRemove`\<`T`\>\> |
| `eventName` | `string` |

### Returns

[`Observable`](../classes/Observable.md)\<`T`\>

## Call Signature

```ts
function fromEvent<>(
   target: 
  | HasEventTargetAddRemove<T>
  | ArrayLike<HasEventTargetAddRemove<T>>, 
   eventName: string, 
resultSelector: (event: T) => R): Observable<R>;
```

Defined in: [internal/observable/fromEvent.ts:64](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/fromEvent.ts#L64)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | \| `HasEventTargetAddRemove`\<`T`\> \| `ArrayLike`\<`HasEventTargetAddRemove`\<`T`\>\> |
| `eventName` | `string` |
| `resultSelector` | (`event`: `T`) => `R` |

### Returns

[`Observable`](../classes/Observable.md)\<`R`\>

## Call Signature

```ts
function fromEvent<>(
   target: 
  | HasEventTargetAddRemove<T>
  | ArrayLike<HasEventTargetAddRemove<T>>, 
   eventName: string, 
options: EventListenerOptions): Observable<T>;
```

Defined in: [internal/observable/fromEvent.ts:69](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/fromEvent.ts#L69)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | \| `HasEventTargetAddRemove`\<`T`\> \| `ArrayLike`\<`HasEventTargetAddRemove`\<`T`\>\> |
| `eventName` | `string` |
| `options` | `EventListenerOptions` |

### Returns

[`Observable`](../classes/Observable.md)\<`T`\>

## Call Signature

```ts
function fromEvent<>(
   target: 
  | HasEventTargetAddRemove<T>
  | ArrayLike<HasEventTargetAddRemove<T>>, 
   eventName: string, 
   options: EventListenerOptions, 
resultSelector: (event: T) => R): Observable<R>;
```

Defined in: [internal/observable/fromEvent.ts:74](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/fromEvent.ts#L74)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | \| `HasEventTargetAddRemove`\<`T`\> \| `ArrayLike`\<`HasEventTargetAddRemove`\<`T`\>\> |
| `eventName` | `string` |
| `options` | `EventListenerOptions` |
| `resultSelector` | (`event`: `T`) => `R` |

### Returns

[`Observable`](../classes/Observable.md)\<`R`\>

## Call Signature

```ts
function fromEvent(target: NodeStyleEventEmitter | ArrayLike<NodeStyleEventEmitter>, eventName: string): Observable<unknown>;
```

Defined in: [internal/observable/fromEvent.ts:81](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/fromEvent.ts#L81)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | `NodeStyleEventEmitter` \| `ArrayLike`\<`NodeStyleEventEmitter`\> |
| `eventName` | `string` |

### Returns

[`Observable`](../classes/Observable.md)\<`unknown`\>

## Call Signature

```ts
function fromEvent<>(target: NodeStyleEventEmitter | ArrayLike<NodeStyleEventEmitter>, eventName: string): Observable<T>;
```

Defined in: [internal/observable/fromEvent.ts:83](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/fromEvent.ts#L83)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | `NodeStyleEventEmitter` \| `ArrayLike`\<`NodeStyleEventEmitter`\> |
| `eventName` | `string` |

### Returns

[`Observable`](../classes/Observable.md)\<`T`\>

### Deprecated

Do not specify explicit type parameters. Signatures with type parameters that cannot be inferred will be removed in v8.

## Call Signature

```ts
function fromEvent<>(
   target: NodeStyleEventEmitter | ArrayLike<NodeStyleEventEmitter>, 
   eventName: string, 
resultSelector: (...args: any[]) => R): Observable<R>;
```

Defined in: [internal/observable/fromEvent.ts:84](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/fromEvent.ts#L84)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | `NodeStyleEventEmitter` \| `ArrayLike`\<`NodeStyleEventEmitter`\> |
| `eventName` | `string` |
| `resultSelector` | (...`args`: `any`[]) => `R` |

### Returns

[`Observable`](../classes/Observable.md)\<`R`\>

## Call Signature

```ts
function fromEvent(target: 
  | NodeCompatibleEventEmitter
| ArrayLike<NodeCompatibleEventEmitter>, eventName: string): Observable<unknown>;
```

Defined in: [internal/observable/fromEvent.ts:90](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/fromEvent.ts#L90)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | \| `NodeCompatibleEventEmitter` \| `ArrayLike`\<`NodeCompatibleEventEmitter`\> |
| `eventName` | `string` |

### Returns

[`Observable`](../classes/Observable.md)\<`unknown`\>

## Call Signature

```ts
function fromEvent<>(target: 
  | NodeCompatibleEventEmitter
| ArrayLike<NodeCompatibleEventEmitter>, eventName: string): Observable<T>;
```

Defined in: [internal/observable/fromEvent.ts:95](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/fromEvent.ts#L95)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | \| `NodeCompatibleEventEmitter` \| `ArrayLike`\<`NodeCompatibleEventEmitter`\> |
| `eventName` | `string` |

### Returns

[`Observable`](../classes/Observable.md)\<`T`\>

### Deprecated

Do not specify explicit type parameters. Signatures with type parameters that cannot be inferred will be removed in v8.

## Call Signature

```ts
function fromEvent<>(
   target: 
  | NodeCompatibleEventEmitter
  | ArrayLike<NodeCompatibleEventEmitter>, 
   eventName: string, 
resultSelector: (...args: any[]) => R): Observable<R>;
```

Defined in: [internal/observable/fromEvent.ts:96](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/fromEvent.ts#L96)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | \| `NodeCompatibleEventEmitter` \| `ArrayLike`\<`NodeCompatibleEventEmitter`\> |
| `eventName` | `string` |
| `resultSelector` | (...`args`: `any`[]) => `R` |

### Returns

[`Observable`](../classes/Observable.md)\<`R`\>

## Call Signature

```ts
function fromEvent<>(target: 
  | JQueryStyleEventEmitter<any, T>
| ArrayLike<JQueryStyleEventEmitter<any, T>>, eventName: string): Observable<T>;
```

Defined in: [internal/observable/fromEvent.ts:102](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/fromEvent.ts#L102)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | \| `JQueryStyleEventEmitter`\<`any`, `T`\> \| `ArrayLike`\<`JQueryStyleEventEmitter`\<`any`, `T`\>\> |
| `eventName` | `string` |

### Returns

[`Observable`](../classes/Observable.md)\<`T`\>

## Call Signature

```ts
function fromEvent<>(
   target: 
  | JQueryStyleEventEmitter<any, T>
  | ArrayLike<JQueryStyleEventEmitter<any, T>>, 
   eventName: string, 
resultSelector: (value: T, ...args: any[]) => R): Observable<R>;
```

Defined in: [internal/observable/fromEvent.ts:106](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/fromEvent.ts#L106)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | \| `JQueryStyleEventEmitter`\<`any`, `T`\> \| `ArrayLike`\<`JQueryStyleEventEmitter`\<`any`, `T`\>\> |
| `eventName` | `string` |
| `resultSelector` | (`value`: `T`, ...`args`: `any`[]) => `R` |

### Returns

[`Observable`](../classes/Observable.md)\<`R`\>
