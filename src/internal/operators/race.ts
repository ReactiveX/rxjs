import { Observable } from '../Observable';
import { isArray } from '../util/isArray';
import { MonoTypeOperatorFunction, OperatorFunction } from '../types';
import { race as raceStatic } from '../observable/race';

/* tslint:disable:max-line-length */
/** @deprecated Deprecated in favor of static race. */
export function race<T>(observables: Array<Observable<T>>): MonoTypeOperatorFunction<T>;
/** @deprecated Deprecated in favor of static race. */
export function race<T, R>(observables: Array<Observable<T>>): OperatorFunction<T, R>;
/** @deprecated Deprecated in favor of static race. */
export function race<T>(...observables: Array<Observable<T> | Array<Observable<T>>>): MonoTypeOperatorFunction<T>;
/** @deprecated Deprecated in favor of static race. */
export function race<T, R>(...observables: Array<Observable<any> | Array<Observable<any>>>): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * @deprecated Deprecated in favor of static race.
 */
export function race<T>(...observables: Array<Observable<T> | Array<Observable<T>>>): MonoTypeOperatorFunction<T> {
  return function raceOperatorFunction(source: Observable<T>) {
    // if the only argument is an array, it was most likely called with
    // `pair([obs1, obs2, ...])`
    if (observables.length === 1 && isArray(observables[0])) {
      observables = <Array<Observable<T>>>observables[0];
    }

    return source.lift.call(raceStatic<T>(source, ...observables));
  };
}
