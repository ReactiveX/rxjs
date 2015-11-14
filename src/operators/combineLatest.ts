import {Observable, ObservableOrPromiseOrIterator} from '../Observable';
import {ArrayObservable} from '../observables/ArrayObservable';
import {CombineLatestOperator} from './combineLatest-support';

/**
 * Combines the values from this observable with values from observables passed as arguments. This is done by subscribing
 * to each observable, in order, and collecting an array of each of the most recent values any time any of the observables
 * emits, then either taking that array and passing it as arguments to an option `project` function and emitting the return
 * value of that, or just emitting the array of recent values directly if there is no `project` function.
 * @param {...Observable} observables the observables to combine the source with
 * @param {function} [project] an optional function to project the values from the combined recent values into a new value for emission.
 * @returns {Observable} an observable of other projected values from the most recent values from each observable, or an array of each of
 * the most recent values from each observable.
 */
export function combineLatest<T, T2>(
    second: ObservableOrPromiseOrIterator<T2>): Observable<[T, T2]>;
export function combineLatest<T, T2, TResult>(
    second: ObservableOrPromiseOrIterator<T2>,
    project: (v1: T, v2: T2) => TResult): Observable<TResult>;
export function combineLatest<T, T2, T3>(
    second: ObservableOrPromiseOrIterator<T2>,
    third: ObservableOrPromiseOrIterator<T3>): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3, TResult>(
    second: ObservableOrPromiseOrIterator<T2>,
    third: ObservableOrPromiseOrIterator<T3>,
    project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function combineLatest<T, T2, T3, T4>(
    second: ObservableOrPromiseOrIterator<T2>,
    third: ObservableOrPromiseOrIterator<T3>,
    fourth: ObservableOrPromiseOrIterator<T4>): Observable<[T, T2, T3, T4]>;
export function combineLatest<T, T2, T3, T4, TResult>(
    second: ObservableOrPromiseOrIterator<T2>,
    third: ObservableOrPromiseOrIterator<T3>,
    fourth: ObservableOrPromiseOrIterator<T4>,
    project: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
export function combineLatest<T, A, R>(
    ...observables: Array<ObservableOrPromiseOrIterator<A> | ((...values: Array<T | A>) => R)>): Observable<R>;
export function combineLatest<T>(): Observable<[T]>;
export function combineLatest<T, TResult>(
    project: (v1: T) => TResult): Observable<TResult>;
export function combineLatest<T, A>(
    ...observables: Array<A>): Observable<(T | A)[]>;
export function combineLatest(
    ...observables: Array<ObservableOrPromiseOrIterator<any> | ((...values: Array<any>) => any)>): Observable<any> {
    observables.unshift(this);
    let project;
    if (typeof observables[observables.length - 1] === 'function') {
        project = observables.pop();
    }
    return new ArrayObservable(observables).lift(new CombineLatestOperator(project));
}
