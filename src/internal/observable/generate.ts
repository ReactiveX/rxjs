import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { identity } from '../util/identity';
import { SchedulerAction, SchedulerLike } from '../types';
import { isScheduler } from '../util/isScheduler';

export type ConditionFunc<S> = (state: S) => boolean;
export type IterateFunc<S> = (state: S) => S;
export type ResultFunc<S, T> = (state: S) => T;

interface SchedulerState<T, S> {
  needIterate?: boolean;
  state: S;
  subscriber: Subscriber<T>;
  condition?: ConditionFunc<S>;
  iterate: IterateFunc<S>;
  resultSelector: ResultFunc<S, T>;
}

export interface GenerateBaseOptions<S> {
  /**
   * Initial state.
   */
  initialState: S;
  /**
   * Condition function that accepts state and returns boolean.
   * When it returns false, the generator stops.
   * If not specified, a generator never stops.
   */
  condition?: ConditionFunc<S>;
  /**
   * Iterate function that accepts state and returns new state.
   */
  iterate: IterateFunc<S>;
  /**
   * SchedulerLike to use for generation process.
   * By default, a generator starts immediately.
   */
  scheduler?: SchedulerLike;
}

export interface GenerateOptions<T, S> extends GenerateBaseOptions<S> {
  /**
   * Result selection function that accepts state and returns a value to emit.
   */
  resultSelector: ResultFunc<S, T>;
}

/**
 * Generates an observable sequence by running a state-driven loop
 * producing the sequence's elements, using the specified scheduler
 * to send out observer messages.
 *
 * <img src="./img/generate.png" width="100%">
 *
 * @example <caption>Produces sequence of 0, 1, 2, ... 9, then completes.</caption>
 * var res = Rx.Observable.generate(0, x => x < 10, x => x + 1, x => x);
 *
 * @example <caption>Using asap scheduler, produces sequence of 2, 3, 5, then completes.</caption>
 * var res = Rx.Observable.generate(1, x => x < 5, x =>  * 2, x => x + 1, Rx.Scheduler.asap);
 *
 * @see {@link from}
 * @see {@link create}
 *
 * @param {S} initialState Initial state.
 * @param {function (state: S): boolean} condition Condition to terminate generation (upon returning false).
 * @param {function (state: S): S} iterate Iteration step function.
 * @param {function (state: S): T} resultSelector Selector function for results produced in the sequence.
 * @param {Scheduler} [scheduler] A {@link SchedulerLike} on which to run the generator loop. If not provided, defaults to emit immediately.
 * @returns {Observable<T>} The generated sequence.
 */
  export function generate<T, S>(initialState: S,
                                 condition: ConditionFunc<S>,
                                 iterate: IterateFunc<S>,
                                 resultSelector: ResultFunc<S, T>,
                                 scheduler?: SchedulerLike): Observable<T>;

/**
 * Generates an observable sequence by running a state-driven loop
 * producing the sequence's elements, using the specified scheduler
 * to send out observer messages.
 * The overload uses state as an emitted value.
 *
 * <img src="./img/generate.png" width="100%">
 *
 * @example <caption>Produces sequence of 0, 1, 2, ... 9, then completes.</caption>
 * var res = Rx.Observable.generate(0, x => x < 10, x => x + 1);
 *
 * @example <caption>Using asap scheduler, produces sequence of 1, 2, 4, then completes.</caption>
 * var res = Rx.Observable.generate(1, x => x < 5, x => x  * 2, Rx.Scheduler.asap);
 *
 * @see {@link from}
 * @see {@link create}
 *
 * @param {S} initialState Initial state.
 * @param {function (state: S): boolean} condition Condition to terminate generation (upon returning false).
 * @param {function (state: S): S} iterate Iteration step function.
 * @param {Scheduler} [scheduler] A {@link SchedulerLike} on which to run the generator loop. If not provided, defaults to emit immediately.
 * @returns {Observable<S>} The generated sequence.
 */
export function generate<S>(initialState: S,
                            condition: ConditionFunc<S>,
                            iterate: IterateFunc<S>,
                            scheduler?: SchedulerLike): Observable<S>;

/**
 * Generates an observable sequence by running a state-driven loop
 * producing the sequence's elements, using the specified scheduler
 * to send out observer messages.
 * The overload accepts options object that might contain initial state, iterate,
 * condition and scheduler.
 *
 * <img src="./img/generate.png" width="100%">
 *
 * @example <caption>Produces sequence of 0, 1, 2, ... 9, then completes.</caption>
 * var res = Rx.Observable.generate({
 *   initialState: 0,
 *   condition: x => x < 10,
 *   iterate: x => x + 1
 * });
 *
 * @see {@link from}
 * @see {@link create}
 *
 * @param {GenerateBaseOptions<S>} options Object that must contain initialState, iterate and might contain condition and scheduler.
 * @returns {Observable<S>} The generated sequence.
 */
export function generate<S>(options: GenerateBaseOptions<S>): Observable<S>;

/**
 * Generates an observable sequence by running a state-driven loop
 * producing the sequence's elements, using the specified scheduler
 * to send out observer messages.
 * The overload accepts options object that might contain initial state, iterate,
 * condition, result selector and scheduler.
 *
 * <img src="./img/generate.png" width="100%">
 *
 * @example <caption>Produces sequence of 0, 1, 2, ... 9, then completes.</caption>
 * var res = Rx.Observable.generate({
 *   initialState: 0,
 *   condition: x => x < 10,
 *   iterate: x => x + 1,
 *   resultSelector: x => x
 * });
 *
 * @see {@link from}
 * @see {@link create}
 *
 * @param {GenerateOptions<T, S>} options Object that must contain initialState, iterate, resultSelector and might contain condition and scheduler.
 * @returns {Observable<T>} The generated sequence.
 */
export function generate<T, S>(options: GenerateOptions<T, S>): Observable<T>;

export function generate<T, S>(initialStateOrOptions: S | GenerateOptions<T, S>,
                               condition?: ConditionFunc<S>,
                               iterate?: IterateFunc<S>,
                               resultSelectorOrObservable?: (ResultFunc<S, T>) | SchedulerLike,
                               scheduler?: SchedulerLike): Observable<T> {

  let resultSelector: ResultFunc<S, T>;
  let initialState: S;

  if (arguments.length == 1) {
    const options = initialStateOrOptions as GenerateOptions<T, S>;
    initialState = options.initialState;
    condition = options.condition;
    iterate = options.iterate;
    resultSelector = options.resultSelector || identity as ResultFunc<S, T>;
    scheduler = options.scheduler;
  } else if (resultSelectorOrObservable === undefined || isScheduler(resultSelectorOrObservable)) {
    initialState = initialStateOrOptions as S;
    resultSelector = identity as ResultFunc<S, T>;
    scheduler = resultSelectorOrObservable as SchedulerLike;
  } else {
    initialState = initialStateOrOptions as S;
    resultSelector = resultSelectorOrObservable as ResultFunc<S, T>;
  }

  return new Observable<T>(subscriber => {
    let state = initialState;
    if (scheduler) {
      return scheduler.schedule<SchedulerState<T, S>>(dispatch, 0, {
        subscriber,
        iterate,
        condition,
        resultSelector,
        state
      });
    }

    do {
      if (condition) {
        let conditionResult: boolean;
        try {
          conditionResult = condition(state);
        } catch (err) {
          subscriber.error(err);
          return undefined;
        }
        if (!conditionResult) {
          subscriber.complete();
          break;
        }
      }
      let value: T;
      try {
        value = resultSelector(state);
      } catch (err) {
        subscriber.error(err);
        return undefined;
      }
      subscriber.next(value);
      if (subscriber.closed) {
        break;
      }
      try {
        state = iterate(state);
      } catch (err) {
        subscriber.error(err);
        return undefined;
      }
    } while (true);

    return undefined;
  });
}

function dispatch<T, S>(this: SchedulerAction<SchedulerState<T, S>>, state: SchedulerState<T, S>) {
  const { subscriber, condition } = state;
  if (subscriber.closed) {
    return undefined;
  }
  if (state.needIterate) {
    try {
      state.state = state.iterate(state.state);
    } catch (err) {
      subscriber.error(err);
      return undefined;
    }
  } else {
    state.needIterate = true;
  }
  if (condition) {
    let conditionResult: boolean;
    try {
      conditionResult = condition(state.state);
    } catch (err) {
      subscriber.error(err);
      return undefined;
    }
    if (!conditionResult) {
      subscriber.complete();
      return undefined;
    }
    if (subscriber.closed) {
      return undefined;
    }
  }
  let value: T;
  try {
    value = state.resultSelector(state.state);
  } catch (err) {
    subscriber.error(err);
    return undefined;
  }
  if (subscriber.closed) {
    return undefined;
  }
  subscriber.next(value);
  if (subscriber.closed) {
    return undefined;
  }
  return this.schedule(state);
}
