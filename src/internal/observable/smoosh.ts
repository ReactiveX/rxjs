import { Observable } from '../Observable';
import { ObservableInput, SchedulerLike} from '../types';
import { isScheduler } from '../util/isScheduler';
import { smooshAll } from '../operators/smooshAll';
import { fromArray } from './fromArray';

/* tslint:disable:max-line-length */
export function smoosh<T>(v1: ObservableInput<T>, scheduler?: SchedulerLike): Observable<T>;
export function smoosh<T>(v1: ObservableInput<T>, concurrent?: number, scheduler?: SchedulerLike): Observable<T>;
export function smoosh<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, scheduler?: SchedulerLike): Observable<T | T2>;
export function smoosh<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2>;
export function smoosh<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: SchedulerLike): Observable<T | T2 | T3>;
export function smoosh<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2 | T3>;
export function smoosh<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4>;
export function smoosh<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4>;
export function smoosh<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
export function smoosh<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
export function smoosh<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function smoosh<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, concurrent?: number, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function smoosh<T>(...observables: (ObservableInput<T> | SchedulerLike | number)[]): Observable<T>;
export function smoosh<T, R>(...observables: (ObservableInput<any> | SchedulerLike | number)[]): Observable<R>;
/* tslint:enable:max-line-length */
/**
 * Creates an output Observable which concurrently emits all values from every
 * given input Observable.
 *
 * <span class="informal">Flattens multiple Observables together by blending
 * their values into one Observable.</span>
 *
 * <img src="./img/smoosh.png" width="100%">
 *
 * `smoosh` subscribes to each given input Observable (as arguments), and simply
 * forwards (without doing any transformation) all the values from all the input
 * Observables to the output Observable. The output Observable only completes
 * once all input Observables have completed. Any error delivered by an input
 * Observable will be immediately emitted on the output Observable.
 *
 * @example <caption>Smoosh together two Observables: 1s interval and clicks</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var timer = Rx.Observable.interval(1000);
 * var clicksOrTimer = Rx.Observable.smoosh(clicks, timer);
 * clicksOrTimer.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // timer will emit ascending values, one every second(1000ms) to console
 * // clicks logs MouseEvents to console everytime the "document" is clicked
 * // Since the two streams are smooshed you see these happening
 * // as they occur.
 *
 * @example <caption>Smoosh together 3 Observables, but only 2 run concurrently</caption>
 * var timer1 = Rx.Observable.interval(1000).take(10);
 * var timer2 = Rx.Observable.interval(2000).take(6);
 * var timer3 = Rx.Observable.interval(500).take(10);
 * var concurrent = 2; // the argument
 * var smooshed = Rx.Observable.smoosh(timer1, timer2, timer3, concurrent);
 * smooshed.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // - First timer1 and timer2 will run concurrently
 * // - timer1 will emit a value every 1000ms for 10 iterations
 * // - timer2 will emit a value every 2000ms for 6 iterations
 * // - after timer1 hits it's max iteration, timer2 will
 * //   continue, and timer3 will start to run concurrently with timer2
 * // - when timer2 hits it's max iteration it terminates, and
 * //   timer3 will continue to emit a value every 500ms until it is complete
 *
 * @see {@link smooshAll}
 * @see {@link smooshMap}
 * @see {@link smooshMapTo}
 * @see {@link smooshScan}
 *
 * @param {...ObservableInput} observables Input Observables to smoosh together.
 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input
 * Observables being subscribed to concurrently.
 * @param {Scheduler} [scheduler=null] The IScheduler to use for managing
 * concurrency of input Observables.
 * @return {Observable} an Observable that emits items that are the result of
 * every input Observable.
 * @static true
 * @name smoosh
 * @owner Observable
 */
export function smoosh<T, R>(...observables: Array<ObservableInput<any> | SchedulerLike | number>): Observable<R> {
 let concurrent = Number.POSITIVE_INFINITY;
 let scheduler: SchedulerLike = null;
  let last: any = observables[observables.length - 1];
  if (isScheduler(last)) {
    scheduler = <SchedulerLike>observables.pop();
    if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
      concurrent = <number>observables.pop();
    }
  } else if (typeof last === 'number') {
    concurrent = <number>observables.pop();
  }

  if (scheduler === null && observables.length === 1 && observables[0] instanceof Observable) {
    return <Observable<R>>observables[0];
  }

  return smooshAll<R>(concurrent)(fromArray<any>(observables, scheduler));
}
