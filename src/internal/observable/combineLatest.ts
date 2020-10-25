/** @prettier */
import { Observable } from '../Observable';
import { ObservableInput, SchedulerLike, ObservedValueOf, ObservableInputTuple } from '../types';
import { argsArgArrayOrObject } from '../util/argsArgArrayOrObject';
import { Subscriber } from '../Subscriber';
import { from } from './from';
import { identity } from '../util/identity';
import { Subscription } from '../Subscription';
import { mapOneOrManyArgs } from '../util/mapOneOrManyArgs';
import { popResultSelector, popScheduler } from '../util/args';

// combineLatest([a, b, c])
export function combineLatest(sources: []): Observable<never>;
export function combineLatest<A extends readonly unknown[]>(sources: readonly [...ObservableInputTuple<A>]): Observable<A>;

// combineLatest(a, b, c)
/** @deprecated Use the version that takes an array of Observables instead */
export function combineLatest<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A>;

// combineLatest({a, b, c})
export function combineLatest(sourcesObject: { [K in any]: never }): Observable<never>;
export function combineLatest<T>(sourcesObject: T): Observable<{ [K in keyof T]: ObservedValueOf<T[K]> }>;

// If called with a single array, it "auto-spreads" the array, with result selector
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function combineLatest<O1 extends ObservableInput<any>, R>(
  sources: [O1],
  resultSelector: (v1: ObservedValueOf<O1>) => R,
  scheduler?: SchedulerLike
): Observable<R>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, R>(
  sources: [O1, O2],
  resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>) => R,
  scheduler?: SchedulerLike
): Observable<R>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, R>(
  sources: [O1, O2, O3],
  resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>) => R,
  scheduler?: SchedulerLike
): Observable<R>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function combineLatest<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  R
>(
  sources: [O1, O2, O3, O4],
  resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>) => R,
  scheduler?: SchedulerLike
): Observable<R>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function combineLatest<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>,
  R
>(
  sources: [O1, O2, O3, O4, O5],
  resultSelector: (
    v1: ObservedValueOf<O1>,
    v2: ObservedValueOf<O2>,
    v3: ObservedValueOf<O3>,
    v4: ObservedValueOf<O4>,
    v5: ObservedValueOf<O5>
  ) => R,
  scheduler?: SchedulerLike
): Observable<R>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function combineLatest<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>,
  O6 extends ObservableInput<any>,
  R
>(
  sources: [O1, O2, O3, O4, O5, O6],
  resultSelector: (
    v1: ObservedValueOf<O1>,
    v2: ObservedValueOf<O2>,
    v3: ObservedValueOf<O3>,
    v4: ObservedValueOf<O4>,
    v5: ObservedValueOf<O5>,
    v6: ObservedValueOf<O6>
  ) => R,
  scheduler?: SchedulerLike
): Observable<R>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function combineLatest<O extends ObservableInput<any>, R>(
  sources: O[],
  resultSelector: (...args: ObservedValueOf<O>[]) => R,
  scheduler?: SchedulerLike
): Observable<R>;

// standard call, but with a result selector
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function combineLatest<O1 extends ObservableInput<any>, R>(
  v1: O1,
  resultSelector: (v1: ObservedValueOf<O1>) => R,
  scheduler?: SchedulerLike
): Observable<R>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, R>(
  v1: O1,
  v2: O2,
  resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>) => R,
  scheduler?: SchedulerLike
): Observable<R>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, R>(
  v1: O1,
  v2: O2,
  v3: O3,
  resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>) => R,
  scheduler?: SchedulerLike
): Observable<R>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function combineLatest<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  R
>(
  v1: O1,
  v2: O2,
  v3: O3,
  v4: O4,
  resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>) => R,
  scheduler?: SchedulerLike
): Observable<R>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function combineLatest<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>,
  R
>(
  v1: O1,
  v2: O2,
  v3: O3,
  v4: O4,
  v5: O5,
  resultSelector: (
    v1: ObservedValueOf<O1>,
    v2: ObservedValueOf<O2>,
    v3: ObservedValueOf<O3>,
    v4: ObservedValueOf<O4>,
    v5: ObservedValueOf<O5>
  ) => R,
  scheduler?: SchedulerLike
): Observable<R>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export function combineLatest<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>,
  O6 extends ObservableInput<any>,
  R
>(
  v1: O1,
  v2: O2,
  v3: O3,
  v4: O4,
  v5: O5,
  v6: O6,
  resultSelector: (
    v1: ObservedValueOf<O1>,
    v2: ObservedValueOf<O2>,
    v3: ObservedValueOf<O3>,
    v4: ObservedValueOf<O4>,
    v5: ObservedValueOf<O5>,
    v6: ObservedValueOf<O6>
  ) => R,
  scheduler?: SchedulerLike
): Observable<R>;

// With a scheduler (deprecated)
/** @deprecated The scheduler argument is deprecated, use scheduled and combineAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function combineLatest<O1 extends ObservableInput<any>>(sources: [O1], scheduler: SchedulerLike): Observable<[ObservedValueOf<O1>]>;
/** @deprecated The scheduler argument is deprecated, use scheduled and combineAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>>(
  sources: [O1, O2],
  scheduler: SchedulerLike
): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>]>;
/** @deprecated The scheduler argument is deprecated, use scheduled and combineAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(
  sources: [O1, O2, O3],
  scheduler: SchedulerLike
): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>]>;
/** @deprecated The scheduler argument is deprecated, use scheduled and combineAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function combineLatest<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>
>(
  sources: [O1, O2, O3, O4],
  scheduler: SchedulerLike
): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>]>;
/** @deprecated The scheduler argument is deprecated, use scheduled and combineAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function combineLatest<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>
>(
  sources: [O1, O2, O3, O4, O5],
  scheduler: SchedulerLike
): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>]>;
/** @deprecated The scheduler argument is deprecated, use scheduled and combineAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function combineLatest<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>,
  O6 extends ObservableInput<any>
>(
  sources: [O1, O2, O3, O4, O5, O6],
  scheduler: SchedulerLike
): Observable<
  [ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>, ObservedValueOf<O6>]
>;
/** @deprecated The scheduler argument is deprecated, use scheduled and combineAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export function combineLatest<O extends ObservableInput<any>>(sources: O[], scheduler: SchedulerLike): Observable<ObservedValueOf<O>[]>;

/** @deprecated Pass arguments in a single array instead `combineLatest([a, b, c])` */
export function combineLatest<O1 extends ObservableInput<any>>(v1: O1, scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>]>;
/** @deprecated Pass arguments in a single array instead `combineLatest([a, b, c])` */
export function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>>(
  v1: O1,
  v2: O2,
  scheduler?: SchedulerLike
): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>]>;
/** @deprecated Pass arguments in a single array instead `combineLatest([a, b, c])` */
export function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(
  v1: O1,
  v2: O2,
  v3: O3,
  scheduler?: SchedulerLike
): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>]>;
/** @deprecated Pass arguments in a single array instead `combineLatest([a, b, c])` */
export function combineLatest<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>
>(
  v1: O1,
  v2: O2,
  v3: O3,
  v4: O4,
  scheduler?: SchedulerLike
): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>]>;
/** @deprecated Pass arguments in a single array instead `combineLatest([a, b, c])` */
export function combineLatest<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>
>(
  v1: O1,
  v2: O2,
  v3: O3,
  v4: O4,
  v5: O5,
  scheduler?: SchedulerLike
): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>]>;
/** @deprecated Pass arguments in a single array instead `combineLatest([a, b, c])` */
export function combineLatest<
  O1 extends ObservableInput<any>,
  O2 extends ObservableInput<any>,
  O3 extends ObservableInput<any>,
  O4 extends ObservableInput<any>,
  O5 extends ObservableInput<any>,
  O6 extends ObservableInput<any>
>(
  v1: O1,
  v2: O2,
  v3: O3,
  v4: O4,
  v5: O5,
  v6: O6,
  scheduler?: SchedulerLike
): Observable<
  [ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>, ObservedValueOf<O6>]
>;

/** @deprecated Pass arguments in a single array instead `combineLatest([a, b, c])` */
export function combineLatest<O extends ObservableInput<any>>(...observables: O[]): Observable<any[]>;

/** @deprecated Pass arguments in a single array instead `combineLatest([a, b, c])` */
export function combineLatest<O extends ObservableInput<any>, R>(
  ...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>
): Observable<R>;

/** @deprecated resultSelector no longer supported, pipe to map instead */
export function combineLatest<O extends ObservableInput<any>, R>(
  array: O[],
  resultSelector: (...values: ObservedValueOf<O>[]) => R,
  scheduler?: SchedulerLike
): Observable<R>;

/** @deprecated Passing a scheduler here is deprecated, use {@link subscribeOn} and/or {@link observeOn} instead */
export function combineLatest<O extends ObservableInput<any>>(...observables: Array<O | SchedulerLike>): Observable<any[]>;

/** @deprecated Passing a scheduler here is deprecated, use {@link subscribeOn} and/or {@link observeOn} instead */
export function combineLatest<O extends ObservableInput<any>, R>(
  ...observables: Array<O | ((...values: ObservedValueOf<O>[]) => R) | SchedulerLike>
): Observable<R>;

/** @deprecated Passing a scheduler here is deprecated, use {@link subscribeOn} and/or {@link observeOn} instead */
export function combineLatest<R>(
  ...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R) | SchedulerLike>
): Observable<R>;

/**
 * Combines multiple Observables to create an Observable whose values are
 * calculated from the latest values of each of its input Observables.
 *
 * <span class="informal">Whenever any input Observable emits a value, it
 * computes a formula using the latest values from all the inputs, then emits
 * the output of that formula.</span>
 *
 * ![](combineLatest.png)
 *
 * `combineLatest` combines the values from all the Observables passed in the
 * observables array. This is done by subscribing to each Observable in order and,
 * whenever any Observable emits, collecting an array of the most recent
 * values from each Observable. So if you pass `n` Observables to this operator,
 * the returned Observable will always emit an array of `n` values, in an order
 * corresponding to the order of the passed Observables (the value from the first Observable
 * will be at index 0 of the array and so on).
 *
 * Static version of `combineLatest` accepts an array of Observables. Note that an array of
 * Observables is a good choice, if you don't know beforehand how many Observables
 * you will combine. Passing an empty array will result in an Observable that
 * completes immediately.
 *
 * To ensure the output array always has the same length, `combineLatest` will
 * actually wait for all input Observables to emit at least once,
 * before it starts emitting results. This means if some Observable emits
 * values before other Observables started emitting, all these values but the last
 * will be lost. On the other hand, if some Observable does not emit a value but
 * completes, resulting Observable will complete at the same moment without
 * emitting anything, since it will now be impossible to include a value from the
 * completed Observable in the resulting array. Also, if some input Observable does
 * not emit any value and never completes, `combineLatest` will also never emit
 * and never complete, since, again, it will wait for all streams to emit some
 * value.
 *
 * If at least one Observable was passed to `combineLatest` and all passed Observables
 * emitted something, the resulting Observable will complete when all combined
 * streams complete. So even if some Observable completes, the result of
 * `combineLatest` will still emit values when other Observables do. In case
 * of a completed Observable, its value from now on will always be the last
 * emitted value. On the other hand, if any Observable errors, `combineLatest`
 * will error immediately as well, and all other Observables will be unsubscribed.
 *
 * ## Examples
 * ### Combine two timer Observables
 * ```ts
 * import { combineLatest, timer } from 'rxjs';
 *
 * const firstTimer = timer(0, 1000); // emit 0, 1, 2... after every second, starting from now
 * const secondTimer = timer(500, 1000); // emit 0, 1, 2... after every second, starting 0,5s from now
 * const combinedTimers = combineLatest([firstTimer, secondTimer]);
 * combinedTimers.subscribe(value => console.log(value));
 * // Logs
 * // [0, 0] after 0.5s
 * // [1, 0] after 1s
 * // [1, 1] after 1.5s
 * // [2, 1] after 2s
 * ```
 * ### Combine a dictionary of Observables
 * ```ts
 * import { combineLatest, of } from 'rxjs';
 * import { delay, startWith } from 'rxjs/operators';
 *
 * const observables = {
 *   a: of(1).pipe(delay(1000), startWith(0)),
 *   b: of(5).pipe(delay(5000), startWith(0)),
 *   c: of(10).pipe(delay(10000), startWith(0))
 * };
 * const combined = combineLatest(observables);
 * combined.subscribe(value => console.log(value));
 * // Logs
 * // {a: 0, b: 0, c: 0} immediately
 * // {a: 1, b: 0, c: 0} after 1s
 * // {a: 1, b: 5, c: 0} after 5s
 * // {a: 1, b: 5, c: 10} after 10s
 * ```
 * ### Combine an array of Observables
 * ```ts
 * import { combineLatest, of } from 'rxjs';
 * import { delay, startWith } from 'rxjs/operators';
 *
 * const observables = [1, 5, 10].map(
 *   n => of(n).pipe(
 *     delay(n * 1000),   // emit 0 and then emit n after n seconds
 *     startWith(0),
 *   )
 * );
 * const combined = combineLatest(observables);
 * combined.subscribe(value => console.log(value));
 * // Logs
 * // [0, 0, 0] immediately
 * // [1, 0, 0] after 1s
 * // [1, 5, 0] after 5s
 * // [1, 5, 10] after 10s
 * ```
 *
 *
 * ### Use map operator to dynamically calculate the Body-Mass Index
 * ```ts
 * import { combineLatest, of } from 'rxjs';
 * import { map } from 'rxjs/operators';
 *
 * const weight = of(70, 72, 76, 79, 75);
 * const height = of(1.76, 1.77, 1.78);
 * const bmi = combineLatest([weight, height]).pipe(
 *   map(([w, h]) => w / (h * h)),
 * );
 * bmi.subscribe(x => console.log('BMI is ' + x));
 *
 * // With output to console:
 * // BMI is 24.212293388429753
 * // BMI is 23.93948099205209
 * // BMI is 23.671253629592222
 * ```
 *
 * @see {@link combineAll}
 * @see {@link merge}
 * @see {@link withLatestFrom}
 *
 * @param {ObservableInput} [observables] An array of input Observables to combine with each other.
 * An array of Observables must be given as the first argument.
 * @param {function} [project] An optional function to project the values from
 * the combined latest values into a new value on the output Observable.
 * @param {SchedulerLike} [scheduler=null] The {@link SchedulerLike} to use for subscribing to
 * each input Observable.
 * @return {Observable} An Observable of projected values from the most recent
 * values from each input Observable, or an array of the most recent values from
 * each input Observable.
 */
export function combineLatest<O extends ObservableInput<any>, R>(...args: any[]): Observable<R> | Observable<ObservedValueOf<O>[]> {
  const scheduler = popScheduler(args);
  const resultSelector = popResultSelector(args);

  const { args: observables, keys } = argsArgArrayOrObject(args);

  const result = new Observable<ObservedValueOf<O>[]>(
    combineLatestInit(
      observables as ObservableInput<ObservedValueOf<O>>[],
      scheduler,
      keys
        ? // A handler for scrubbing the array of args into a dictionary.
          (values: any[]) => {
            const value: any = {};
            for (let i = 0; i < values.length; i++) {
              value[keys![i]] = values[i];
            }
            return value;
          }
        : // A passthrough to just return the array
          identity
    )
  );

  if (resultSelector) {
    // Deprecated path: If there's a result selector, just use a map for them.
    return result.pipe(mapOneOrManyArgs(resultSelector)) as Observable<R>;
  }

  return result;
}

/**
 * Because of the current architecture, we need to use a subclassed Subscriber in order to ensure
 * inner firehose observables can teardown in the event of a `take` or the like.
 * @internal
 */
class CombineLatestSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>, protected _next: (value: T) => void, protected shouldComplete: () => boolean) {
    super(destination);
  }

  protected _complete() {
    if (this.shouldComplete()) {
      super._complete();
    } else {
      this.unsubscribe();
    }
  }
}

export function combineLatestInit(
  observables: ObservableInput<any>[],
  scheduler?: SchedulerLike,
  valueTransform: (values: any[]) => any = identity
) {
  return (subscriber: Subscriber<any>) => {
    // The outer subscription. We're capturing this in a function
    // because we may have to schedule it.
    const primarySubscribe = () => {
      const { length } = observables;
      // A store for the values each observable has emitted so far. We match observable to value on index.
      const values = new Array(length);
      // The number of currently active subscriptions, as they complete, we decrement this number to see if
      // we are all done combining values, so we can complete the result.
      let active = length;
      // A temporary array to help figure out if we have gotten at least one value from each observable.
      const hasValues = observables.map(() => false);
      let waitingForFirstValues = true;
      // Called when we're ready to emit a set of values. Note that we copy the values array to prevent mutation.
      const emit = () => subscriber.next(valueTransform(values.slice()));
      // The loop to kick off subscription. We're keying everything on index `i` to relate the observables passed
      // in to the slot in the output array or the key in the array of keys in the output dictionary.
      for (let i = 0; i < length; i++) {
        const subscribe = () => {
          const source = from(observables[i] as ObservableInput<any>, scheduler as any);
          source.subscribe(
            new CombineLatestSubscriber(
              subscriber,
              (value) => {
                values[i] = value;
                if (waitingForFirstValues) {
                  hasValues[i] = true;
                  waitingForFirstValues = !hasValues.every(identity);
                }
                if (!waitingForFirstValues) {
                  emit();
                }
              },
              () => --active === 0
            )
          );
        };
        maybeSchedule(scheduler, subscribe, subscriber);
      }
    };
    maybeSchedule(scheduler, primarySubscribe, subscriber);
  };
}

/**
 * A small utility to handle the couple of locations where we want to schedule if a scheduler was provided,
 * but we don't if there was no scheduler.
 */
function maybeSchedule(scheduler: SchedulerLike | undefined, execute: () => void, subscription: Subscription) {
  if (scheduler) {
    subscription.add(scheduler.schedule(execute));
  } else {
    execute();
  }
}
