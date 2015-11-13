import {Observable, ObservableOrPromiseOrIterable} from '../Observable';
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
    second: ObservableOrPromiseOrIterable<T2>): Observable<[T, T2]>;
export function combineLatest<T, T2, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    project: (v1: T, v2: T2) => TResult): Observable<TResult>;
export function combineLatest<T, T2, T3>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>): Observable<[T, T2, T3]>;
export function combineLatest<T, T2, T3, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
export function combineLatest<T, T2, T3, T4>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>): Observable<[T, T2, T3, T4]>;
export function combineLatest<T, T2, T3, T4, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    project: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>): Observable<[T, T2, T3, T4, T5]>;
export function combineLatest<T, T2, T3, T4, T5, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5, T6>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
export function combineLatest<T, T2, T3, T4, T5, T6, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>,
    project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>,
    eventh: ObservableOrPromiseOrIterable<T7>): Observable<[T, T2, T3, T4, T5, T6, T7]>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>,
    eventh: ObservableOrPromiseOrIterable<T7>,
    project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, T8>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>,
    seventh: ObservableOrPromiseOrIterable<T7>,
    eighth: ObservableOrPromiseOrIterable<T8>): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, T8, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>,
    seventh: ObservableOrPromiseOrIterable<T7>,
    eighth: ObservableOrPromiseOrIterable<T8>,
    project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult): Observable<TResult>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, T8, T9>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>,
    seventh: ObservableOrPromiseOrIterable<T7>,
    eighth: ObservableOrPromiseOrIterable<T8>,
    ninth: ObservableOrPromiseOrIterable<T9>): Observable<[T, T2, T3, T4, T5, T6, T7, T8, T9]>;
export function combineLatest<T, T2, T3, T4, T5, T6, T7, T8, T9, TResult>(
    second: ObservableOrPromiseOrIterable<T2>,
    third: ObservableOrPromiseOrIterable<T3>,
    fourth: ObservableOrPromiseOrIterable<T4>,
    fifth: ObservableOrPromiseOrIterable<T5>,
    sixth: ObservableOrPromiseOrIterable<T6>,
    seventh: ObservableOrPromiseOrIterable<T7>,
    eighth: ObservableOrPromiseOrIterable<T8>,
    ninth: ObservableOrPromiseOrIterable<T9>,
    project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult): Observable<TResult>;
export function combineLatest<T, A, R>(
    ...observables: Array<ObservableOrPromiseOrIterable<A> | ((...values: Array<T | A>) => R)>): Observable<R>;
export function combineLatest<T>(): Observable<[T]>;
export function combineLatest<T, TResult>(
    project: (v1: T) => TResult): Observable<TResult>;
export function combineLatest<T, A>(
    ...observables: Array<A>): Observable<(T | A)[]>;
export function combineLatest(
    ...observables: Array<ObservableOrPromiseOrIterable<any> | ((...values: Array<any>) => any)>): Observable<any> {
    observables.unshift(this);
    let project;
    if (typeof observables[observables.length - 1] === 'function') {
        project = observables.pop();
    }
    return new ArrayObservable(observables).lift(new CombineLatestOperator(project));
}
