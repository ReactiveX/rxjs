/** @prettier */
import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { TeardownLogic } from '../types';

/**
 * A utility to lift observables. Will also error if an observable is passed that does not
 * have the lift mechanism.
 *
 * We _must_ do this for version 7, because it is what allows subclassed observables to compose through
 * the operators that use this. That will be going away in v8.
 *
 * See https://github.com/ReactiveX/rxjs/issues/5571
 * and https://github.com/ReactiveX/rxjs/issues/5431
 *
 * @param source The source observable to lift
 * @param operator The operator to lift it with. Note that the operator possibly being undefined here
 * is related to issues around the "stanky" lifting of static creation functions as operators, see below.
 */
export function lift<T, R>(source: Observable<T>, operator?: Operator<T, R>): Observable<R> {
  if (hasLift(source)) {
    return source.lift(operator);
  }
  throw new TypeError('Unable to lift unknown Observable type');
}

/**
 * A lightweight wrapper to deal with sitations where there may be try/catching at the
 * time of the subscription (and not just via notifications).
 * @param source The source observable to lift
 * @param wrappedOperator The lightweight operator function to wrap.
 */
export function wrappedLift<T, R>(
  source: Observable<T>,
  wrappedOperator: (subscriber: Subscriber<R>, liftedSource: Observable<T>) => TeardownLogic
): Observable<R> {
  return lift(source, function (this: Subscriber<R>, liftedSource: Observable<T>) {
    try {
      wrappedOperator(this, liftedSource);
    } catch (err) {
      this.error(err);
    }
  });
}

export function hasLift(source: any): source is { lift: InstanceType<typeof Observable>['lift'] } {
  return source && typeof source.lift === 'function';
}
