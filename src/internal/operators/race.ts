import { Observable } from '../Observable';
import { MonoTypeOperatorFunction, OperatorFunction } from '../types';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { raceWith } from './raceWith';

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
export function race<T>(...args: any[]): OperatorFunction<T, unknown> {
  return raceWith(...argsOrArgArray(args));
}
