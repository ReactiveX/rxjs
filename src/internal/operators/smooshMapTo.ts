import { Observable } from '../Observable';
import { OperatorFunction } from '../../internal/types';
import { smooshMap } from './smooshMap';
import { ObservableInput } from '../types';

/* tslint:disable:max-line-length */
export function smooshMapTo<T>(innerObservable: ObservableInput<T>, concurrent?: number): OperatorFunction<any, T>;
/** @deprecated */
export function smooshMapTo<T, I, R>(innerObservable: ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R, concurrent?: number): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

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
 * `innerObservable`
 * @method smooshMapTo
 * @owner Observable
 */
export function smooshMapTo<T, I, R>(
  innerObservable: ObservableInput<I>,
  resultSelector?: ((outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R) | number,
  concurrent: number = Number.POSITIVE_INFINITY
): OperatorFunction<T, I|R> {
  if (typeof resultSelector === 'function') {
    return smooshMap(() => innerObservable, resultSelector, concurrent);
  }
  if (typeof resultSelector === 'number') {
    concurrent = resultSelector;
  }
  return smooshMap(() => innerObservable, concurrent);
}
