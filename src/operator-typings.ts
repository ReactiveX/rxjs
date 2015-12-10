/* tslint:disable:class-name */ /* tslint:disable:no-unused-variable */ /* tslint:disable:max-line-length */
import {Observable} from './Observable';
import {ConnectableObservable} from './observable/ConnectableObservable';
import {Scheduler} from './Scheduler';
import {Notification} from './Notification';
import {Subject} from './Subject';
import {Observer} from './Observer';
import {GroupedObservable} from './operator/groupBy-support';
import {GroupByObservable} from './operator/groupBy';
import {TimeInterval} from './operator/extended/timeInterval';
import {ObservableInput, ObservableOrPromise, ArrayOrIterator, _Selector, _IndexSelector, _SwitchMapResultSelector, _ObservableMergeMapProjector, _IteratorMergeMapProjector, _Predicate, _PredicateObservable, _Comparer, _Accumulator, _MergeAccumulator} from './types';

/* ||| MARKER ||| */
export interface operator_proto_combineLatest<T> {
  <TResult>(project: (v1: T) => TResult): Observable<TResult>;
  <TResult>(project: (v1: T) => TResult): Observable<TResult>;
  <T2>(v2: ObservableInput<T2>): Observable<[T, T2]>;
  <T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<[T, T2, T3]>;
  <T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<[T, T2, T3, T4]>;
  <T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<[T, T2, T3, T4, T5]>;
  <T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
  <T2>(array: [ObservableInput<T2>]): Observable<[T, T2]>;
  <T2, T3>(array: [ObservableInput<T2>, ObservableInput<T3>]): Observable<[T, T2, T3]>;
  <T2, T3, T4>(array: [ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>]): Observable<[T, T2, T3, T4]>;
  <T2, T3, T4, T5>(array: [ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>, ObservableInput<T5>]): Observable<[T, T2, T3, T4, T5]>;
  <T2, T3, T4, T5, T6>(array: [ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>, ObservableInput<T5>, ObservableInput<T6>]): Observable<[T, T2, T3, T4, T5, T6]>;
  <T2, TResult>(v2: ObservableInput<T2>, project: (v1: T, v2: T2) => TResult): Observable<TResult>;
  <T2, T3, TResult>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
  <T2, T3, T4, TResult>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, TResult>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, T6, TResult>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;
  <T2, TResult>(array: [ObservableInput<T2>], project: (v1: T, v2: T2) => TResult): Observable<TResult>;
  <T2, T3, TResult>(array: [ObservableInput<T2>, ObservableInput<T3>], project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
  <T2, T3, T4, TResult>(array: [ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>], project: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, TResult>(array: [ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>, ObservableInput<T5>], project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, T6, TResult>(array: [ObservableInput<T2>, ObservableInput<T3>, ObservableInput<T4>, ObservableInput<T5>, ObservableInput<T6>], project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;
  <TResult>(array: ObservableInput<any>[], project?: Function): Observable<TResult[]>;
  (...observables: Array<ObservableInput<T>>): Observable<T[]>;
  <R>(...observables: Array<ObservableInput<T> | ((...values: Array<T>) => R)>): Observable<R>;
}
/* ||| MARKER ||| */
