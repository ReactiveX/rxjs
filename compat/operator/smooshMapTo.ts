import { Observable, ObservableInput } from 'rxjs';
import { smooshMapTo as higherOrder } from 'rxjs/operators';

/**
 * Projects each source value to the same Observable which is smooshed multiple
 * times in the output Observable.
 *
 * <span class="informal">It's like {@link smooshMap}, but maps each value always
 * to the same inner Observable.</span>
 *
 * <img src="./img/smooshMapTo.png" width="100%">
 *
 * Maps each source value to the given Observable `innerObservable` regardless
 * of the source value, and then smooshs those resulting Observables into one
 * single Observable, which is the output Observable.
 *
 * @example <caption>For each click event, start an interval Observable ticking every 1 second</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.smooshMapTo(Rx.Observable.interval(1000));
 * result.subscribe(x => console.log(x));
 *
 * @see {@link concatMapTo}
 * @see {@link smoosh}
 * @see {@link smooshAll}
 * @see {@link smooshMap}
 * @see {@link smooshScan}
 * @see {@link switchMapTo}
 *
 * @param {ObservableInput} innerObservable An Observable to replace each value from
 * the source Observable.
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input
 * Observables being subscribed to concurrently.
 * @return {Observable} An Observable that emits items from the given
 * `innerObservable`.
 * @method smooshMapTo
 * @owner Observable
 */
export function smooshMapTo<T, R>(this: Observable<T>, innerObservable: ObservableInput<R>,
                                 concurrent: number = Number.POSITIVE_INFINITY): Observable<R> {
  return higherOrder(innerObservable, concurrent)(this) as Observable<R>;
}
