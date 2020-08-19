/** @prettier */
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';

import { ObservableInput, OperatorFunction, ObservedValueOf } from '../types';
import { lift } from '../util/lift';
import { Subscription } from '../Subscription';
import { from } from '../observable/from';

/* tslint:disable:max-line-length */
export function catchError<T, O extends ObservableInput<any>>(
  selector: (err: any, caught: Observable<T>) => O
): OperatorFunction<T, T | ObservedValueOf<O>>;
/* tslint:enable:max-line-length */

/**
 * Catches errors on the observable to be handled by returning a new observable or throwing an error.
 *
 * <span class="informal">
 * It only listens to the error channel and ignores notifications.
 * Handles errors from the source observable, and maps them to a new observable.
 * The error may also be rethrown, or a new error can be thrown to emit an error from the result.
 * </span>
 *
 * ![](catch.png)
 *
 * This operator handles errors, but forwards along all other events to the resulting observable.
 * If the source observable terminates with an error, it will map that error to a new observable,
 * subscribe to it, and forward all of its events to the resulting observable.
 *
 * ## Examples
 * Continues with a different Observable when there's an error
 *
 * ```ts
 * import { of } from 'rxjs';
 * import { map, catchError } from 'rxjs/operators';
 *
 * of(1, 2, 3, 4, 5).pipe(
 *     map(n => {
 *   	   if (n === 4) {
 * 	       throw 'four!';
 *       }
 *	     return n;
 *     }),
 *     catchError(err => of('I', 'II', 'III', 'IV', 'V')),
 *   )
 *   .subscribe(x => console.log(x));
 *   // 1, 2, 3, I, II, III, IV, V
 * ```
 *
 * Retries the caught source Observable again in case of error, similar to retry() operator
 *
 * ```ts
 * import { of } from 'rxjs';
 * import { map, catchError, take } from 'rxjs/operators';
 *
 * of(1, 2, 3, 4, 5).pipe(
 *     map(n => {
 *   	   if (n === 4) {
 *   	     throw 'four!';
 *       }
 * 	     return n;
 *     }),
 *     catchError((err, caught) => caught),
 *     take(30),
 *   )
 *   .subscribe(x => console.log(x));
 *   // 1, 2, 3, 1, 2, 3, ...
 * ```
 *
 * Throws a new error when the source Observable throws an error
 *
 * ```ts
 * import { of } from 'rxjs';
 * import { map, catchError } from 'rxjs/operators';
 *
 * of(1, 2, 3, 4, 5).pipe(
 *     map(n => {
 *       if (n === 4) {
 *         throw 'four!';
 *       }
 *       return n;
 *     }),
 *     catchError(err => {
 *       throw 'error in source. Details: ' + err;
 *     }),
 *   )
 *   .subscribe(
 *     x => console.log(x),
 *     err => console.log(err)
 *   );
 *   // 1, 2, 3, error in source. Details: four!
 * ```
 *
 * @see {@link onErrorResumeNext}
 * @see {@link repeat}
 * @see {@link repeatWhen}
 * @see {@link retry }
 * @see {@link retryWhen}
 *
 *  @param {function} selector a function that takes as arguments `err`, which is the error, and `caught`, which
 *  is the source observable, in case you'd like to "retry" that observable by returning it again. Whatever observable
 *  is returned by the `selector` will be used to continue the observable chain.
 * @return {Observable} An observable that originates from either the source or the observable returned by the
 *  catch `selector` function.
 * @name catchError
 */
export function catchError<T, O extends ObservableInput<any>>(
  selector: (err: any, caught: Observable<T>) => O
): OperatorFunction<T, T | ObservedValueOf<O>> {
  return (source: Observable<T>) =>
    lift(source, function (this: Subscriber<T>, source: Observable<T>) {
      const subscriber = this;
      const subscription = new Subscription();
      let innerSub: Subscription | null = null;
      let syncUnsub = false;
      let handledResult: Observable<ObservedValueOf<O>>;

      const handleError = (err: any) => {
        try {
          handledResult = from(selector(err, catchError(selector)(source)));
        } catch (err) {
          subscriber.error(err);
          return;
        }
      };

      innerSub = source.subscribe(
        new CatchErrorSubscriber(subscriber, (err) => {
          handleError(err);
          if (handledResult) {
            if (innerSub) {
              innerSub.unsubscribe();
              innerSub = null;
              subscription.add(handledResult.subscribe(subscriber));
            } else {
              syncUnsub = true;
            }
          }
        })
      );

      if (syncUnsub) {
        innerSub.unsubscribe();
        innerSub = null;
        subscription.add(handledResult!.subscribe(subscriber));
      } else {
        subscription.add(innerSub);
      }

      return subscription;
    });
}

/**
 * This must exist to ensure that the `closed` state of the inner subscriber is set at
 * the proper time to ensure operators like `take` can stop the inner subscription if
 * it is a synchronous firehose.
 */
class CatchErrorSubscriber<T, C> extends Subscriber<T> {
  constructor(destination: Subscriber<T | C>, private onError: (err: any) => void) {
    super(destination);
  }

  _error(err: any) {
    this.onError(err);
    this.unsubscribe();
  }
}
