import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { observeNotification } from '../Notification';
import { OperatorFunction, ObservableNotification, ValueFromNotification } from '../types';
import { lift } from '../util/lift';

/**
 * Converts an Observable of {@link ObservableNotification} objects into the emissions
 * that they represent.
 *
 * <span class="informal">Unwraps {@link ObservableNotification} objects as actual `next`,
 * `error` and `complete` emissions. The opposite of {@link materialize}.</span>
 *
 * ![](dematerialize.png)
 *
 * `dematerialize` is assumed to operate an Observable that only emits
 * {@link ObservableNotification} objects as `next` emissions, and does not emit any
 * `error`. Such Observable is the output of a `materialize` operation. Those
 * notifications are then unwrapped using the metadata they contain, and emitted
 * as `next`, `error`, and `complete` on the output Observable.
 *
 * Use this operator in conjunction with {@link materialize}.
 *
 * ## Example
 *
 * Convert an Observable of Notifications to an actual Observable
 *
 * ```ts
 * import { of } from 'rxjs';
 * import { dematerialize } from 'rxjs/operators';
 *
 * const notifA = { kind: 'N', value: 'A' };
 * const notifB = { kind: 'N', value: 'B' };
 * const notifE = { kind: 'E', error: new TypeError('x.toUpperCase is not a function') }
 *
 * const materialized = of(notifA, notifB, notifE);
 *
 * const upperCase = materialized.pipe(dematerialize());
 * upperCase.subscribe({
 *    next: x => console.log(x),
 *    error: e => console.error(e)
 * });
 *
 * // Results in:
 * // A
 * // B
 * // TypeError: x.toUpperCase is not a function
 * ```
 * @see {@link materialize}
 *
 * @return {Observable} An Observable that emits items and notifications
 * embedded in Notification objects emitted by the source Observable.
 */
export function dematerialize<N extends ObservableNotification<any>>(): OperatorFunction<N, ValueFromNotification<N>> {
  return function dematerializeOperatorFunction(source: Observable<N>) {
    return lift(source, new DeMaterializeOperator<N>());
  };
}

class DeMaterializeOperator<N extends ObservableNotification<any>> implements Operator<N, ValueFromNotification<N>> {
  call(subscriber: Subscriber<any>, source: any): any {
    return source.subscribe(new DeMaterializeSubscriber<N>(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DeMaterializeSubscriber<N extends ObservableNotification<any>> extends Subscriber<N> {
  constructor(destination: Subscriber<ValueFromNotification<N>>) {
    super(destination);
  }

  protected _next(notification: N) {
    observeNotification(notification, this.destination);
  }
}
