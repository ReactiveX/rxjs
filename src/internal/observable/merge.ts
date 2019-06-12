import { Observable } from '../Observable';
import { ObservableInput, SchedulerLike, ObservedValuesFromArray, ObservedValuesFromArrayOfObservables} from '../types';
import { isScheduler } from '../util/isScheduler';
import { mergeAll } from '../operators/mergeAll';
import { fromArray } from './fromArray';

/* tslint:disable:max-line-length */
/** @deprecated remove in v8. Use {@link scheduled} and {@link mergeAll} (e.g. `scheduled([ob1, ob2, ob3], scheduled).pipe(mergeAll())*/
export function merge<T>(v1: ObservableInput<T>, scheduler: SchedulerLike): Observable<T>;
/** @deprecated remove in v8. Use {@link scheduled} and {@link mergeAll} (e.g. `scheduled([ob1, ob2, ob3], scheduled).pipe(mergeAll(concurrencyLimit))*/
export function merge<T>(v1: ObservableInput<T>, concurrent: number, scheduler: SchedulerLike): Observable<T>;
/** @deprecated remove in v8. Use {@link scheduled} and {@link mergeAll} (e.g. `scheduled([ob1, ob2, ob3], scheduled).pipe(mergeAll())*/
export function merge<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, scheduler: SchedulerLike): Observable<T | T2>;
/** @deprecated remove in v8. Use {@link scheduled} and {@link mergeAll} (e.g. `scheduled([ob1, ob2, ob3], scheduled).pipe(mergeAll(concurrencyLimit))*/
export function merge<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, concurrent: number, scheduler: SchedulerLike): Observable<T | T2>;
/** @deprecated remove in v8. Use {@link scheduled} and {@link mergeAll} (e.g. `scheduled([ob1, ob2, ob3], scheduled).pipe(mergeAll())*/
export function merge<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler: SchedulerLike): Observable<T | T2 | T3>;
/** @deprecated remove in v8. Use {@link scheduled} and {@link mergeAll} (e.g. `scheduled([ob1, ob2, ob3], scheduled).pipe(mergeAll(concurrencyLimit))*/
export function merge<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, concurrent: number, scheduler: SchedulerLike): Observable<T | T2 | T3>;
/** @deprecated remove in v8. Use {@link scheduled} and {@link mergeAll} (e.g. `scheduled([ob1, ob2, ob3], scheduled).pipe(mergeAll())*/
export function merge<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4>;
/** @deprecated remove in v8. Use {@link scheduled} and {@link mergeAll} (e.g. `scheduled([ob1, ob2, ob3], scheduled).pipe(mergeAll(concurrencyLimit))*/
export function merge<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, concurrent: number, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4>;
/** @deprecated remove in v8. Use {@link scheduled} and {@link mergeAll} (e.g. `scheduled([ob1, ob2, ob3], scheduled).pipe(mergeAll())*/
export function merge<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
/** @deprecated remove in v8. Use {@link scheduled} and {@link mergeAll} (e.g. `scheduled([ob1, ob2, ob3], scheduled).pipe(mergeAll(concurrencyLimit))*/
export function merge<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, concurrent: number, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
/** @deprecated remove in v8. Use {@link scheduled} and {@link mergeAll} (e.g. `scheduled([ob1, ob2, ob3], scheduled).pipe(mergeAll())*/
export function merge<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
/** @deprecated remove in v8. Use {@link scheduled} and {@link mergeAll} (e.g. `scheduled([ob1, ob2, ob3], scheduled).pipe(mergeAll(concurrencyLimit))*/
export function merge<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, concurrent: number, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;

/** @deprecated remove in v8. use {@link mergeConcurrent}, (e.g. `mergeConcurrent(2, ob1, ob2, ob3)`)*/
export function merge<T>(v1: ObservableInput<T>, concurrent: number): Observable<T>;
/** @deprecated remove in v8. use {@link mergeConcurrent}, (e.g. `mergeConcurrent(2, ob1, ob2, ob3)`)*/
export function merge<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, concurrent: number): Observable<T | T2>;
/** @deprecated remove in v8. use {@link mergeConcurrent}, (e.g. `mergeConcurrent(2, ob1, ob2, ob3)`)*/
export function merge<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, concurrent: number): Observable<T | T2 | T3>;
/** @deprecated remove in v8. use {@link mergeConcurrent}, (e.g. `mergeConcurrent(2, ob1, ob2, ob3)`)*/
export function merge<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, concurrent: number): Observable<T | T2 | T3 | T4>;
/** @deprecated remove in v8. use {@link mergeConcurrent}, (e.g. `mergeConcurrent(2, ob1, ob2, ob3)`)*/
export function merge<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, concurrent: number): Observable<T | T2 | T3 | T4 | T5>;
/** @deprecated remove in v8. use {@link mergeConcurrent}, (e.g. `mergeConcurrent(2, ob1, ob2, ob3)`)*/
export function merge<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, concurrent: number): Observable<T | T2 | T3 | T4 | T5 | T6>;

// Handle spread of classes extending Observable (e.g. merge(...subjects))
export function merge<O extends Observable<any>, A extends O[]>(...args: A): Observable<ObservedValuesFromArrayOfObservables<A>>;

// General use cases
export function merge<O extends ObservableInput<any>, A extends O[]>(...args: A): Observable<ObservedValuesFromArray<A>>;

/** @deprecated remove in v8. use {@link mergeConcurrent} or {@link scheduled} and {@link mergeAll} */
export function merge(...args: (number | SchedulerLike | ObservableInput<any>)[]): Observable<{}>;

/* tslint:enable:max-line-length */

/**
 * Creates an output Observable which concurrently emits all values from every
 * given input Observable.
 *
 * <span class="informal">Flattens multiple Observables together by blending
 * their values into one Observable.</span>
 *
 * ![](merge.png)
 *
 * `merge` subscribes to each given input Observable (as arguments), and simply
 * forwards (without doing any transformation) all the values from all the input
 * Observables to the output Observable. The output Observable only completes
 * once all input Observables have completed. Any error delivered by an input
 * Observable will be immediately emitted on the output Observable.
 *
 * ## Examples
 * ### Merge together two Observables: 1s interval and clicks
 * ```ts
 * import { merge, fromEvent, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const timer = interval(1000);
 * const clicksOrTimer = merge(clicks, timer);
 * clicksOrTimer.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // timer will emit ascending values, one every second(1000ms) to console
 * // clicks logs MouseEvents to console everytime the "document" is clicked
 * // Since the two streams are merged you see these happening
 * // as they occur.
 * ```
 *
 * @see {@link mergeAll}
 * @see {@link mergeMap}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 * @see {@link concurrent}
 *
 * @param {...ObservableInput} observables Input Observables to merge together.
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input
 * Observables being subscribed to concurrently.
 * @param {SchedulerLike} [scheduler=null] The {@link SchedulerLike} to use for managing
 * concurrency of input Observables.
 * @return {Observable} an Observable that emits items that are the result of
 * every input Observable.
 */
export function merge(...observables: (ObservableInput<any> | SchedulerLike | number)[]): Observable<any> {
 let concurrent = Number.POSITIVE_INFINITY;
 let scheduler: SchedulerLike = null;
  let last: any = observables[observables.length - 1];
  if (isScheduler(last)) {
    scheduler = observables.pop() as SchedulerLike;
    if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
      concurrent = observables.pop() as number;
    }
  } else if (typeof last === 'number') {
    concurrent = observables.pop() as number;
  }

  if (scheduler === null && observables.length === 1 && observables[0] instanceof Observable) {
    return observables[0] as Observable<any>;
  }

  return mergeAll(concurrent)(fromArray(observables as ObservableInput<any>[], scheduler));
}
