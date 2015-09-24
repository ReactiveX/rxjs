import Observable from '../../Observable';
import { FindValueOperator } from './find-support';

export default function findIndex<T>(predicate: (value: T, index: number, source:Observable<T>) => boolean, thisArg?: any): Observable<number> {
  return this.lift(new FindValueOperator(predicate, this, true, thisArg));
}