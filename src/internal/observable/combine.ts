import { Observable } from '../Observable';
import { ObservableInput, SchedulerLike, ObservedValueOf, ObservableInputTuple } from '../types';
import { argsArgArrayOrObject } from '../util/argsArgArrayOrObject';
import { Subscriber } from '../Subscriber';
import { from } from './from';
import { identity } from '../util/identity';
import { Tetris } from '../util/tetris';
import { Subscription } from '../Subscription';
import { mapOneOrManyArgs } from '../util/mapOneOrManyArgs';
import { popResultSelector, popScheduler } from '../util/args';
import { createObject } from '../util/createObject';
import { OperatorSubscriber } from '../operators/OperatorSubscriber';
import { AnyCatcher } from '../AnyCatcher';
import { executeSchedule } from '../util/executeSchedule';

// combine(any)
// We put this first because we need to catch cases where the user has supplied
// _exactly `any`_ as the argument. Since `any` literally matches _anything_,
// we don't want it to randomly hit one of the other type signatures below,
// as we have no idea at build-time what type we should be returning when given an any.

/**
 * You have passed `any` here, we can't figure out if it is
 * an array or an object, so you're getting `unknown`. Use better types.
 * @param arg Something typed as `any`
 */
export function combine<T extends AnyCatcher>(arg: T): Observable<unknown>;

// combine([a, b, c])
export function combine(sources: []): Observable<never>;
export function combine<A extends readonly unknown[]>(sources: readonly [...ObservableInputTuple<A>]): Observable<A>;

export function combine<A extends readonly unknown[], R>(
  sources: readonly [...ObservableInputTuple<A>],
  resultSelector: (...values: A) => R
): Observable<R>;

// combine({a, b, c})
export function combine(sourcesObject: { [K in any]: never }): Observable<never>;
export function combine<T extends Record<string, ObservableInput<any>>>(
  sourcesObject: T
): Observable<{ [K in keyof T]: ObservedValueOf<T[K]> }>;

/**
 * Combines multiple Observables to create an Observable whose values are
 * calculated from the time of subscription to its input Observables.
 *
 * <span class="informal">Whenever any input Observable emits a value, it
 * computes a formula using the values from all the inputs, then emits
 * the output of that formula.</span>
 *
 * ![](combine.png)
 *
 * `combine` combines the values from all the Observables passed in the
 * observables array. This is done by subscribing to each Observable in order and,
 * whenever any Observable emits, collecting an array of values from each Observable. So if you pass `n` Observables
 * to this operator, the returned Observable will always emit an array of `n` values, in an order
 * corresponding to the order of the passed Observables (the value from the first Observable
 * will be at index 0 of the array and so on).
 *
 * Static version of `combine` accepts an array of Observables. Note that an array of
 * Observables is a good choice, if you don't know beforehand how many Observables
 * you will combine. Passing an empty array will result in an Observable that
 * completes immediately.
 *
 * To ensure the output array always has the same length, `combine` will
 * actually wait for all input Observables to emit at least once,
 * before it starts emitting results. If some Observable does not emit a value but
 * completes, resulting Observable will complete at the same moment without
 * emitting anything, since it will now be impossible to include a value from the
 * completed Observable in the resulting array. Also, if some input Observable does
 * not emit any value and never completes, `combine` will also never emit
 * and never complete, since, again, it will wait for all streams to emit some
 * value.
 *
 * If at least one Observable was passed to `combine` and all passed Observables
 * emitted something, the resulting Observable will complete when all combined
 * streams complete. So even if some Observable completes, the result of
 * `combine` will still emit values when other Observables do. In case
 * of a completed Observable, its value from now on will always be the last
 * emitted value. On the other hand, if any Observable errors, `combine`
 * will error immediately as well, and all other Observables will be unsubscribed.
 *
 * ## Examples
 *
 * Combine two timer Observables
 *
 * ```ts
 * import { timer, combine } from 'rxjs';
 *
 * const firstTimer = timer(0, 1000); // emit 0, 1, 2... after every second, starting from now
 * const secondTimer = timer(500, 1000); // emit 0, 1, 2... after every second, starting 0,5s from now
 * const combinedTimers = combine([firstTimer, secondTimer]);
 * combinedTimers.subscribe(value => console.log(value));
 * // Logs
 * // [0, 0] after 0.5s
 * // [1, 0] after 1s
 * // [1, 1] after 1.5s
 * // [2, 1] after 2s
 * ```
 *
 * Combine a dictionary of Observables
 *
 * ```ts
 * import { of, delay, startWith, combine } from 'rxjs';
 *
 * const observables = {
 *   a: of(1).pipe(delay(1000), startWith(0)),
 *   b: of(5).pipe(delay(5000), startWith(0)),
 *   c: of(10).pipe(delay(10000), startWith(0))
 * };
 * const combined = combine(observables);
 * combined.subscribe(value => console.log(value));
 * // Logs
 * // { a: 0, b: 0, c: 0 } immediately
 * // { a: 1, b: 0, c: 0 } after 1s
 * // { a: 1, b: 5, c: 0 } after 5s
 * // { a: 1, b: 5, c: 10 } after 10s
 * ```
 *
 * Combine an array of Observables
 *
 * ```ts
 * import { of, delay, startWith, combine } from 'rxjs';
 *
 * const observables = [1, 5, 10].map(
 *   n => of(n).pipe(
 *     delay(n * 1000), // emit 0 and then emit n after n seconds
 *     startWith(0)
 *   )
 * );
 * const combined = combine(observables);
 * combined.subscribe(value => console.log(value));
 * // Logs
 * // [0, 0, 0] immediately
 * // [1, 0, 0] after 1s
 * // [1, 5, 0] after 5s
 * // [1, 5, 10] after 10s
 * ```
 *
 * Use map operator to dynamically calculate the Body-Mass Index
 *
 * ```ts
 * import { of, combine, map } from 'rxjs';
 *
 * const weight = of(70, 72, 76, 79, 75);
 * const height = of(1.76, 1.77, 1.78);
 * const bmi = combine([weight, height]).pipe(
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
 * the combined values into a new value on the output Observable.
 * @param {SchedulerLike} [scheduler=null] The {@link SchedulerLike} to use for subscribing to
 * each input Observable.
 * @return {Observable} An Observable of projected values from the most recent
 * values from each input Observable, or an array of the most recent values from
 * each input Observable.
 */
export function combine<O extends ObservableInput<any>, R>(...args: any[]): Observable<R> | Observable<ObservedValueOf<O>[]> {
  const scheduler = popScheduler(args);
  const resultSelector = popResultSelector(args);

  const { args: observables, keys } = argsArgArrayOrObject(args);

  if (observables.length === 0) {
    // If no observables are passed, or someone has passed an ampty array
    // of observables, or even an empty object POJO, we need to just
    // complete (EMPTY), but we have to honor the scheduler provided if any.
    return from([], scheduler as any);
  }

  const result = new Observable<ObservedValueOf<O>[]>(
    combineInit(
      observables as ObservableInput<ObservedValueOf<O>>[],
      scheduler,
      keys
        ? // A handler for scrubbing the array of args into a dictionary.
          (values) => createObject(keys, values)
        : // A passthrough to just return the array
          identity
    )
  );

  return resultSelector ? (result.pipe(mapOneOrManyArgs(resultSelector)) as Observable<R>) : result;
}

export function combineInit(
  observables: ObservableInput<any>[],
  scheduler?: SchedulerLike,
  valueTransform: (values: any[]) => any = identity
) {
  return (subscriber: Subscriber<any>) => {
    // The outer subscription. We're capturing this in a function
    // because we may have to schedule it.
    maybeSchedule(
      scheduler,
      () => {
        const { length } = observables;
        // A store for the values each observable has emitted so far. We match observable to value on index.
        const tetris = new Tetris(length);
        // The number of currently active subscriptions, as they complete, we decrement this number to see if
        // we are all done combining values, so we can complete the result.
        let active = length;
        // The loop to kick off subscription. We're keying everything on index `i` to relate the observables passed
        // in to the slot in the output array or the key in the array of keys in the output dictionary.
        for (let i = 0; i < length; i++) {
          maybeSchedule(
            scheduler,
            () => {
              const source = from(observables[i], scheduler as any);
              source.subscribe(
                new OperatorSubscriber(
                  subscriber,
                  (value) => {
                    // When we get a value, record it in our set of values.
                    tetris.pushToColumn(i, value);
                    while (tetris.hasNext()) {
                      const next = tetris.getNext();
                      // We're not waiting for any more
                      // first values, so we can emit!
                      subscriber.next(valueTransform(next));
                    }
                  },
                  () => {
                    if (!--active) {
                      // We only complete the result if we have no more active
                      // inner observables.
                      subscriber.complete();
                    }
                  }
                )
              );
            },
            subscriber
          );
        }
      },
      subscriber
    );
  };
}

/**
 * A small utility to handle the couple of locations where we want to schedule if a scheduler was provided,
 * but we don't if there was no scheduler.
 */
function maybeSchedule(scheduler: SchedulerLike | undefined, execute: () => void, subscription: Subscription) {
  if (scheduler) {
    executeSchedule(subscription, scheduler, execute);
  } else {
    execute();
  }
}
