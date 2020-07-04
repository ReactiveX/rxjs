/** @prettier */
import { Observable } from '../Observable';
import { Operator } from '../Operator';

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

// TODO: Figure out proper typing for what we're doing below at some point.
// For right now it's not that important, as it's internal implementation and not
// public typings on a public API.

/**
 * A utility used to lift observables in the case that we are trying to convert a static observable
 * creation function to an operator that appropriately uses lift. Ultimately this is a smell
 * related to `lift`, hence the name.
 *
 * We _must_ do this for version 7, because it is what allows subclassed observables to compose through
 * the operators that use this. That will be going away in v8.
 *
 * See https://github.com/ReactiveX/rxjs/issues/5571
 * and https://github.com/ReactiveX/rxjs/issues/5431
 *
 * @param source the original observable source for the operator
 * @param liftedSource the actual composed source we want to lift
 * @param operator the operator to lift it with (often undefined in this case)
 */
export function stankyLift(source: Observable<any>, liftedSource: Observable<any>, operator?: Operator<any, any>): Observable<any> {
  if (hasLift(source)) {
    return source.lift.call(liftedSource, operator);
  }
  throw new TypeError('Unable to lift unknown Observable type');
}

function hasLift(source: any): source is { lift: InstanceType<typeof Observable>['lift'] } {
  return source && typeof source.lift === 'function';
}
