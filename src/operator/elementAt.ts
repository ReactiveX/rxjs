import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {ArgumentOutOfRangeError} from '../util/ArgumentOutOfRangeError';
import {Observable} from '../Observable';
import {TeardownLogic} from '../Subscription';

/**
 * Emits the single value at the specified `index` in a sequence of emissions
 * from the source Observable.
 *
 * <span class="informal">Emits only the i-th value, then completes.</span>
 *
 * <img src="./img/elementAt.png" width="100%">
 *
 * `elementAt` returns an Observable that emits the item at the specified
 * `index` in the source Observable, or a default value if that `index` is out
 * of range and the `default` argument is provided. If the `default` argument is
 * not given and the `index` is out of range, the output Observable will emit an
 * `ArgumentOutOfRangeError` error.
 *
 * @example <caption>Emit only the third click event</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.elementAt(2);
 * result.subscribe(x => console.log(x));
 *
 * @see {@link first}
 * @see {@link last}
 * @see {@link skip}
 * @see {@link single}
 * @see {@link take}
 *
 * @throws {ArgumentOutOfRangeError} When using `elementAt(i)`, it delivers an
 * ArgumentOutOrRangeError to the Observer's `error` callback if `i < 0` or the
 * Observable has completed before emitting the i-th `next` notification.
 *
 * @param {number} index Is the number `i` for the i-th source emission that has
 * happened since the subscription, starting from the number `0`.
 * @param {T} [defaultValue] The default value returned for missing indices.
 * @return {Observable} An Observable that emits a single item, if it is found.
 * Otherwise, will emit the default value if given. If not, then emits an error.
 * @method elementAt
 * @owner Observable
 */
export function elementAt<T>(index: number, defaultValue?: T): Observable<T> {
  return this.lift(new ElementAtOperator(index, defaultValue));
}

export interface ElementAtSignature<T> {
  (index: number, defaultValue?: T): Observable<T>;
}

class ElementAtOperator<T> implements Operator<T, T> {

  constructor(private index: number, private defaultValue?: T) {
    if (index < 0) {
      throw new ArgumentOutOfRangeError;
    }
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source._subscribe(new ElementAtSubscriber(subscriber, this.index, this.defaultValue));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class ElementAtSubscriber<T> extends Subscriber<T> {

  constructor(destination: Subscriber<T>, private index: number, private defaultValue?: T) {
    super(destination);
  }

  protected _next(x: T) {
    if (this.index-- === 0) {
      this.destination.next(x);
      this.destination.complete();
    }
  }

  protected _complete() {
    const destination = this.destination;
    if (this.index >= 0) {
      if (typeof this.defaultValue !== 'undefined') {
        destination.next(this.defaultValue);
      } else {
        destination.error(new ArgumentOutOfRangeError);
      }
    }
    destination.complete();
  }
}
