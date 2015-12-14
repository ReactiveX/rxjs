import {FindValueOperator} from './find-support';
import {Observable} from '../Observable';

export function find<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<T> {
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate is not a function');
  }
  return this.lift(new FindValueOperator(predicate, this, false, thisArg));
}
