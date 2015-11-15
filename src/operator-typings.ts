/* tslint:disable:class-name */ /* tslint:disable:no-unused-variable */ /* tslint:disable:max-line-length */
import {Observable, ObservableOrPromise, ArrayOrIterator} from './Observable';
import {Scheduler} from './Scheduler';
import {Notification} from './Notification';
import {Subject} from './Subject';
import {Observer} from './Observer';
import {GroupedObservable} from './operators/groupBy-support';
import {GroupByObservable} from './operators/groupBy';
import {TimeInterval} from './operators/extended/timeInterval';
import {_Selector, _IndexSelector, _SwitchMapResultSelector, _ObservableMergeMapProjector, _IteratorMergeMapProjector, _Predicate, _PredicateObservable, _Comparer, _Accumulator, _MergeAccumulator} from './types';

export interface operator_proto_buffer<T> {
  (closingNotifier: Observable<any>): Observable<T[]>;
}
export interface operator_proto_bufferCount<T> {
  (bufferSize: number, startBufferEvery?: number): Observable<T[]>;
}
export interface operator_proto_bufferTime<T> {
  (bufferTimeSpan: number, bufferCreationInterval?: number, scheduler?: Scheduler): Observable<T[]>;
}
export interface operator_proto_bufferToggle<T> {
  <O>(openings: Observable<O>, closingSelector: (openValue: O) => Observable<any>): Observable<T[]>;
}
export interface operator_proto_bufferWhen<T> {
  (closingSelector: () => Observable<any>): Observable<T[]>;
}
export interface operator_proto_catch<T> {
  (selector: (err: any, caught: Observable<any>) => Observable<any>): Observable<T>;
}
export interface operator_proto_combineAll<T> {
  (): Observable<T[]>;
}
export interface operator_proto_combineLatest<T> {
  <TResult>( project: (v1: T) => TResult ): Observable<TResult>;
  <TResult>( project: (v1: T) => TResult ): Observable<TResult>;
  <T2>( second: ObservableOrPromise<T2> ): Observable<[T, T2]>;
  <T2>( second: ObservableOrPromise<T2> | ArrayOrIterator<T2> ): Observable<[T, T2]>;
  <T2>( second: ArrayOrIterator<T2> ): Observable<[T, T2]>;
  <T2>( second: ArrayOrIterator<T2> ): Observable<[T, T2]>;
  <T2, TResult>( second: ObservableOrPromise<T2>, project: (v1: T, v2: T2) => TResult ): Observable<TResult>;
  <T2, TResult>( second: ArrayOrIterator<T2>, project: (v1: T, v2: T2) => TResult ): Observable<TResult>;
  <T2, TResult>( second: ObservableOrPromise<T2>, project: (v1: T, v2: T2) => TResult ): Observable<TResult>;
  <T2, TResult>( second: ArrayOrIterator<T2>, project: (v1: T, v2: T2) => TResult ): Observable<TResult>;
  <T2, T3>( second: ObservableOrPromise<T2>, third: ObservableOrPromise<T3> ): Observable<[T, T2, T3]>;
  <T2, T3>( second: ObservableOrPromise<T2>, third: ObservableOrPromise<T3> ): Observable<[T, T2, T3]>;
  <T2, T3>( second: ArrayOrIterator<T2>, third: ObservableOrPromise<T3> ): Observable<[T, T2, T3]>;
  <T2, T3>( second: ArrayOrIterator<T2>, third: ArrayOrIterator<T3> ): Observable<[T, T2, T3]>;
  <T2, T3>( second: ArrayOrIterator<T2>, third: ArrayOrIterator<T3> ): Observable<[T, T2, T3]>;
  <T2, T3>( second: ObservableOrPromise<T2>, third: ArrayOrIterator<T3> ): Observable<[T, T2, T3]>;
  <T2, T3>( second: ObservableOrPromise<T2>, third: ArrayOrIterator<T3> ): Observable<[T, T2, T3]>;
  <T2, T3>( second: ArrayOrIterator<T2>, third: ObservableOrPromise<T3> ): Observable<[T, T2, T3]>;
  <T2, T3, TResult>( second: ObservableOrPromise<T2>, third: ObservableOrPromise<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  <T2, T3, TResult>( second: ObservableOrPromise<T2>, third: ObservableOrPromise<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  <T2, T3, TResult>( second: ArrayOrIterator<T2>, third: ObservableOrPromise<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  <T2, T3, TResult>( second: ArrayOrIterator<T2>, third: ArrayOrIterator<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  <T2, T3, TResult>( second: ArrayOrIterator<T2>, third: ArrayOrIterator<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  <T2, T3, TResult>( second: ObservableOrPromise<T2>, third: ArrayOrIterator<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  <T2, T3, TResult>( second: ObservableOrPromise<T2>, third: ArrayOrIterator<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  <T2, T3, TResult>( second: ArrayOrIterator<T2>, third: ObservableOrPromise<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  ( ...observables: Array<ObservableOrPromise<T>>): Observable<T[]>;
  ( ...observables: Array<ArrayOrIterator<T>>): Observable<T[]>;
  <R>( ...observables: Array<ObservableOrPromise<T> | ((...values: Array<T>) => R)>): Observable<R>;
  <R>( ...observables: Array<ArrayOrIterator<T> | ((...values: Array<T>) => R)>): Observable<R>;
}
export interface operator_proto_concat<T> {
  <T2>( second: Observable<T2>, scheduler?: Scheduler): Observable<T | T2>;
  <T2, T3>( second: Observable<T2>, third: Observable<T3>, scheduler?: Scheduler): Observable<T | T2 | T3>;
  <T2, T3, T4>( second: Observable<T2>, third: Observable<T3>, forth: Observable<T4>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
  (...observables: (Observable<T> | Scheduler)[]): Observable<T>;
}
export interface operator_proto_concatAll<T> {
  (): Observable<T>;
}
export interface operator_proto_concatMap<T> {
  <R>(project: _ObservableMergeMapProjector<T, R>): Observable<R>;
  <R, R2>(project: _ObservableMergeMapProjector<T, R>, projectResult: _SwitchMapResultSelector<T, R, R2>): Observable<R2>;
  <R>(project: _IteratorMergeMapProjector<T, R>): Observable<R>;
  <R, R2>(project: _IteratorMergeMapProjector<T, R>, projectResult: _SwitchMapResultSelector<T, R, R2>): Observable<R2>;
}
export interface operator_proto_concatMapTo<T> {
  <R>(observable: Observable<R>): Observable<R>;
  <R, R2>(observable: Observable<R>, resultSelector: _SwitchMapResultSelector<T, R, R2>): Observable<R2>;
}
export interface operator_proto_count<T> {
  (predicate?: _PredicateObservable<T>, thisArg?: any): Observable<number>;
}
export interface operator_proto_dematerialize<T> {
  (): Observable<any>;
}
export interface operator_proto_debounce<T> {
  (durationSelector: (value: T) => ObservableOrPromise<number>): Observable<T>;
}
export interface operator_proto_debounceTime<T> {
  (dueTime: number, scheduler?: Scheduler): Observable<T>;
}
export interface operator_proto_defaultIfEmpty<T> {
  <R>(defaultValue?: R): Observable<T | R>;
}
export interface operator_proto_delay<T> {
  (delay: number | Date, scheduler?: Scheduler): Observable<T>;
}
export interface operator_proto_distinctUntilChanged<T> {
  (compare?: _Comparer<T, boolean>, thisArg?: any): Observable<T>;
}
export interface operator_proto_do<T> {
  (nextOrObserver?: Observer<T>|((x: T) => void), error?: (e: any) => void, complete?: () => void): Observable<T>;
}
export interface operator_proto_expand<T> {
  <R>(project: _ObservableMergeMapProjector<T, R>, concurrent?: number): Observable<R>;
  <R>(project: _IteratorMergeMapProjector<T, R>, concurrent?: number): Observable<R>;
}
export interface operator_proto_filter<T> {
  (select: _Predicate<T>, thisArg?: any): Observable<T>;
}
export interface operator_proto_finally<T> {
  (finallySelector: () => void, thisArg?: any): Observable<T>;
}
export interface operator_proto_first<T> {
  (predicate?: _PredicateObservable<T>): Observable<T>;
  <R>(predicate?: _PredicateObservable<T>, resultSelector?: _IndexSelector<T, R>, defaultValue?: any): Observable<T | R>;
}
export interface operator_proto_mergeMap<T> {
  <R>(project: _ObservableMergeMapProjector<T, R>): Observable<R>;
  <R, R2>(project: _ObservableMergeMapProjector<T, R>, resultSelector: _SwitchMapResultSelector<T, R, R2>, concurrent?: number): Observable<R2>;
  <R>(project: _IteratorMergeMapProjector<T, R>): Observable<R>;
  <R, R2>(project: _IteratorMergeMapProjector<T, R>, resultSelector: _SwitchMapResultSelector<T, R, R2>, concurrent?: number): Observable<R2>;
}
export interface operator_proto_mergeMapTo<T> {
  <R>(observable: Observable<R>): Observable<R>;
  <R, R2>(observable: Observable<R>, resultSelector?: _SwitchMapResultSelector<T, R, R2>, concurrent?: number): Observable<R2>;
}
export interface operator_proto_groupBy<T> {
  <R>(keySelector: _Selector<T, string>, elementSelector?: _Selector<T, R>, durationSelector?: (grouped: GroupedObservable<R>) => Observable<any>): GroupByObservable<T, R>;
}
export interface operator_proto_ignoreElements<T> {
  (): Observable<T>;
}
export interface operator_proto_last<T> {
  (predicate?: _PredicateObservable<T>): Observable<T>;
  <R>(predicate?: _PredicateObservable<T>, resultSelector?: _IndexSelector<T, R>, defaultValue?: any): Observable<T | R>;
}
export interface operator_proto_every<T> {
  (predicate: _PredicateObservable<T>, thisArg?: any): Observable<boolean>;
}
export interface operator_proto_map<T> {
  (project: _IndexSelector<T, T>, thisArg?: any): Observable<T>;
  <R>(project: _IndexSelector<T, R>, thisArg?: any): Observable<R>;
}
export interface operator_proto_mapTo<T> {
  (value: T): Observable<T>;
  <R>(value: R): Observable<R>;
}
export interface operator_proto_materialize<T> {
  (): Observable<Notification<T>>;
}
export interface operator_proto_merge<T> {
  (...observables: (ObservableOrPromise<T> | Scheduler | number)[]): T;
  (...observables: (ArrayOrIterator<T> | Scheduler | number)[]): T;
  <R>(...observables: (ObservableOrPromise<T> | Scheduler | number)[]): Observable<R>;
  <R>(...observables: (ArrayOrIterator<T> | Scheduler | number)[]): Observable<R>;
}
export interface operator_proto_mergeAll<T> {
  <R>(concurrent: number): Observable<R>;
}
export interface operator_proto_multicast<T> {
  (subjectOrSubjectFactory: Subject<T> | (() => Subject<T>)): Observable<T>;
}
export interface operator_proto_observeOn<T> {
  (scheduler: Scheduler, delay?: number): Observable<T>;
}
export interface operator_proto_partition<T> {
  (predicate: _Predicate<T>, thisArg?: any): Observable<[T, T]>;
}
export interface operator_proto_publish<T> {
  (): Observable<T>;
}
export interface operator_proto_publishBehavior<T> {
  (value: T): Observable<T>;
}
export interface operator_proto_publishReplay<T> {
  (bufferSize?: number, windowTime?: number, scheduler?: Scheduler): Observable<T>;
}
export interface operator_proto_reduce<T> {
  <R>(project: _Accumulator<T, R>, seed?: R): Observable<R>;
}
export interface operator_proto_repeat<T> {
  (count?: number): Observable<T>;
}
export interface operator_proto_retry<T> {
  (count?: number): Observable<T>;
}
export interface operator_proto_retryWhen<T> {
  (notifier: (errors: Observable<any>) => Observable<any>): Observable<T>;
}
export interface operator_proto_sample<T> {
  (notifier: Observable<any>): Observable<T>;
}
export interface operator_proto_sampleTime<T> {
  (delay: number, scheduler?: Scheduler): Observable<T>;
}
export interface operator_proto_scan<T> {
  <R>(project: _Accumulator<T, R>, acc?: R): Observable<R>;
}
export interface operator_proto_share<T> {
  (): Observable<T>;
}
export interface operator_proto_single<T> {
  (predicate?: _PredicateObservable<T>, thisArg?: any): Observable<T>;
}
export interface operator_proto_skip<T> {
  (total: number): Observable<T>;
}
export interface operator_proto_skipUntil<T> {
  (notifier: Observable<any>): Observable<T>;
}
export interface operator_proto_skipWhile<T> {
  (predicate: _Predicate<T>, thisArg?: any): Observable<T>;
}
export interface operator_proto_startWith<T> {
  (...array: (T | Scheduler)[]): Observable<T>;
}
export interface operator_proto_subscribeOn<T> {
  (scheduler: Scheduler, delay?: number): Observable<T>;
}
export interface operator_proto_switch<T> {
  (): Observable<T>;
}
export interface operator_proto_switchMap<T> {
  <TResult>( project: _ObservableMergeMapProjector<T, TResult>): Observable<TResult>;
  <TOther, TResult>( project: _ObservableMergeMapProjector<T, TOther>, resultSelector: _SwitchMapResultSelector<T, TOther, TResult>): Observable<TResult>;
  <TResult>( project: _IteratorMergeMapProjector<T, TResult>): Observable<TResult>;
  <TOther, TResult>( project: _IteratorMergeMapProjector<T, TOther>, resultSelector: _SwitchMapResultSelector<T, TOther, TResult>): Observable<TResult>;
}
export interface operator_proto_switchMapTo<T> {
  <R>(observable: Observable<R>): Observable<R>;
  <R, R2>(observable: Observable<R>, projectResult?: _SwitchMapResultSelector<T, R, R2>): Observable<R2>;
}
export interface operator_proto_take<T> {
  (total: number): Observable<T>;
}
export interface operator_proto_takeUntil<T> {
  (notifier: Observable<any>): Observable<T>;
}
export interface operator_proto_takeWhile<T> {
  (predicate: _Predicate<T>, thisArg?: any): Observable<T>;
}
export interface operator_proto_throttle<T> {
  (durationSelector: (value: T) => ObservableOrPromise<number>): Observable<T>;
}
export interface operator_proto_throttleTime<T> {
  (delay: number, scheduler: Scheduler): Observable<T>;
}
export interface operator_proto_timeout<T> {
  (due: number | Date, errorToSend?: any, scheduler?: Scheduler): Observable<T>;
}
export interface operator_proto_timeoutWith<T> {
  <R>(due: number | Date, withObservable: Observable<R>, scheduler?: Scheduler): Observable<T | R>;
}
export interface operator_proto_toArray<T> {
  (): Observable<T[]>;
}
export interface operator_proto_toPromise<T> {
  (PromiseCtor?: PromiseConstructor): Promise<T>;
}
export interface operator_proto_window<T> {
  (closingNotifier: Observable<any>): Observable<Observable<T>>;
}
export interface operator_proto_windowCount<T> {
  (windowSize: number, startWindowEvery?: number): Observable<Observable<T>>;
}
export interface operator_proto_windowTime<T> {
  (windowTimeSpan: number, windowCreationInterval?: number, scheduler?: Scheduler): Observable<Observable<T>>;
}
export interface operator_proto_windowToggle<T> {
  <O>(openings: Observable<O>, closingSelector: (openValue: O) => Observable<any>): Observable<Observable<T>>;
}
export interface operator_proto_windowWhen<T> {
  (closingSelector: () => Observable<any>): Observable<Observable<T>>;
}
export interface operator_proto_withLatestFrom<T> {
  <TResult>( project: (v1: T) => TResult ): Observable<TResult>;
  <TResult>( project: (v1: T) => TResult ): Observable<TResult>;
  <T2>( second: ObservableOrPromise<T2> ): Observable<[T, T2]>;
  <T2>( second: ObservableOrPromise<T2> | ArrayOrIterator<T2> ): Observable<[T, T2]>;
  <T2>( second: ArrayOrIterator<T2> ): Observable<[T, T2]>;
  <T2>( second: ArrayOrIterator<T2> ): Observable<[T, T2]>;
  <T2, TResult>( second: ObservableOrPromise<T2>, project: (v1: T, v2: T2) => TResult ): Observable<TResult>;
  <T2, TResult>( second: ArrayOrIterator<T2>, project: (v1: T, v2: T2) => TResult ): Observable<TResult>;
  <T2, TResult>( second: ObservableOrPromise<T2>, project: (v1: T, v2: T2) => TResult ): Observable<TResult>;
  <T2, TResult>( second: ArrayOrIterator<T2>, project: (v1: T, v2: T2) => TResult ): Observable<TResult>;
  <T2, T3>( second: ObservableOrPromise<T2>, third: ObservableOrPromise<T3> ): Observable<[T, T2, T3]>;
  <T2, T3>( second: ObservableOrPromise<T2>, third: ObservableOrPromise<T3> ): Observable<[T, T2, T3]>;
  <T2, T3>( second: ArrayOrIterator<T2>, third: ObservableOrPromise<T3> ): Observable<[T, T2, T3]>;
  <T2, T3>( second: ArrayOrIterator<T2>, third: ArrayOrIterator<T3> ): Observable<[T, T2, T3]>;
  <T2, T3>( second: ArrayOrIterator<T2>, third: ArrayOrIterator<T3> ): Observable<[T, T2, T3]>;
  <T2, T3>( second: ObservableOrPromise<T2>, third: ArrayOrIterator<T3> ): Observable<[T, T2, T3]>;
  <T2, T3>( second: ObservableOrPromise<T2>, third: ArrayOrIterator<T3> ): Observable<[T, T2, T3]>;
  <T2, T3>( second: ArrayOrIterator<T2>, third: ObservableOrPromise<T3> ): Observable<[T, T2, T3]>;
  <T2, T3, TResult>( second: ObservableOrPromise<T2>, third: ObservableOrPromise<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  <T2, T3, TResult>( second: ObservableOrPromise<T2>, third: ObservableOrPromise<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  <T2, T3, TResult>( second: ArrayOrIterator<T2>, third: ObservableOrPromise<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  <T2, T3, TResult>( second: ArrayOrIterator<T2>, third: ArrayOrIterator<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  <T2, T3, TResult>( second: ArrayOrIterator<T2>, third: ArrayOrIterator<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  <T2, T3, TResult>( second: ObservableOrPromise<T2>, third: ArrayOrIterator<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  <T2, T3, TResult>( second: ObservableOrPromise<T2>, third: ArrayOrIterator<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  <T2, T3, TResult>( second: ArrayOrIterator<T2>, third: ObservableOrPromise<T3>, project: (v1: T, v2: T2, v3: T3) => TResult ): Observable<TResult>;
  ( ...observables: Array<ObservableOrPromise<T>>): Observable<T[]>;
  ( ...observables: Array<ArrayOrIterator<T>>): Observable<T[]>;
  <R>( ...observables: Array<ObservableOrPromise<T> | ((...values: Array<T>) => R)>): Observable<R>;
  <R>( ...observables: Array<ArrayOrIterator<T> | ((...values: Array<T>) => R)>): Observable<R>;
}
export interface operator_proto_zip<T> {
  Proto<T, TResult>( project: (v1: T) => TResult): Observable<TResult>;
  Proto<T, TResult>( project: (v1: T) => TResult): Observable<TResult>;
  Proto<T, T2>( second: ObservableOrPromise<T2>): Observable<[T, T2]>;
  Proto<T, T2>( second: ObservableOrPromise<T2> | ArrayOrIterator<T2>): Observable<[T, T2]>;
  Proto<T, T2>( second: ArrayOrIterator<T2>): Observable<[T, T2]>;
  Proto<T, T2>( second: ArrayOrIterator<T2>): Observable<[T, T2]>;
  Proto<T, T2, TResult>( second: ObservableOrPromise<T2>, project: (v1: T, v2: T2) => TResult): Observable<TResult>;
  Proto<T, T2, TResult>( second: ArrayOrIterator<T2>, project: (v1: T, v2: T2) => TResult): Observable<TResult>;
  Proto<T, T2, TResult>( second: ObservableOrPromise<T2>, project: (v1: T, v2: T2) => TResult): Observable<TResult>;
  Proto<T, T2, TResult>( second: ArrayOrIterator<T2>, project: (v1: T, v2: T2) => TResult): Observable<TResult>;
  Proto<T, T2, T3>( second: ObservableOrPromise<T2>, third: ObservableOrPromise<T3>): Observable<[T, T2, T3]>;
  Proto<T, T2, T3>( second: ObservableOrPromise<T2>, third: ObservableOrPromise<T3>): Observable<[T, T2, T3]>;
  Proto<T, T2, T3>( second: ArrayOrIterator<T2>, third: ObservableOrPromise<T3>): Observable<[T, T2, T3]>;
  Proto<T, T2, T3>( second: ArrayOrIterator<T2>, third: ArrayOrIterator<T3>): Observable<[T, T2, T3]>;
  Proto<T, T2, T3>( second: ArrayOrIterator<T2>, third: ArrayOrIterator<T3>): Observable<[T, T2, T3]>;
  Proto<T, T2, T3>( second: ObservableOrPromise<T2>, third: ArrayOrIterator<T3>): Observable<[T, T2, T3]>;
  Proto<T, T2, T3>( second: ObservableOrPromise<T2>, third: ArrayOrIterator<T3>): Observable<[T, T2, T3]>;
  Proto<T, T2, T3>( second: ArrayOrIterator<T2>, third: ObservableOrPromise<T3>): Observable<[T, T2, T3]>;
  Proto<T, T2, T3, TResult>( second: ObservableOrPromise<T2>, third: ObservableOrPromise<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
  Proto<T, T2, T3, TResult>( second: ObservableOrPromise<T2>, third: ObservableOrPromise<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
  Proto<T, T2, T3, TResult>( second: ArrayOrIterator<T2>, third: ObservableOrPromise<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
  Proto<T, T2, T3, TResult>( second: ArrayOrIterator<T2>, third: ArrayOrIterator<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
  Proto<T, T2, T3, TResult>( second: ArrayOrIterator<T2>, third: ArrayOrIterator<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
  Proto<T, T2, T3, TResult>( second: ObservableOrPromise<T2>, third: ArrayOrIterator<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
  Proto<T, T2, T3, TResult>( second: ObservableOrPromise<T2>, third: ArrayOrIterator<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
  Proto<T, T2, T3, TResult>( second: ArrayOrIterator<T2>, third: ObservableOrPromise<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
  Proto<T>( ...observables: Array<ObservableOrPromise<T>>): Observable<T[]>;
  Proto<T>( ...observables: Array<ArrayOrIterator<T>>): Observable<T[]>;
  Proto<T, R>( ...observables: Array<ObservableOrPromise<T> | ((...values: Array<T>) => R)>): Observable<R>;
  Proto<T, R>( ...observables: Array<ArrayOrIterator<T> | ((...values: Array<T>) => R)>): Observable<R>;
  Proto<T>(): Observable<[T]>;
}
export interface operator_proto_zipAll<T> {
  <R>(project?: (...values: Array<any>) => R): Observable<R>;
}
export interface operator_proto_isEmpty<T> {
  (): Observable<T>;
}
export interface operator_proto_elementAt<T> {
  (index: number, defaultValue?: T): Observable<T>;
}
export interface operator_proto_distinctUntilKeyChanged<T> {
  (key: string, compare?: _Comparer<T, boolean>, thisArg?: any): Observable<T>;
}
export interface operator_proto_find<T> {
  (predicate: _PredicateObservable<T>, thisArg?: any): Observable<T>;
}
export interface operator_proto_findIndex<T> {
  (predicate: _PredicateObservable<T>, thisArg?: any): Observable<number>;
}
export interface operator_proto_max<T> {
  <R>(comparer?: _Comparer<T, R>): Observable<R>;
}
export interface operator_proto_min<T> {
  <R>(comparer?: _Comparer<T, R>): Observable<R>;
}
export interface operator_proto_timeInterval<T> {
  (scheduler?: Scheduler): Observable<TimeInterval>;
}
export interface operator_proto_mergeScan<T> {
  <R>(project: _MergeAccumulator<T, R>, seed: R): Observable<R>;
}
export interface operator_proto_switchFirst<T> {
  (): Observable<T>;
}
export interface operator_proto_switchMapFirst<T> {
  <R>(project: _ObservableMergeMapProjector<T, R>): Observable<R>;
  <R, R2>(project: _ObservableMergeMapProjector<T, R>, resultSelector?: _SwitchMapResultSelector<T, R, R2>): Observable<R2>;
  <R>(project: _IteratorMergeMapProjector<T, R>): Observable<R>;
  <R, R2>(project: _IteratorMergeMapProjector<T, R>, resultSelector?: _SwitchMapResultSelector<T, R, R2>): Observable<R2>;
}
