import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { MonoTypeOperatorFunction, OperatorFunction, UnaryFunction } from '../types';

/* tslint:disable:max-line-length */
export function publish<T>(): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
export function publish<T, R>(selector: OperatorFunction<T, R>): OperatorFunction<T, R>;
export function publish<T>(selector: MonoTypeOperatorFunction<T>): MonoTypeOperatorFunction<T>;
/* tslint:enable:max-line-length */

/**
 * Returns a ConnectableObservable, which is a variety of Observable that waits until its connect method is called
 * before it begins emitting items to those Observers that have subscribed to it.
 *
 * <span class="informal">Share the same source, prevent it from emitting values until calling connect.</span>
 *
 * ![](publish.png)
 *
 * ## Examples
 * No one of connectable$ observables start emitting values until the screen gets click (calling connect method of
 * the observable) . After clicked on the screen it will output values every two second before each one
 * (connectable$) gets complete.
 * ```javascript
 * import { of, zip, interval, fromEvent } from "rxjs";
 * import { map, publish, take } from "rxjs/operators";
 *
 * const click$ = fromEvent<MouseEvent>(document, "click");
 *
 * const source$ = zip(
 *    interval(2000),
 *       of(1, 2, 3, 4, 5, 6, 7, 8, 9),
 *    ).pipe(
 *       map(values => values[1])
 *    );
 *
 * const connectable$ = source$.pipe(publish());
 *
 * connectable$.subscribe(items => console.log(`connectable 1: ${items}`));
 * connectable$.subscribe(items => console.log(`connectable 2: ${items}`));
 * connectable$.subscribe(items => console.log(`connectable 3: ${items}`));
 * connectable$.subscribe(items => console.log(`connectable 4: ${items}`));
 * connectable$.subscribe(items => console.log(`connectable 5: ${items}`));
 *
 * click$.pipe(take(1))
 *    .subscribe(() => connectable$.connect());
 * ```
 *
 * @param {Function} [selector] - Optional selector function which can use the multicasted source sequence as many times
 * as needed, without causing multiple subscriptions to the source sequence.
 * Subscribers to the given source will receive all notifications of the source from the time of the subscription on.
 * @return A ConnectableObservable that upon connection causes the source Observable to emit items to its Observers.
 * @method publish
 * @owner Observable
 *
 *
 */
export function publish<T, R>(selector?: OperatorFunction<T, R>): MonoTypeOperatorFunction<T> | OperatorFunction<T, R> {
  return selector ?
    multicast(() => new Subject<T>(), selector) :
    multicast(new Subject<T>());
}
