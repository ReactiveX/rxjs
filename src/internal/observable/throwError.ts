/** @prettier */
import { Observable } from '../Observable';
import { SchedulerLike } from '../types';
import { Subscriber } from '../Subscriber';

/**
 * Creates an observable that will create an error instance and push it to the consumer as an error
 * immediately upon subscription.
 *
 * <span class="informal">Just errors and does nothing else</span>
 *
 * ![](throw.png)
 *
 * This creation function is useful for creating an observable that will create an error and error every
 * time it is subscribed to. Generally, inside of most operators when you might want to return an errored
 * observable, this is unnecessary. In most cases, such as in the inner return of {@link concatMap},
 * {@link mergeMap}, {@link defer}, and many others, you can simply throw the error, and RxJS will pick
 * that up and notify the consumer of the error.
 *
 * ## Example
 *
 * Create a simple observable that will create a new error with a timestamp and log it
 * and the message every time you subscribe to it.
 *
 * ```ts
 * import { throwError } from 'rxjs';
 *
 * let errorCount = 0;
 *
 * const errorWithTimestamp$ = throwError(() => {
 *    const error: any = new Error(`This is error number ${++errorCount}`);
 *    error.timestamp = Date.now();
 *    return error;
 * });
 *
 * errorWithTimesptamp$.subscribe({
 *    error: err => console.log(err.timestamp, err.message)
 * });
 *
 * errorWithTimesptamp$.subscribe({
 *    error: err => console.log(err.timestamp, err.message)
 * });
 *
 * // Logs the timestamp and a new error message each subscription;
 * ```
 *
 * ## Unnecessary usage
 *
 * Using `throwError` inside of an operator or creation function
 * with a callback, is usually not necessary:
 * 
 * ```ts
 * import { throwError, timer, of } from 'rxjs';
 * import { concatMap } from 'rxjs/operators';
 *
 * const delays$ = of(1000, 2000, Infinity, 3000);
 *
 * delays$.pipe(
 *    concatMap(ms => {
 *      if (ms < 10000) {
 *        return timer(ms);
 *      } else {
 *        // This is probably overkill.
 *        return throwError(() => new Error(`Invalid time ${ms}`));
 *      }
 *    })
 * )
 * .subscribe({
 *    next: console.log,
 *    error: console.error
 * });
 * ```
 * 
 * You can just throw the error instead:
 * 
 * ```ts
 * import { throwError, timer, of } from 'rxjs';
 * import { concatMap } from 'rxjs/operators';
 *
 * const delays$ = of(1000, 2000, Infinity, 3000);
 *
 * delays$.pipe(
 *    concatMap(ms => {
 *      if (ms < 10000) {
 *        return timer(ms);
 *      } else {
 *        // Cleaner and easier to read for most folks.
 *        throw new Error(`Invalid time ${ms}`);
 *      }
 *    })
 * )
 * .subscribe({
 *    next: console.log,
 *    error: console.error
 * });
 * ```
 *
 * @param errorFactory A factory function that will create the error instance that is pushed.
 */
export function throwError(errorFactory: () => any): Observable<never>;

/**
 * Returns an observable that will error with the specified error immediately upon subscription.
 *
 * @param error The error instance to emit
 * @deprecated Removed in v8. Instead, pass a factory function to `throwError(() => new Error('test'))`. This is
 * because it will create the error at the moment it should be created and capture a more appropriate stack trace. If
 * for some reason you need to create the error ahead of time, you can still do that: `const err = new Error('test'); throwError(() => err);`.
 */
export function throwError(error: any): Observable<never>;

/**
 * Notifies the consumer of an error using a given scheduler by scheduling it at delay `0` upon subscription.
 *
 * @param errorOrErrorFactory An error instance or error factory
 * @param scheduler A scheduler to use to schedule the error notification
 * @deprecated Use `throwError` in combination with {@link observeOn}:
 * `throwError(() => new Error('test')).pipe(observeOn(scheduler));`
 */
export function throwError(errorOrErrorFactory: any, scheduler: SchedulerLike): Observable<never>;

/**
 * Creates an Observable that emits no items to the Observer and immediately
 * emits an error notification.
 *
 * <span class="informal">Just emits 'error', and nothing else.
 * </span>
 *
 * ![](throw.png)
 *
 * This static operator is useful for creating a simple Observable that only
 * emits the error notification. It can be used for composing with other
 * Observables, such as in a {@link mergeMap}.
 *
 * ## Examples
 * ### Emit the number 7, then emit an error
 * ```ts
 * import { throwError, concat, of } from 'rxjs';
 *
 * const result = concat(of(7), throwError(new Error('oops!')));
 * result.subscribe(x => console.log(x), e => console.error(e));
 *
 * // Logs:
 * // 7
 * // Error: oops!
 * ```
 *
 * ---
 *
 * ### Map and flatten numbers to the sequence 'a', 'b', 'c', but throw an error for 2
 * ```ts
 * import { throwError, interval, of } from 'rxjs';
 * import { mergeMap } from 'rxjs/operators';
 *
 * interval(1000).pipe(
 *   mergeMap(x => x === 2
 *     ? throwError('Twos are bad')
 *     : of('a', 'b', 'c')
 *   ),
 * ).subscribe(x => console.log(x), e => console.error(e));
 *
 * // Logs:
 * // a
 * // b
 * // c
 * // a
 * // b
 * // c
 * // Twos are bad
 * ```
 *
 * @see {@link Observable}
 * @see {@link empty}
 * @see {@link never}
 * @see {@link of}
 *
 * @param {any} errorOrErrorFactory The particular Error to pass to the error notification.
 * @param {SchedulerLike} [scheduler] A {@link SchedulerLike} to use for scheduling
 * the emission of the error notification.
 * @return {Observable} An error Observable: emits only the error notification
 * using the given error argument.
 * @static true
 * @name throwError
 * @owner Observable
 */
export function throwError(errorOrErrorFactory: any, scheduler?: SchedulerLike): Observable<never> {
  if (!scheduler) {
    return new Observable((subscriber) =>
      subscriber.error(typeof errorOrErrorFactory === 'function' ? errorOrErrorFactory() : errorOrErrorFactory)
    );
  } else {
    return new Observable((subscriber) =>
      scheduler.schedule(() => {
        subscriber.error(typeof errorOrErrorFactory === 'function' ? errorOrErrorFactory() : errorOrErrorFactory);
      })
    );
  }
}

interface DispatchArg {
  error: any;
  subscriber: Subscriber<any>;
}

function dispatch({ error, subscriber }: DispatchArg) {
  subscriber.error(error);
}
