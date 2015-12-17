import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/fromArray';
import {RaceOperator} from './race-support';
import {isArray} from '../util/isArray';

/**
 * Returns an Observable that mirrors the first source Observable to emit an item.
 * @param {...Observables} ...observables sources used to race for which Observable emits first.
 * @returns {Observable} an Observable that mirrors the output of the first Observable to emit an item.
 */
export function race<T>(...observables: Array<Observable<any> | Array<Observable<any>>>): Observable<T> {
  // if the only argument is an array, it was most likely called with
  // `pair([obs1, obs2, ...])`
  if (observables.length === 1) {
    if (isArray(observables[0])) {
      observables = <Array<Observable<any>>>observables[0];
    } else {
      return <Observable<T>>observables[0];
    }
  }

  return new ArrayObservable(observables).lift(new RaceOperator());
}
