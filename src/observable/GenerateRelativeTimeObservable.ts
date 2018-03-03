import { IScheduler } from '../Scheduler';
import { Action } from '../scheduler/Action';
import { Observable } from '../Observable' ;
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { isScheduler } from '../util/isScheduler';
import { async } from '../scheduler/async';

const selfSelector = <T>(value: T) => value;

export type ConditionFunc<S> = (state: S) => boolean;
export type IterateFunc<S> = (state: S) => S;
export type ResultFunc<S, T> = (state: S) => T;
export type TimeSelectorFunc<S> = (state: S) => number;

interface SchedulerState<T, S> {
  notFirst?: boolean;
  result?: T;
  state: S;
  subscriber: Subscriber<T>;
  condition?: ConditionFunc<S>;
  iterate: IterateFunc<S>;
  resultSelector: ResultFunc<S, T>;
  timeSelector: TimeSelectorFunc<S>;
}

export interface GenerateRelativeTimeBaseOptions<S> {
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
   * Time selector function to control the speed of values being produced each
   * iteration, returning integer values denoting milliseconds.
   */
  timeSelector: TimeSelectorFunc<S>;
  /**
   * IScheduler to use for generation process.
   * By default, a generator starts immediately.
  */
  scheduler?: IScheduler;
}

export interface GenerateRelativeTimeOptions<T, S> extends GenerateRelativeTimeBaseOptions<S> {
  /**
   * Result selection function that accepts state and returns a value to emit.
   */
  resultSelector: ResultFunc<S, T>;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class GenerateRelativeTimeObservable<T, S> extends Observable<T> {
  constructor(private initialState: S,
              private condition: ConditionFunc<S>,
              private iterate: IterateFunc<S>,
              private resultSelector: ResultFunc<S, T>,
              private timeSelector: TimeSelectorFunc<S>,
              private scheduler: IScheduler = async) {
      super();
  }

  /**
   * Generates an observable sequence by running a state-driven loop
   * producing the sequence's elements, using the specified scheduler
   * to send out observer messages. By default, this operator uses the
   * `async` IScheduler to provide a notion of time, but you may pass any
   * IScheduler to it.
   *
   * <img src="./img/generateRelativeTime.png" width="100%">
   *
   * @example <caption>Produces sequence of 0, 1, 2, ... 5, then completes.</caption>
   * var res = Rx.Observable.generateRelativeTime(1, x => x < 6, x => x + 1, x => x, x => 1000);
   *
   * @example <caption>Using asap scheduler, produces sequence of 2, 3, 5, then completes.</caption>
   * var res = Rx.Observable.generateRelativeTime(1, x => x < 5, x => x * 2, x => x + 1, x => 0, Rx.Scheduler.asap);
   *
   * @see {@link from}
   * @see {@link create}
   *
   * @param {S} initialState Initial state.
   * @param {function (state: S): boolean} condition Condition to terminate generation (upon returning false).
   * @param {function (state: S): S} iterate Iteration step function.
   * @param {function (state: S): T} resultSelector Selector function for results produced in the sequence.
   * @param {function (state: S): number} timeSelector Time selector function to control the speed of values being produced each iteration, returning
   * integer values denoting milliseconds.
   * @param {Scheduler} [scheduler=async] A {@link IScheduler} on which to run the generator loop. If not provided, defaults to Scheduler.async.
   * @returns {Observable<T>} The generated sequence.
   */
  static create<T, S>(initialState: S,
                      condition: ConditionFunc<S>,
                      iterate: IterateFunc<S>,
                      resultSelector: ResultFunc<S, T>,
                      timeSelector: TimeSelectorFunc<S>,
                      scheduler?: IScheduler): Observable<T>

  /**
   * Generates an observable sequence by running a state-driven loop
   * producing the sequence's elements, using the specified scheduler
   * to send out observer messages.
   * The overload uses state as an emitted value.
   *
   * <img src="./img/generateRelativeTime.png" width="100%">
   *
   * @example <caption>Produces sequence of 0, 1, 2, ... 5, then completes.</caption>
   * var res = Rx.Observable.generateRelativeTime(1, x => x < 6, x => x + 1, x => 1000);
   *
   * @example <caption>Using asap scheduler, produces sequence of 1, 2, 4, then completes.</caption>
   * var res = Rx.Observable.generateRelativeTime(1, x => x < 5, x => x * 2, x => 0, Rx.Scheduler.asap);
   *
   * @see {@link from}
   * @see {@link create}
   *
   * @param {S} initialState Initial state.
   * @param {function (state: S): boolean} condition Condition to terminate generation (upon returning false).
   * @param {function (state: S): S} iterate Iteration step function.
   * @param {function (state: S): number} timeSelector Time selector function to control the speed of values being produced each iteration, returning
   *  integer values denoting milliseconds.
   * @param {Scheduler} [scheduler] A {@link IScheduler} on which to run the generator loop. If not provided, defaults to Scheduler.async.
   * @returns {Observable<S>} The generated sequence.
   */
  static create<S>(initialState: S,
                   condition: ConditionFunc<S>,
                   iterate: IterateFunc<S>,
                   timeSelector: TimeSelectorFunc<S>,
                   scheduler?: IScheduler): Observable<S>

  /**
   * Generates an observable sequence by running a state-driven loop
   * producing the sequence's elements, using the specified scheduler
   * to send out observer messages.
   * The overload accepts options object that might contain initial state, iterate,
   * condition, timeSelector and scheduler.
   *
   * <img src="./img/generateRelativeTime.png" width="100%">
   *
   * @example <caption>Produces sequence of 0, 1, 2, ... 5, then completes.</caption>
   * var res = Rx.Observable.generate({
   *   initialState: 0,
   *   condition: x => x < 6,
   *   iterate: x => x + 1
   *   timeSelector: x => 1000
   * });
   *
   * @see {@link from}
   * @see {@link create}
   *
   * @param {GenerateRelativeTimeBaseOptions<S>} options Object that must contain initialState, iterate, timeSelector and might contain condition
   * and scheduler.
   * @returns {Observable<S>} The generated sequence.
   */
  static create<S>(options: GenerateRelativeTimeBaseOptions<S>): Observable<S>

  /**
   * Generates an observable sequence by running a state-driven loop
   * producing the sequence's elements, using the specified scheduler
   * to send out observer messages.
   * The overload accepts options object that might contain initial state, iterate,
   * condition, result selector, timeSelector and scheduler.
   *
   * <img src="./img/generateRelativeTime.png" width="100%">
   *
   * @example <caption>Produces sequence of 0, 1, 2, ... 5, then completes.</caption>
   * var res = Rx.Observable.generate({
   *   initialState: 0,
   *   condition: x => x < 6,
   *   iterate: x => x + 1,
   *   resultSelector: x => x
   *   timeSelector: x => 1000
   * });
   *
   * @see {@link from}
   * @see {@link create}
   *
   * @param {GenerateRelativeTimeOptions<T, S>} options Object that must contain initialState, iterate, timeSelector, resultSelector and might
   * contain condition and scheduler.
   * @returns {Observable<T>} The generated sequence.
   */
  static create<T, S>(options: GenerateRelativeTimeOptions<T, S>): Observable<T>

  static create<T, S>(initialStateOrOptions: S | GenerateRelativeTimeOptions<T, S>,
                      condition?: ConditionFunc<S>,
                      iterate?: IterateFunc<S>,
                      resultSelectorOrTimeSelector?: (ResultFunc<S, T>) | TimeSelectorFunc<S>,
                      timeSelectorOrScheduler?: TimeSelectorFunc<S> | IScheduler,
                      scheduler: IScheduler = async): Observable<T> {
    if (arguments.length == 1) {
      return new GenerateRelativeTimeObservable<T, S>(
        (<GenerateRelativeTimeOptions<T, S>>initialStateOrOptions).initialState,
        (<GenerateRelativeTimeOptions<T, S>>initialStateOrOptions).condition,
        (<GenerateRelativeTimeOptions<T, S>>initialStateOrOptions).iterate,
        (<GenerateRelativeTimeOptions<T, S>>initialStateOrOptions).resultSelector || selfSelector,
        (<GenerateRelativeTimeOptions<T, S>>initialStateOrOptions).timeSelector,
        (<GenerateRelativeTimeOptions<T, S>>initialStateOrOptions).scheduler || async);
    }

    if (timeSelectorOrScheduler === undefined || isScheduler(timeSelectorOrScheduler)) {
      return new GenerateRelativeTimeObservable<T, S>(
        <S>initialStateOrOptions,
        condition,
        iterate,
        selfSelector,
        <TimeSelectorFunc<S>>resultSelectorOrTimeSelector,
        <IScheduler>timeSelectorOrScheduler || async);
    }

    return new GenerateRelativeTimeObservable<T, S>(
      <S>initialStateOrOptions,
      condition,
      iterate,
      <ResultFunc<S, T>>resultSelectorOrTimeSelector,
      <TimeSelectorFunc<S>>timeSelectorOrScheduler,
      <IScheduler>scheduler);
  }

  protected _subscribe(subscriber: Subscriber<any>): Subscription | Function | void {
    let state = this.initialState;
    return this.scheduler.schedule<SchedulerState<T, S>>(GenerateRelativeTimeObservable.dispatch, 0, {
      subscriber,
      iterate: this.iterate,
      condition: this.condition,
      resultSelector: this.resultSelector,
      timeSelector: this.timeSelector,
      state });
  }

  private static dispatch<T, S>(state: SchedulerState<T, S>): Subscription | void {
    const { notFirst, result, subscriber, condition, resultSelector, timeSelector } = state;
    let time = 0;
    if (subscriber.closed) {
      return;
    }
    try {
      if (notFirst) {
        subscriber.next(result);
        if (subscriber.closed) {
          return;
        }
        state.state = state.iterate(state.state);
        if (subscriber.closed) {
          return;
        }
      } else {
        state.notFirst = true;
      }
      if (condition) {
        if (!condition(state.state)) {
          subscriber.complete();
          return;
        }
        if (subscriber.closed) {
          return;
        }
      }
      state.result = resultSelector(state.state);
      if (timeSelector) {
        time = timeSelector(state.state);
      }
      if (subscriber.closed) {
        return;
      }
    } catch (err) {
      subscriber.error(err);
      return;
    }
    return (<Action<SchedulerState<T, S>>><any>this).schedule(state, time);
  }
}
