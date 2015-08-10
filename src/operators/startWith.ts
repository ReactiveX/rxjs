import Observable from '../Observable';
import ScalarObservable from '../observables/ScalarObservable';
import concat from './concat';

export default function startWith<T>(x: T): Observable<T> {
  const init = new ScalarObservable(x);
  return concat.call(init, null, <Observable<T>>this);
}