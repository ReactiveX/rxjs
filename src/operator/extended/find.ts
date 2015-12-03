import {FindValueOperator} from './find-support';
import {Observable} from '../../Observable';

export function find<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<T> {
  return this.lift(new FindValueOperator(predicate, this, false, thisArg));
}
