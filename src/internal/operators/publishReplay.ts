import { Observable } from '../Observable';
import { ReplaySubject } from '../ReplaySubject';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { UnaryFunction, MonoTypeOperatorFunction, OperatorFunction, SchedulerLike, ObservableInput, ObservedValueOf } from '../types';

/* tslint:disable:max-line-length */
export function publishReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
export function publishReplay<T, O extends ObservableInput<any>>(bufferSize?: number, windowTime?: number, selector?: (shared: Observable<T>) => O, scheduler?: SchedulerLike): OperatorFunction<T, ObservedValueOf<O>>;
/* tslint:enable:max-line-length */

/**
 * Multicasts over a {@link ReplaySubject} to support caching items for replay to Observers that subscribe after emission begins.
 * Can return a {@link ConnectableObservable}, which is a variety of observable that waits until its connect method is called
 * before it begins emitting items to those Observers that have subscribed to it.
 * Can also return a {@link Observable} when a selector function is used as the third argument,
 * this is generally the recommended way of using publish and publishReplay
 * as it allows you to immeditately subscribe without connecting, and makes further composition easier.
 * Check out <a href="https://blog.angularindepth.com/rxjs-calling-publish-with-a-selector-3ab48f052a4b">this post</a>
 * to learn more about the use of a selector.
 * Cached values can also be delayed by a given amount of time in ms passed in as the second argument.
 *
 * <span class="informal">Makes a cold Observable hot and allows for caching of source values</span>
 *
 * ![](publishReplay.png)
 *
 * ## Examples
 * Make source$ hot by applying publishReplay operator, and cache 2 values in a ReplaySubject
 * ```ts
 * import { of } from 'rxjs';
 * import { publishReplay, map, delay } from 'rxjs/operators';
 *
 * const source$ = of(1, 2, 3, 4).pipe(
 *  publishReplay(
 *    2,
 *    1000,
 *    shared$ => shared$.pipe(
 *      map(v => `The value is ${v}`)
 *    )
 *  ),
 * );
 *
 * source$.subscribe({
 *    next: x => console.log(x),
 *    complete: () => console.log('done'),
 *  });
 *
 * setTimeout(() => {
 *    source$
 *    .pipe(
 *      map(v => `${v} from the cache`)
 *    )
 *    .subscribe({
 *      next: x => console.log(x),
 *      complete: () => console.log('done'),
 *  });
 * }, 500);
 *
 * // By using a selector function, values will begin emitting immediately, and we can easily add new Observers.
 * // With a buffer size of 2, and a windowTime of 1000, the second subscription
 * // which begins observing after 0.5 seconds, will receive the last two values cached from the source
 * // which are delayed by 1000 seconds. If they were not delayed, the second subscription would not receive them in this case.
 * // Output:
 * // The value is 1
 * // The value is 2
 * // The value is 3
 * // The value is 4
 * // done
 * // The value is 3 from the cache
 * // The value is 4 from the cache
 *
 * // If no selector function is used, everything works as before, but to begin listening to emitted values
 * // the stream must be connected to using (for example) the refCount operator.
 * import { interval } from 'rxjs';
 * import { publishReplay, refCount } from 'rxjs/operators';
 *
 * const source$ = interval(1000).pipe(
 *  publishReplay(1),
 *  refCount(),
 * );
 *
 * source$.subscribe(a => console.log(`Stream 1 ${a}`));
 * setTimeout(() => source$.subscribe(a => console.log(`Stream 2 ${a}`)), 2500);
 *
 * // Stream 1 Results every one second
 * // Stream 2 Begins after 2.5 seconds, then matches Stream 1
 * // Stream 1: 0
 * // Stream 1: 1
 * // Stream 2: 1 After 0.5 seconds, the single cached value from source is emitted
 * // Stream 1: 2
 * // Stream 2: 2 Now the streams match, together forever
 * // ...
 * // Instead of using refCount, you could also set up subscriptions and call connect to get the values flowing
 * import { of, ConnectableObservable } from 'rxjs';
 * import { publishReplay } from 'rxjs/operators';
 *
 * const source$ = of(1, 2, 3, 4).pipe(
 *  publishReplay(2),
 * ) as ConnectableObservable<number>;
 *
 * source$.subscribe(a => console.log(`Stream 1 ${a}`));
 * setTimeout(() => source$.subscribe(a => console.log(`Stream 2 ${a}`)), 2500);
 *
 * source$.connect();
 *
 * // Stream 1 1
 * // Stream 1 2
 * // Stream 1 3
 * // Stream 1 4
 * // Stream 1 3
 * // Stream 1 4
 * ```
 *
 * @param {number} [bufferSize] - Optional number of values to cache for replay to Observers who subscribe
 * after the emission of the source observable
 * @param {number} [windowTime] - Optional number of milliseconds to delay emission of cached values to
 * Observers that subscribe after the source begins emitting
 * @param {SchedulerLike | OperatorFunction<T, R>} [selectorOrScheduler] - Optional selector
 * which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence.
 * or scheduler that allows control over what order the task will be queued in.
 * @return A UnaryFunction mapping the source Observable to a ConnectableObservable that upon connection
 * causes the source Observable to emit items to its Observers, and caches a number of emitted values for future Observers.
 * @method publishReplay
 * @owner Observable
 */
export function publishReplay<T, R>(bufferSize?: number,
                                    windowTime?: number,
                                    selectorOrScheduler?: SchedulerLike | OperatorFunction<T, R>,
                                    scheduler?: SchedulerLike): UnaryFunction<Observable<T>, ConnectableObservable<R>> {

  if (selectorOrScheduler && typeof selectorOrScheduler !== 'function') {
    scheduler = selectorOrScheduler;
  }

  const selector = typeof selectorOrScheduler === 'function' ? selectorOrScheduler : undefined;
  const subject = new ReplaySubject<T>(bufferSize, windowTime, scheduler);

  return (source: Observable<T>) => multicast(() => subject, selector)(source) as ConnectableObservable<R>;
}
