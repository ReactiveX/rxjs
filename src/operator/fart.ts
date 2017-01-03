import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';

/**
 * Emits gas on the output Observable every time the source
 * Observable emits a value.
 *
 * <span class="informal">Like {@link map}, but it maps every source value to
 * the same predefined output value every time.</span>
 *
 * <img src="./img/fart.png" width="100%">
 *
 * Takes no arguments, and emits a fart emoji whenever the source
 * Observable emits a value. In other words, ignores the actual source value,
 * and simply uses the emission moment to know when to pass gas.
 *
 * @example <caption>Map every every click to a fart</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var greetings = clicks.fart();
 * greetings.subscribe(x => console.log(x));
 *
 * @see {@link map}
 *
 * @return {Observable} An Observable that emits gas every time
 * the source Observable emits something.
 * @method fart
 * @owner Observable
 */
export function fart<T>(this: Observable<T>): Observable<string> {
  return this.lift(new FartOperator());
}

class FartOperator<T> implements Operator<T, string> {

  call(subscriber: Subscriber<string>, source: any): any {
    return source.subscribe(new FartSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class FartSubscriber<T> extends Subscriber<T> {

  protected _next(x: T) {
    this.destination.next('💩💨');
  }
}