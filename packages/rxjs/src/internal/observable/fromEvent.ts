import type { Subscriber } from '@rxjs/observable';
import { Observable, isArrayLike, isFunction } from '@rxjs/observable';
import { mapOneOrManyArgs } from '../util/mapOneOrManyArgs.js';

// These constants are used to create handler registry functions using array mapping below.
const nodeEventEmitterMethods = ['addListener', 'removeListener'] as const;
const eventTargetMethods = ['addEventListener', 'removeEventListener'] as const;
const jqueryMethods = ['on', 'off'] as const;

export interface NodeStyleEventEmitter {
  addListener(eventName: string | symbol, handler: NodeEventHandler): this;
  removeListener(eventName: string | symbol, handler: NodeEventHandler): this;
}

export type NodeEventHandler = (...args: any[]) => void;

// For APIs that implement `addListener` and `removeListener` methods that may
// not use the same arguments or return EventEmitter values
// such as React Native
export interface NodeCompatibleEventEmitter {
  // this should probably be `void | unknown` eventually
  // eslint-disable-next-line @typescript-eslint/ban-types
  addListener(eventName: string, handler: NodeEventHandler): void | {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  removeListener(eventName: string, handler: NodeEventHandler): void | {};
}

// Use handler types like those in @types/jquery. See:
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/847731ba1d7fa6db6b911c0e43aa0afe596e7723/types/jquery/misc.d.ts#L6395
export interface JQueryStyleEventEmitter<TContext, T> {
  on(eventName: string, handler: (this: TContext, t: T, ...args: any[]) => any): void;
  off(eventName: string, handler: (this: TContext, t: T, ...args: any[]) => any): void;
}

export interface EventListenerObject<E> {
  handleEvent(evt: E): void;
}

export interface HasEventTargetAddRemove<E> {
  addEventListener(
    type: string,
    listener: ((evt: E) => void) | EventListenerObject<E> | null,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: ((evt: E) => void) | EventListenerObject<E> | null,
    options?: EventListenerOptions | boolean
  ): void;
}

export interface EventListenerOptions {
  capture?: boolean;
  passive?: boolean;
  once?: boolean;
}

export interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean;
  passive?: boolean;
}

export function fromEvent<T>(target: HasEventTargetAddRemove<T> | ArrayLike<HasEventTargetAddRemove<T>>, eventName: string): Observable<T>;
export function fromEvent<T, R>(
  target: HasEventTargetAddRemove<T> | ArrayLike<HasEventTargetAddRemove<T>>,
  eventName: string,
  resultSelector: (event: T) => R
): Observable<R>;
export function fromEvent<T>(
  target: HasEventTargetAddRemove<T> | ArrayLike<HasEventTargetAddRemove<T>>,
  eventName: string,
  options: EventListenerOptions
): Observable<T>;
export function fromEvent<T, R>(
  target: HasEventTargetAddRemove<T> | ArrayLike<HasEventTargetAddRemove<T>>,
  eventName: string,
  options: EventListenerOptions,
  resultSelector: (event: T) => R
): Observable<R>;

export function fromEvent(
  target: NodeStyleEventEmitter | ArrayLike<NodeStyleEventEmitter>,
  eventName: string | symbol
): Observable<unknown>;
export function fromEvent<T>(target: NodeStyleEventEmitter | ArrayLike<NodeStyleEventEmitter>, eventName: string | symbol): Observable<T>;
export function fromEvent<R>(
  target: NodeStyleEventEmitter | ArrayLike<NodeStyleEventEmitter>,
  eventName: string | symbol,
  resultSelector: (...args: any[]) => R
): Observable<R>;

export function fromEvent(
  target: NodeCompatibleEventEmitter | ArrayLike<NodeCompatibleEventEmitter>,
  eventName: string
): Observable<unknown>;
export function fromEvent<T>(target: NodeCompatibleEventEmitter | ArrayLike<NodeCompatibleEventEmitter>, eventName: string): Observable<T>;
export function fromEvent<R>(
  target: NodeCompatibleEventEmitter | ArrayLike<NodeCompatibleEventEmitter>,
  eventName: string,
  resultSelector: (...args: any[]) => R
): Observable<R>;

export function fromEvent<T>(
  target: JQueryStyleEventEmitter<any, T> | ArrayLike<JQueryStyleEventEmitter<any, T>>,
  eventName: string
): Observable<T>;
export function fromEvent<T, R>(
  target: JQueryStyleEventEmitter<any, T> | ArrayLike<JQueryStyleEventEmitter<any, T>>,
  eventName: string,
  resultSelector: (value: T, ...args: any[]) => R
): Observable<R>;

/**
 * Creates an Observable that emits events of a specific type coming from the
 * given event target.
 *
 * <span class="informal">Creates an Observable from DOM events, or Node.js
 * EventEmitter events or others.</span>
 *
 * ![](fromEvent.png)
 *
 * `fromEvent` accepts as a first argument event target, which is an object with methods
 * for registering event handler functions. As a second argument it takes string that indicates
 * type of event we want to listen for. `fromEvent` supports selected types of event targets,
 * which are described in detail below. If your event target does not match any of the ones listed,
 * you should use {@link fromEventPattern}, which can be used on arbitrary APIs.
 * When it comes to APIs supported by `fromEvent`, their methods for adding and removing event
 * handler functions have different names, but they all accept a string describing event type
 * and function itself, which will be called whenever said event happens.
 *
 * Every time resulting Observable is subscribed, event handler function will be registered
 * to event target on given event type. When that event fires, value
 * passed as a first argument to registered function will be emitted by output Observable.
 * When Observable is unsubscribed, function will be unregistered from event target.
 *
 * Note that if event target calls registered function with more than one argument, second
 * and following arguments will not appear in resulting stream. In order to get access to them,
 * you can pass to `fromEvent` optional project function, which will be called with all arguments
 * passed to event handler. Output Observable will then emit value returned by project function,
 * instead of the usual value.
 *
 * Remember that event targets listed below are checked via duck typing. It means that
 * no matter what kind of object you have and no matter what environment you work in,
 * you can safely use `fromEvent` on that object if it exposes described methods (provided
 * of course they behave as was described above). So for example if Node.js library exposes
 * event target which has the same method names as DOM EventTarget, `fromEvent` is still
 * a good choice.
 *
 * If the API you use is more callback then event handler oriented (subscribed
 * callback function fires only once and thus there is no need to manually
 * unregister it), you should use {@link bindCallback} or {@link bindNodeCallback}
 * instead.
 *
 * `fromEvent` supports following types of event targets:
 *
 * **DOM EventTarget**
 *
 * This is an object with `addEventListener` and `removeEventListener` methods.
 *
 * In the browser, `addEventListener` accepts - apart from event type string and event
 * handler function arguments - optional third parameter, which is either an object or boolean,
 * both used for additional configuration how and when passed function will be called. When
 * `fromEvent` is used with event target of that type, you can provide this values
 * as third parameter as well.
 *
 * **Node.js EventEmitter**
 *
 * An object with `addListener` and `removeListener` methods.
 *
 * **JQuery-style event target**
 *
 * An object with `on` and `off` methods
 *
 * **DOM NodeList**
 *
 * List of DOM Nodes, returned for example by `document.querySelectorAll` or `Node.childNodes`.
 *
 * Although this collection is not event target in itself, `fromEvent` will iterate over all Nodes
 * it contains and install event handler function in every of them. When returned Observable
 * is unsubscribed, function will be removed from all Nodes.
 *
 * **DOM HtmlCollection**
 *
 * Just as in case of NodeList it is a collection of DOM nodes. Here as well event handler function is
 * installed and removed in each of elements.
 *
 *
 * ## Examples
 *
 * Emit clicks happening on the DOM document
 *
 * ```ts
 * import { fromEvent } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * clicks.subscribe(x => console.log(x));
 *
 * // Results in:
 * // MouseEvent object logged to console every time a click
 * // occurs on the document.
 * ```
 *
 * Use `addEventListener` with capture option
 *
 * ```ts
 * import { fromEvent } from 'rxjs';
 *
 * const div = document.createElement('div');
 * div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
 * document.body.appendChild(div);
 *
 * // note optional configuration parameter which will be passed to addEventListener
 * const clicksInDocument = fromEvent(document, 'click', { capture: true });
 * const clicksInDiv = fromEvent(div, 'click');
 *
 * clicksInDocument.subscribe(() => console.log('document'));
 * clicksInDiv.subscribe(() => console.log('div'));
 *
 * // By default events bubble UP in DOM tree, so normally
 * // when we would click on div in document
 * // "div" would be logged first and then "document".
 * // Since we specified optional `capture` option, document
 * // will catch event when it goes DOWN DOM tree, so console
 * // will log "document" and then "div".
 * ```
 *
 * @see {@link bindCallback}
 * @see {@link bindNodeCallback}
 * @see {@link fromEventPattern}
 *
 * @param target The DOM EventTarget, Node.js EventEmitter, JQuery-like event target,
 * NodeList or HTMLCollection to attach the event handler to.
 * @param eventName The event name of interest, being emitted by the `target`.
 * @param options Options to pass through to the underlying `addListener`,
 * `addEventListener` or `on` functions.
 * @param resultSelector A mapping function used to transform events. It takes the
 * arguments from the event handler and should return a single value.
 * @return An Observable emitting events registered through `target`'s
 * listener handlers.
 */
export function fromEvent<T>(
  target: any,
  eventName: string | symbol,
  options?: EventListenerOptions | ((...args: any[]) => T),
  resultSelector?: (...args: any[]) => T
): Observable<T> {
  if (isFunction(options)) {
    resultSelector = options;
    options = undefined;
  }

  if (resultSelector) {
    return mapOneOrManyArgs(resultSelector)(fromEvent<T>(target, eventName as string, options as EventListenerOptions));
  }

  const isValidTarget = isNodeStyleEventEmitter(target) || isJQueryStyleEventEmitter(target) || isEventTarget(target);

  if (!isValidTarget && !isArrayLike(target)) {
    throw new TypeError('Invalid event target');
  }

  return new Observable<T>((subscriber) => {
    const handler = (...args: any[]) => subscriber.next(1 < args.length ? args : args[0]);
    if (isValidTarget) {
      // Valid event targets, even if they have a `length` property
      // will be subscribed to as a single item.
      doSubscribe(handler, subscriber, target, eventName, options);
    } else {
      // If it wasn't a valid event target, it must be an array-like.
      // Subscribe to each item in the array-like.
      for (let i = 0; i < target.length && !subscriber.closed; i++) {
        const subTarget = target[i];
        doSubscribe(handler, subscriber, subTarget, eventName, options);
      }
    }
  });
}

function doSubscribe(
  handler: (...args: any[]) => void,
  subscriber: Subscriber<any>,
  subTarget: any,
  eventName: string | symbol,
  options: any
) {
  const [addMethod, removeMethod] = getRegistryMethodNames(subTarget);
  if (!addMethod || !removeMethod) {
    throw new TypeError('Invalid event target');
  }
  subTarget[addMethod](eventName, handler, options);
  subscriber.add(() => subTarget[removeMethod](eventName, handler, options));
}

function getRegistryMethodNames(target: any) {
  // If it is an EventTarget, we need to use a slightly different method than the other two patterns.
  return isEventTarget(target)
    ? eventTargetMethods
    : // In all other cases, the call pattern is identical with the exception of the method names.
    isNodeStyleEventEmitter(target)
    ? nodeEventEmitterMethods
    : isJQueryStyleEventEmitter(target)
    ? jqueryMethods
    : [];
}

/**
 * Checks to see if the target implements the required node-style EventEmitter methods
 * for adding and removing event handlers.
 * @param target the object to check
 */
function isNodeStyleEventEmitter(target: any): target is NodeStyleEventEmitter {
  return isFunction(target.addListener) && isFunction(target.removeListener);
}

/**
 * Checks to see if the target implements the required jQuery-style EventEmitter methods
 * for adding and removing event handlers.
 * @param target the object to check
 */
function isJQueryStyleEventEmitter(target: any): target is JQueryStyleEventEmitter<any, any> {
  return isFunction(target.on) && isFunction(target.off);
}

/**
 * Checks to see if the target implements the required EventTarget methods
 * for adding and removing event handlers.
 * @param target the object to check
 */
function isEventTarget(target: any): target is HasEventTargetAddRemove<any> {
  return isFunction(target.addEventListener) && isFunction(target.removeEventListener);
}
