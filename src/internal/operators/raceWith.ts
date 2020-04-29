import { Observable } from '../Observable';
import { isArray } from '../util/isArray';
import { MonoTypeOperatorFunction, OperatorFunction, ObservableInput, ObservedValueUnionFromArray } from '../types';
import { race as raceStatic } from '../observable/race';

/* tslint:disable:max-line-length */
/** @deprecated Deprecated use {@link raceWith} */
export function race<T>(observables: Array<Observable<T>>): MonoTypeOperatorFunction<T>;
/** @deprecated Deprecated use {@link raceWith} */
export function race<T, R>(observables: Array<Observable<T>>): OperatorFunction<T, R>;
/** @deprecated Deprecated use {@link raceWith} */
export function race<T>(...observables: Array<Observable<T> | Array<Observable<T>>>): MonoTypeOperatorFunction<T>;
/** @deprecated Deprecated use {@link raceWith} */
export function race<T, R>(...observables: Array<Observable<any> | Array<Observable<any>>>): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * Returns an Observable that mirrors the first source Observable to emit a next,
 * error or complete notification from the combination of this Observable and supplied Observables.
 * @param {...Observables} ...observables Sources used to race for which Observable emits first.
 * @return {Observable} An Observable that mirrors the output of the first Observable to emit an item.
 * @deprecated Deprecated use {@link raceWith}
 */
export function race<T>(...observables: (Observable<T> | Observable<T>[])[]): MonoTypeOperatorFunction<T> {
  return function raceOperatorFunction(source: Observable<T>) {
    // if the only argument is an array, it was most likely called with
    // `pair([obs1, obs2, ...])`
    if (observables.length === 1 && isArray(observables[0])) {
      observables = observables[0] as Observable<T>[];
    }

    return source.lift.call(
      raceStatic(source, ...(observables as Observable<T>[])),
      undefined
    ) as Observable<T>;
  };
}

/**
 * Creates an Observable that mirrors the first source Observable to emit a next,
 * error or complete notification from the combination of the Observable to which
 * the operator is applied and supplied Observables.
 *
 * ## Example
 *
 * ```ts
 * import { interval } from 'rxjs';
 * import { mapTo, raceWith } from 'rxjs/operators';
 *
 * const obs1 = interval(1000).pipe(mapTo('fast one'));
 * const obs2 = interval(3000).pipe(mapTo('medium one'));
 * const obs3 = interval(5000).pipe(mapTo('slow one'));
 *
 * obs2.pipe(
 *   raceWith(obs3, obs1)
 * ).subscribe(
 *   winner => console.log(winner)
 * );
 *
 * // Outputs
 * // a series of 'fast one'
 * ```
 *
 * @param otherSources Sources used to race for which Observable emits first.
 */

export function raceWith<T, A extends ObservableInput<any>[]>(
  ...otherSources: A
): OperatorFunction<T, T | ObservedValueUnionFromArray<A>> {
  return function raceWithOperatorFunction(source: Observable<T>) {
    return source.lift.call(
      raceStatic(source, ...otherSources),
      undefined
    ) as Observable<T | ObservedValueUnionFromArray<A>>;
  };
}
