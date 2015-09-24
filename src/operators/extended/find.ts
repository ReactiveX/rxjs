import Observable from '../../Observable';
import { FindValueOperator } from './find-support';

export default function find<T>(predicate: (value: T, index: number, source:Observable<T>) => boolean, thisArg?: any): Observable<T> {
  return this.lift(new FindValueOperator(predicate, this, false, thisArg));
}