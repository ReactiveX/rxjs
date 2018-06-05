import { Observable } from '../Observable';
import { isArray } from '../util/isArray';
import { isFunction } from '../util/isFunction';
import { fromEvent } from './fromEvent';
import { map } from '../operators/map';

/* tslint:disable:max-line-length */
export function fromEventPattern<T>(addHandler: (handler: Function) => any, removeHandler?: (handler: Function, signal?: any) => void): Observable<T>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function fromEventPattern<T>(addHandler: (handler: Function) => any, removeHandler?: (handler: Function, signal?: any) => void, resultSelector?: (...args: any[]) => T): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * Creates an Observable from an API based on addHandler/removeHandler
 * functions.
 *
 * <span class="informal">Converts any addHandler/removeHandler API to an
 * Observable.</span>
 *
 * <img src="./img/fromEventPattern.png" width="100%">
 *
 * Creates an Observable by using the `addHandler` and `removeHandler`
 * functions to add and remove the handlers. The `addHandler` is
 * called when the output Observable is subscribed, and `removeHandler` is
 * called when the Subscription is unsubscribed.
 *
 * ## Example
 * ### Emits clicks happening on the DOM document
 * ```javascript
 * function addClickHandler(handler) {
 *   document.addEventListener('click', handler);
 * }
 *
 * function removeClickHandler(handler) {
 *   document.removeEventListener('click', handler);
 * }
 *
 * const clicks = fromEventPattern(
 *   addClickHandler,
 *   removeClickHandler,
 * );
 * clicks.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link from}
 * @see {@link fromEvent}
 *
 * @param {function(handler: Function): any} addHandler A function that takes
 * a `handler` function as argument and attaches it somehow to the actual
 * source of events.
 * @param {function(handler: Function, signal?: any): void} [removeHandler] An optional function that
 * takes a `handler` function as argument and removes it in case it was
 * previously attached using `addHandler`. if addHandler returns signal to teardown when remove,
 * removeHandler function will forward it.
 * @return {Observable<T>}
 * @name fromEventPattern
 */
export function fromEventPattern<T>(addHandler: (handler: Function) => any,
                                    removeHandler?: (handler: Function, signal?: any) => void,
                                    resultSelector?: (...args: any[]) => T): Observable<T | T[]> {

  if (resultSelector) {
    // DEPRECATED PATH
    return fromEventPattern<T>(addHandler, removeHandler).pipe(
      map(args => isArray(args) ? resultSelector(...args) : resultSelector(args))
    );
  }

  return new Observable<T | T[]>(subscriber => {
    const handler = (...e: T[]) => subscriber.next(e.length === 1 ? e[0] : e);

    let retValue: any;
    try {
      retValue = addHandler(handler);
    } catch (err) {
      subscriber.error(err);
      return undefined;
    }

    if (!isFunction(removeHandler)) {
      return undefined;
    }

    return () => removeHandler(handler, retValue) ;
  });
}
