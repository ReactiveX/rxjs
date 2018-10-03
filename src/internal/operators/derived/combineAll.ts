import { toArray } from './toArray';
import { Observable } from '../../Observable';
import { Operation, ObservableInput } from '../../types';
import { pipeArray } from '../../util/pipe';
import { switchMap } from '../switchMap';
import { combineLatest } from '../../create/combineLatest';
import { tap } from '../tap';


export function combineAll<T>(): Operation<ObservableInput<T>, T[]>;
export function combineAll<T>(): Operation<any, T[]>;
/**
 * Flattens an Observable-of-Observables by applying {@link combineLatest} when the Observable-of-Observables completes.
 *
 * ![](combineAll.png)
 *
 * `combineAll` takes an Observable of Observables, and collects all Observables from it. Once the outer Observable completes,
 * it subscribes to all collected Observables and combines their values using the {@link combineLatest}</a> strategy, such that:
 *
 * * Every time an inner Observable emits, the output Observable emits
 * * When the returned observable emits, it emits all of the latest values by:
 *    * If a `project` function is provided, it is called with each recent value from each inner Observable in whatever order they
 *      arrived, and the result of the `project` function is what is emitted by the output Observable.
 *    * If there is no `project` function, an array of all the most recent values is emitted by the output Observable.
 *
 * ---
 *
 * ## Examples
 * ### Map two click events to a finite interval Observable, then apply `combineAll`
 * ```javascript
 * import { map, combineAll, take } from 'rxjs/operators';
 * import { fromEvent } from 'rxjs/observable/fromEvent';
 *
 * const clicks = fromEvent(document, 'click');
 * const higherOrder = clicks.pipe(
 *   map(ev =>
 *      interval(Math.random() * 2000).pipe(take(3))
 *   ),
 *   take(2)
 * );
 * const result = higherOrder.pipe(
 *   combineAll()
 * );
 *
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link combineLatest}
 * @see {@link mergeAll}
 *
 * @return {Observable<T>}
 * @name combineAll
 */
export function combineAll<T>(): Operation<T, T> {
  return pipeArray([
    toArray(),
    switchMap<Observable<T>[], Observable<T[]>>(sources => combineLatest(sources)),
  ]);
}
