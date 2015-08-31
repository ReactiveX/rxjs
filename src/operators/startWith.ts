import Observable from '../Observable';
import ScalarObservable from '../observables/ScalarObservable';
import { concat } from './concat';

export default function startWith<T>(x: T): Observable<T> {
  return concat(new ScalarObservable(x), this);
}