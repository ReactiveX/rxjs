import {Observable} from '../../Observable';
import {FindValueOperator} from './find-support';

import {_PredicateObservable} from '../../types';

export function find<T>(predicate: _PredicateObservable<T>, thisArg?: any): Observable<T> {
  return this.lift(new FindValueOperator(predicate, this, false, thisArg));
}
