import {FindValueOperator} from './find-support';
import {Observable} from '../../Observable';
import {_PredicateObservable} from '../../types';

export function find<T>(predicate: _PredicateObservable<T>, thisArg?: any): Observable<T> {
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate is not a function');
  }
  return this.lift(new FindValueOperator(predicate, this, false, thisArg));
}
