import Observable from '../Observable';
import ArrayObservable from '../observables/ArrayObservable';
import { CombineLatestOperator } from './combineLatest-support';
import Scheduler from '../Scheduler';

/**
 * Combines the values from observables passed as arguments. This is done by subscribing
 * to each observable, in order, and collecting an array of each of the most recent values any time any of the observables
 * emits, then either taking that array and passing it as arguments to an option `project` function and emitting the return
 * value of that, or just emitting the array of recent values directly if there is no `project` function.
 * @param {...Observable} observables the observables to combine
 * @param {function} [project] an optional function to project the values from the combined recent values into a new value for emission.
 * @returns {Observable} an observable of other projected values from the most recent values from each observable, or an array of each of
 * the most recent values from each observable.
 */
export default function combineLatest<R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R) | Scheduler>): Observable<R> {
  let project, scheduler;

  if (typeof (<any>observables[observables.length - 1]).schedule === 'function') {
    scheduler = observables.pop();
  }

  if (typeof observables[observables.length - 1] === 'function') {
    project = observables.pop();
  }

  return new ArrayObservable(observables, scheduler).lift(new CombineLatestOperator(project));
}
