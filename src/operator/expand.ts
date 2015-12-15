import {Observable} from '../Observable';
import {Scheduler} from '../Scheduler';
import {ExpandOperator} from './expand-support';

/**
 * Returns an Observable where for each item in the source Observable, the supplied function is applied to each item,
 * resulting in a new value to then be applied again with the function.
 * @param {function} project the function for projecting the next emitted item of the Observable.
 * @param {number} [concurrent] the max number of observables that can be created concurrently. defaults to infinity.
 * @param {Scheduler} [scheduler] The Scheduler to use for managing the expansions.
 * @returns {Observable} an Observable containing the expansions of the source Observable.
 */
export function expand<T, R>(project: (value: T, index: number) => Observable<R>,
                             concurrent: number = Number.POSITIVE_INFINITY,
                             scheduler: Scheduler = undefined): Observable<R> {
  concurrent = (concurrent || 0) < 1 ? Number.POSITIVE_INFINITY : concurrent;

  return this.lift(new ExpandOperator(project, concurrent, scheduler));
}
