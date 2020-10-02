/** @prettier */
import { Observable } from '../Observable';
import { mergeMap } from '../operators/mergeMap';
import { isArrayLike } from '../util/isArrayLike';
import { isFunction } from '../util/isFunction';
import { mapOneOrManyArgs } from '../util/mapOneOrManyArgs';
import { internalFromArray } from './fromArray';

export interface NodeStyleEventEmitter {
  addListener: (eventName: string | symbol, handler: NodeEventHandler) => this;
  removeListener: (eventName: string | symbol, handler: NodeEventHandler) => this;
}

export type NodeEventHandler = (...args: any[]) => void;

// For APIs that implement `addListener` and `removeListener` methods that may
// not use the same arguments or return EventEmitter values
// such as React Native
export interface NodeCompatibleEventEmitter {
  addListener: (eventName: string, handler: NodeEventHandler) => void | {};
  removeListener: (eventName: string, handler: NodeEventHandler) => void | {};
}

// Use handler types like those in @types/jquery. See:
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/847731ba1d7fa6db6b911c0e43aa0afe596e7723/types/jquery/misc.d.ts#L6395
export interface JQueryStyleEventEmitter<TContext, T> {
  on: (eventName: string, handler: (this: TContext, t: T, ...args: any[]) => any) => void;
  off: (eventName: string, handler: (this: TContext, t: T, ...args: any[]) => any) => void;
}

export interface HasEventTargetAddRemove<E> {
  addEventListener(type: string, listener: ((evt: E) => void) | null, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener?: ((evt: E) => void) | null, options?: EventListenerOptions | boolean): void;
}

export type EventTargetLike<T> =
  | HasEventTargetAddRemove<T>
  | NodeStyleEventEmitter
  | NodeCompatibleEventEmitter
  | JQueryStyleEventEmitter<any, T>;

export type FromEventTarget<T> = EventTargetLike<T> | ArrayLike<EventTargetLike<T>>;

export interface EventListenerOptions {
  capture?: boolean;
  passive?: boolean;
  once?: boolean;
}

export interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean;
  passive?: boolean;
}

/* tslint:disable:max-line-length */
export function fromEvent<T>(target: FromEventTarget<T>, eventName: string): Observable<T>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function fromEvent<T>(target: FromEventTarget<T>, eventName: string, resultSelector?: (...args: any[]) => T): Observable<T>;
export function fromEvent<T>(target: FromEventTarget<T>, eventName: string, options?: EventListenerOptions): Observable<T>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function fromEvent<T>(
  target: FromEventTarget<T>,
  eventName: string,
  options: EventListenerOptions,
  resultSelector: (...args: any[]) => T
): Observable<T>;
/* tslint:enable:max-line-length */

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
 * ### Emits clicks happening on the DOM document
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
 * ### Use addEventListener with capture option
 * ```ts
 * import { fromEvent } from 'rxjs';
 *
 * const clicksInDocument = fromEvent(document, 'click', true); // note optional configuration parameter
 *                                                              // which will be passed to addEventListener
 * const clicksInDiv = fromEvent(someDivInDocument, 'click');
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
 * @param {FromEventTarget<T>} target The DOM EventTarget, Node.js
 * EventEmitter, JQuery-like event target, NodeList or HTMLCollection to attach the event handler to.
 * @param {string} eventName The event name of interest, being emitted by the
 * `target`.
 * @param {EventListenerOptions} [options] Options to pass through to addEventListener
 * @return {Observable<T>}
 * @name fromEvent
 */
export function fromEvent<T>(
  target: FromEventTarget<T>,
  eventName: string,
  options?: EventListenerOptions | ((...args: any[]) => T),
  resultSelector?: (...args: any[]) => T
): Observable<T> {
  if (isFunction(options)) {
    // DEPRECATED PATH
    resultSelector = options;
    options = undefined;
  }
  if (resultSelector) {
    // DEPRECATED PATH
    return fromEvent<T>(target, eventName, options as EventListenerOptions | undefined).pipe(mapOneOrManyArgs(resultSelector));
  }

  return new Observable<T>((subscriber) => {
    const handler = (...args: any[]) => subscriber.next(args.length > 1 ? args : args[0]);

    if (isEventTarget(target)) {
      target.addEventListener(eventName, handler, options as EventListenerOptions);
      return () => target.removeEventListener(eventName, handler, options as EventListenerOptions);
    }

    if (isJQueryStyleEventEmitter(target)) {
      target.on(eventName, handler);
      return () => target.off(eventName, handler);
    }

    if (isNodeStyleEventEmitter(target)) {
      target.addListener(eventName, handler);
      return () => target.removeListener(eventName, handler);
    }

    if (isArrayLike(target)) {
      return (mergeMap((subTarget: any) => fromEvent(subTarget, eventName, options as any))(internalFromArray(target)) as Observable<
        T
      >).subscribe(subscriber);
    }

    subscriber.error(new TypeError('Invalid event target'));
    return;
  });
}

function isNodeStyleEventEmitter(sourceObj: any): sourceObj is NodeStyleEventEmitter {
  return isFunction(sourceObj.addListener) && isFunction(sourceObj.removeListener);
}

function isJQueryStyleEventEmitter(sourceObj: any): sourceObj is JQueryStyleEventEmitter<any, any> {
  return isFunction(sourceObj.on) && isFunction(sourceObj.off);
}

function isEventTarget(sourceObj: any): sourceObj is HasEventTargetAddRemove<any> {
  return isFunction(sourceObj.addEventListener) && isFunction(sourceObj.removeEventListener);
}
