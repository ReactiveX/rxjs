/*
 * This file and its definitions are needed just so that ESDoc sees these
 * JSDoc documentation comments. Originally they were meant for some TypeScript
 * interfaces, but TypeScript strips away JSDoc comments near interfaces. Hence,
 * we need these bogus classes, which are not stripped away. This file on the
 * other hand, is not included in the release bundle.
 */
import {Subscriber} from './Subscriber';
import {TeardownLogic} from './Subscription';
import {Observable} from './Observable';
import {Subscription} from './Subscription';
import {Action} from './scheduler/Action';
import './scheduler/MiscJSDoc';
import './observable/dom/MiscJSDoc';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class ObservableDoc {
  /**
   * Creates a new Observable that will execute the specified function when a
   * {@link Subscriber} subscribes to it.
   *
   * <span class="informal">Creates an Observable with custom logic given in
   * the `subscribe` function.</span>
   *
   * <img src="./img/create.png" width="100%">
   *
   * `create` converts a `subscribe` function to an actual Observable. This is
   * equivalent to calling the Observable constructor. Write the `subscribe`
   * function so that it behaves as an Observable: It should invoke the
   * Subscriber's `next`, `error`, and `complete` methods following the
   * *Observable Contract*. A well-formed Observable must invoke either the
   * Subscriber's `complete` method exactly once or its `error` method exactly
   * once, and invoke nothing else thereafter.
   *
   * Most of the times you should not need to use `create` because existing
   * creation operators (together with instance combination operators) allow you
   * to create an Observable for most of the use cases. However, `create` is
   * low-level and is able to create any Observable.
   *
   * @example <caption>Emit three random numbers, then complete.</caption>
   * var result = Rx.Observable.create(function (subscriber) {
   *   subscriber.next(Math.random());
   *   subscriber.next(Math.random());
   *   subscriber.next(Math.random());
   *   subscriber.complete();
   * });
   * result.subscribe(x => console.log(x));
   *
   * @see {@link empty}
   * @see {@link never}
   * @see {@link of}
   * @see {@link throw}
   *
   * @param {function(subscriber: Subscriber): TeardownLogic} [subscribe] A
   * function that accepts a {@link Subscriber}, and invokes its `next`,
   * `error`, and `complete` methods as appropriate, and should return some
   * logic for tear down, either as a {@link Subscription} or as a function.
   * @return {Observable} An Observable that, when subscribed, will execute the
   * specified function.
   * @static true
   * @name create
   * @owner Observable
   */
  static create<T>(subscribe?: <R>(subscriber: Subscriber<R>) => TeardownLogic): Observable<T> {
    return new Observable<T>(subscribe);
  };
}

/**
 * An interface for a consumer of push-based notifications delivered by an
 * {@link Observable}.
 *
 * ```ts
 * interface Observer<T> {
 *   isUnsubscribed?: boolean;
 *   next: (value: T) => void;
 *   error: (err: any) => void;
 *   complete: () => void;
 * }
 * ```
 *
 * An object conforming to the Observer interface is usually
 * given to the `observable.subscribe(observer)` method, and the Observable will
 * call the Observer's `next(value)` method to provide notifications. A
 * well-behaved Observable will call an Observer's `complete()` method exactly
 * once or the Observer's `error(err)` method exactly once, as the last
 * notification delivered.
 *
 * @interface
 * @name Observer
 * @noimport true
 */
export class ObserverDoc<T> {
  /**
   * An optional flag to indicate whether this Observer, when used as a
   * subscriber, has already been unsubscribed from its Observable.
   * @type {boolean}
   */
  isUnsubscribed: boolean = false;
  /**
   * The callback to receive notifications of type `next` from the Observable,
   * with a value. The Observable may call this method 0 or more times.
   * @param {T} value The `next` value.
   * @return {void}
   */
  next(value: T): void {
    return void 0;
  }
  /**
   * The callback to receive notifications of type `error` from the Observable,
   * with an attached {@link Error}. Notifies the Observer that the Observable
   * has experienced an error condition.
   * @param {any} err The `error` exception.
   * @return {void}
   */
  error(err: any): void {
    return void 0;
  }
  /**
   * The callback to receive a valueless notification of type `complete` from
   * the Observable. Notifies the Observer that the Observable has finished
   * sending push-based notifications.
   * @return {void}
   */
  complete(): void {
    return void 0;
  }
}

/**
 * An execution context and a data structure to order tasks and schedule their
 * execution. Provides a notion of (potentially virtual) time, through the
 * `now()` getter method.
 *
 * Each unit of work in a Scheduler is called an {@link Action}.
 *
 * ```ts
 * interface Scheduler {
 *   now(): number;
 *   schedule(work, delay?, state?): Subscription;
 *   flush(): void;
 *   active: boolean;
 *   actions: Action[];
 *   scheduledId: number;
 * }
 * ```
 *
 * @interface
 * @name Scheduler
 * @noimport true
 */
export class SchedulerDoc {
  /**
   * A getter method that returns a number representing the current time
   * (at the time this function was called) according to the scheduler's own
   * internal clock.
   * @return {number} A number that represents the current time. May or may not
   * have a relation to wall-clock time. May or may not refer to a time unit
   * (e.g. milliseconds).
   */
  now(): number {
    return 0;
  }

  /**
   * Schedules a function, `work`, for execution. May happen at some point in
   * the future, according to the `delay` parameter, if specified. May be passed
   * some context object, `state`, which will be passed to the `work` function.
   *
   * The given arguments will be processed an stored as an Action object in a
   * queue of actions.
   *
   * @param {function(state: ?T): ?Subscription} work A function representing a
   * task, or some unit of work to be executed by the Scheduler.
   * @param {number} [delay] Time to wait before executing the work, where the
   * time unit is implicit and defined by the Scheduler itself.
   * @param {T} [state] Some contextual data that the `work` function uses when
   * called by the Scheduler.
   * @return {Subscription} A subscription in order to be able to unsubscribe
   * the scheduled work.
   */
  schedule<T>(work: (state?: T) => Subscription | void, delay?: number, state?: T): Subscription {
    return void 0;
  }

  /**
   * Prompt the Scheduler to execute all of its queued actions, therefore
   * clearing its queue.
   * @return {void}
   */
  flush(): void {
    return void 0;
  }

  /**
   * A flag to indicate whether the Scheduler is currently executing a batch of
   * queued actions.
   * @type {boolean}
   */
  active: boolean = false;

  /**
   * The queue of scheduled actions as an array.
   * @type {Action[]}
   */
  actions: Action<any>[] = [];

  /**
   * An internal ID used to track the latest asynchronous task such as those
   * coming from `setTimeout`, `setInterval`, `requestAnimationFrame`, and
   * others.
   * @type {number}
   */
  scheduledId: number = 0;
}
