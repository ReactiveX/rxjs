import { Observable } from '../Observable';
import { tryCatch } from '../util/tryCatch';
import { isFunction } from '../util/isFunction';
import { errorObject } from '../util/errorObject';
import { Subscription } from '../Subscription';
import { Subscriber } from '../Subscriber';

const toString: Function = Object.prototype.toString;

export type NodeStyleEventEmmitter = {
  addListener: (eventName: string, handler: Function) => void;
  removeListener: (eventName: string, handler: Function) => void;
};
function isNodeStyleEventEmmitter(sourceObj: any): sourceObj is NodeStyleEventEmmitter {
  return !!sourceObj && typeof sourceObj.addListener === 'function' && typeof sourceObj.removeListener === 'function';
}

export type JQueryStyleEventEmitter = {
  on: (eventName: string, handler: Function) => void;
  off: (eventName: string, handler: Function) => void;
};
function isJQueryStyleEventEmitter(sourceObj: any): sourceObj is JQueryStyleEventEmitter {
  return !!sourceObj && typeof sourceObj.on === 'function' && typeof sourceObj.off === 'function';
}

function isNodeList(sourceObj: any): sourceObj is NodeList {
  return !!sourceObj && toString.call(sourceObj) === '[object NodeList]';
}

function isHTMLCollection(sourceObj: any): sourceObj is HTMLCollection {
  return !!sourceObj && toString.call(sourceObj) === '[object HTMLCollection]';
}

function isEventTarget(sourceObj: any): sourceObj is EventTarget {
  return !!sourceObj && typeof sourceObj.addEventListener === 'function' && typeof sourceObj.removeEventListener === 'function';
}

export type EventTargetLike = EventTarget | NodeStyleEventEmmitter | JQueryStyleEventEmitter | NodeList | HTMLCollection;

export type EventListenerOptions = {
  capture?: boolean;
  passive?: boolean;
  once?: boolean;
} | boolean;

export type SelectorMethodSignature<T> = (...args: Array<any>) => T;

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class FromEventObservable<T> extends Observable<T> {

  /* tslint:disable:max-line-length */
  static create<T>(target: EventTargetLike, eventName: string): Observable<T>;
  static create<T>(target: EventTargetLike, eventName: string, selector: SelectorMethodSignature<T>): Observable<T>;
  static create<T>(target: EventTargetLike, eventName: string, options: EventListenerOptions): Observable<T>;
  static create<T>(target: EventTargetLike, eventName: string, options: EventListenerOptions, selector: SelectorMethodSignature<T>): Observable<T>;
  /* tslint:enable:max-line-length */

  /**
   * Creates an Observable that emits events of a specific type coming from the
   * given event target.
   *
   * <span class="informal">Creates an Observable from DOM events, or Node
   * EventEmitter events or others.</span>
   *
   * <img src="./img/fromEvent.png" width="100%">
   *
   * Creates an Observable by attaching an event listener to an "event target",
   * which may be an object with `addEventListener` and `removeEventListener`,
   * a Node.js EventEmitter, a jQuery style EventEmitter, a NodeList from the
   * DOM, or an HTMLCollection from the DOM. The event handler is attached when
   * the output Observable is subscribed, and removed when the Subscription is
   * unsubscribed.
   *
   * @example <caption>Emits clicks happening on the DOM document</caption>
   * var clicks = Rx.Observable.fromEvent(document, 'click');
   * clicks.subscribe(x => console.log(x));
   *
   * // Results in:
   * // MouseEvent object logged to console everytime a click
   * // occurs on the document.
   *
   * @see {@link from}
   * @see {@link fromEventPattern}
   *
   * @param {EventTargetLike} target The DOMElement, event target, Node.js
   * EventEmitter, NodeList or HTMLCollection to attach the event handler to.
   * @param {string} eventName The event name of interest, being emitted by the
   * `target`.
   * @param {EventListenerOptions} [options] Options to pass through to addEventListener
   * @param {SelectorMethodSignature<T>} [selector] An optional function to
   * post-process results. It takes the arguments from the event handler and
   * should return a single value.
   * @return {Observable<T>}
   * @static true
   * @name fromEvent
   * @owner Observable
   */
  static create<T>(target: EventTargetLike,
                   eventName: string,
                   options?: EventListenerOptions,
                   selector?: SelectorMethodSignature<T>): Observable<T> {
    if (isFunction(options)) {
      selector = <any>options;
      options = undefined;
    }
    return new FromEventObservable(target, eventName, selector, options);
  }

  constructor(private sourceObj: EventTargetLike,
              private eventName: string,
              private selector?: SelectorMethodSignature<T>,
              private options?: EventListenerOptions) {
    super();
  }

  private static setupSubscription<T>(sourceObj: EventTargetLike,
                                      eventName: string,
                                      handler: Function,
                                      subscriber: Subscriber<T>,
                                      options?: EventListenerOptions) {
    let unsubscribe: () => void;
    if (isNodeList(sourceObj) || isHTMLCollection(sourceObj)) {
      for (let i = 0, len = sourceObj.length; i < len; i++) {
        FromEventObservable.setupSubscription(sourceObj[i], eventName, handler, subscriber, options);
      }
    } else if (isEventTarget(sourceObj)) {
      const source = sourceObj;
      sourceObj.addEventListener(eventName, <EventListener>handler, <boolean>options);
      unsubscribe = () => source.removeEventListener(eventName, <EventListener>handler);
    } else if (isJQueryStyleEventEmitter(sourceObj)) {
      const source = sourceObj;
      sourceObj.on(eventName, handler);
      unsubscribe = () => source.off(eventName, handler);
    } else if (isNodeStyleEventEmmitter(sourceObj)) {
      const source = sourceObj;
      sourceObj.addListener(eventName, handler);
      unsubscribe = () => source.removeListener(eventName, handler);
    } else {
      throw new TypeError('Invalid event target');
    }

    subscriber.add(new Subscription(unsubscribe));
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    const sourceObj = this.sourceObj;
    const eventName = this.eventName;
    const options = this.options;
    const selector = this.selector;
    let handler = selector ? (...args: any[]) => {
      let result = tryCatch(selector)(...args);
      if (result === errorObject) {
        subscriber.error(errorObject.e);
      } else {
        subscriber.next(result);
      }
    } : (e: any) => subscriber.next(e);

    FromEventObservable.setupSubscription(sourceObj, eventName, handler, subscriber, options);
  }
}
