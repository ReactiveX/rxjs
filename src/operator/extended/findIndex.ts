import {Observable} from '../../Observable';
import {FindValueOperator} from './find-support';
import {_PredicateObservable} from '../../types';

export function findIndex<T>(predicate: _PredicateObservable<T>, thisArg?: any): Observable<number> {
  return this.lift(new FindValueOperator(predicate, this, true, thisArg));
}
