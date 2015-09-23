import Observable from '../Observable';
import ArrayObservable from '../observables/ArrayObservable';
import { CombineLatestOperator } from './combineLatest-support';

export default function combineLatest<R>(...observables: (Observable<any>|((...values: any[]) => R))[]): Observable<R> {
  observables.unshift(this);
  let project;
  if (typeof observables[observables.length - 1] === "function") {
    project = observables.pop();
  }
  return new ArrayObservable(observables).lift(new CombineLatestOperator(project));
}