import {Observable} from '../Observable';
import {race as raceStatic} from './race-static';
import {isArray} from '../util/isArray';

/**
 * Returns an Observable that mirrors the first source Observable to emit an item
 * from the combination of this Observable and supplied Observables
 * @param {...Observables} ...observables sources used to race for which Observable emits first.
 * @returns {Observable} an Observable that mirrors the output of the first Observable to emit an item.
 */
export function race<R>(...observables: Array<Observable<any> | Array<Observable<any>>>): Observable<R> {
  // if the only argument is an array, it was most likely called with
  // `pair([obs1, obs2, ...])`
  if (observables.length === 1 && isArray(observables[0])) {
    observables = <Array<Observable<any>>>observables[0];
  }

  observables.unshift(this);
  return raceStatic.apply(this, observables);
}
