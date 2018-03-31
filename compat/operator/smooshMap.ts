import { Observable, ObservableInput } from 'rxjs';
import { smooshMap as higherOrdersmooshMap } from 'rxjs/operators';

/**
 * Projects each source value to an Observable which is smooshed in the output
 * Observable.
 *
 * <span class="informal">Maps each value to an Observable, then flattens all of
 * these inner Observables using {@link smooshAll}.</span>
 *
 * <img src="./img/smooshMap.png" width="100%">
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an Observable, and then merging those resulting Observables and
 * emitting the results of this smooshr.
 *
 * @example <caption>Map and flatten each letter to an Observable ticking every 1 second</caption>
 * var letters = Rx.Observable.of('a', 'b', 'c');
 * var result = letters.smooshMap(x =>
 *   Rx.Observable.interval(1000).map(i => x+i)
 * );
 * result.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // a0
 * // b0
 * // c0
 * // a1
 * // b1
 * // c1
 * // continues to list a,b,c with respective ascending integers
 *
 * @see {@link concatMap}
 * @see {@link exhaustMap}
 * @see {@link smoosh}
 * @see {@link smooshAll}
 * @see {@link smooshMapTo}
 * @see {@link smooshScan}
 * @see {@link switchMap}
 *
 * @param {function(value: T, ?index: number): ObservableInput} project A function
 * that, when applied to an item emitted by the source Observable, returns an
 * Observable.
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input
 * Observables being subscribed to concurrently.
 * @return {Observable} An Observable that emits the result of applying the
 * projection function (and the optional `resultSelector`) to each item emitted
 * by the source Observable and merging the results of the Observables obtained
 * from this transformation.
 * @method smooshMap
 * @owner Observable
 */
export function smooshMap<T, R>(this: Observable<T>, project: (value: T, index: number) => ObservableInput<R>,
                               concurrent: number = Number.POSITIVE_INFINITY): Observable<R> {
  return higherOrdersmooshMap(project, concurrent)(this) as Observable<R>;
}
