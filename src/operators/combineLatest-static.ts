import Observable from '../Observable';
import ArrayObservable from '../observables/ArrayObservable';
import { CombineLatestOperator } from './combineLatest-support';

export default function combineLatest<T, R>(...observables: (Observable<any> | ((...values: Array<any>) => R))[]): Observable<R> {
  const project = <((...ys: Array<any>) => R)> observables[observables.length - 1];
  if (typeof project === "function") {
    observables.pop();
  }
  return new ArrayObservable(observables).lift(new CombineLatestOperator(project));
}