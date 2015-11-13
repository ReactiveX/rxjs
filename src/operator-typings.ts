/* tslint:disable:class-name */ /* tslint:disable:no-unused-variable */ /* tslint:disable:max-line-length */
import { Observable, ObservableOrIterable, ObservableOrPromise, ArrayOrIterable, ObservableOrPromiseOrIterable } from './Observable';
import {Scheduler} from './Scheduler';
import {Notification} from './Notification';
import {Subject} from './Subject';
import {Observer} from './Observer';
import {GroupedObservable} from './operators/groupBy-support';
import {GroupByObservable} from './operators/groupBy';
import {_Selector, _IndexSelector, _SwitchMapResultSelector, _MergeMapProjector, _Predicate, _PredicateObservable, _Comparer, _Accumulator, _MergeAccumulator} from './types';

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
  <T2>( second: ObservableOrPromiseOrIterable<T2>): Observable<[T, T2]>;
  <T2, TResult>( second: ObservableOrPromiseOrIterable<T2>, project: (v1: T, v2: T2) => TResult): Observable<TResult>;
  <T2, T3>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>): Observable<[T, T2, T3]>;
  <T2, T3, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
  <T2, T3, T4>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>): Observable<[T, T2, T3, T4]>;
  <T2, T3, T4, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
  <T2, T3, T4, T5>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>): Observable<[T, T2, T3, T4, T5]>;
  <T2, T3, T4, T5, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, T6>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
  <T2, T3, T4, T5, T6, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, T6, T7>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, eventh: ObservableOrPromiseOrIterable<T7>): Observable<[T, T2, T3, T4, T5, T6, T7]>;
  <T2, T3, T4, T5, T6, T7, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, eventh: ObservableOrPromiseOrIterable<T7>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, T6, T7, T8>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, eighth: ObservableOrPromiseOrIterable<T8>): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;
  <T2, T3, T4, T5, T6, T7, T8, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, eighth: ObservableOrPromiseOrIterable<T8>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, T6, T7, T8, T9>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, eighth: ObservableOrPromiseOrIterable<T8>, ninth: ObservableOrPromiseOrIterable<T9>): Observable<[T, T2, T3, T4, T5, T6, T7, T8, T9]>;
  <T2, T3, T4, T5, T6, T7, T8, T9, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, eighth: ObservableOrPromiseOrIterable<T8>, ninth: ObservableOrPromiseOrIterable<T9>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult): Observable<TResult>;
  <A, R>( ...observables: Array<ObservableOrPromiseOrIterable<A> | ((...values: Array<T | A>) => R)>): Observable<R>;
  (): Observable<[T]>;
  <TResult>( project: (v1: T) => TResult): Observable<TResult>;
  <A>( ...observables: Array<A>): Observable<(T | A)[]>;
}
export interface operator_proto_concat<T> {
  <T2>( second: Observable<T2>, scheduler?: Scheduler): Observable<T | T2>;
  <T2, T3>( second: Observable<T2>, third: Observable<T3>, scheduler?: Scheduler): Observable<T | T2 | T3>;
  <T2, T3, T4>( second: Observable<T2>, third: Observable<T3>, forth: Observable<T4>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
  <T2, T3, T4, T5>( second: Observable<T2>, third: Observable<T3>, forth: Observable<T4>, fifth: Observable<T5>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5>;
  <T2, T3, T4, T5, T6>( second: Observable<T2>, third: Observable<T3>, forth: Observable<T4>, fifth: Observable<T5>, sixth: Observable<T6>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
  <T2, T3, T4, T5, T6, T7>( second: Observable<T2>, third: Observable<T3>, forth: Observable<T4>, fifth: Observable<T5>, sixth: Observable<T6>, seventh: Observable<T7>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6 | T7>;
  <T2, T3, T4, T5, T6, T7, T8>( second: Observable<T2>, third: Observable<T3>, forth: Observable<T4>, fifth: Observable<T5>, sixth: Observable<T6>, seventh: Observable<T7>, eigth: Observable<T8>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
  <T2, T3, T4, T5, T6, T7, T8, T9>( second: Observable<T2>, third: Observable<T3>, forth: Observable<T4>, fifth: Observable<T5>, sixth: Observable<T6>, seventh: Observable<T7>, eigth: Observable<T8>, ninth: Observable<T9>, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
  (...observables: (Observable<T> | Scheduler)[]): Observable<T>;
}
export interface operator_proto_concatAll<T> {
  (): Observable<T>;
}
export interface operator_proto_concatMap<T> {
  <R>(project: _IndexSelector<T, Observable<R>>): Observable<R>;
  <R, R2>(project: _IndexSelector<T, Observable<R>>, projectResult: _SwitchMapResultSelector<T, R, R2>): Observable<R2>;
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
  <R>(project: _MergeMapProjector<T, R>, concurrent: number): Observable<R>;
}
export interface operator_proto_filter<T> {
  (select: _Predicate<T>, thisArg?: any): Observable<T>;
}
export interface operator_proto_finally<T> {
  (finallySelector: () => void, thisArg?: any): Observable<T>;
}
export interface operator_proto_first<T> {
  <R>(predicate?: _PredicateObservable<T>, resultSelector?: _IndexSelector<T, R>, defaultValue?: any): Observable<T | R>;
}
export interface operator_proto_mergeMap<T> {
  <R>(project: _MergeMapProjector<T, R>): Observable<R>;
  <R, R2>(project: _MergeMapProjector<T, R>, resultSelector: _SwitchMapResultSelector<T, R, R2>, concurrent?: number): Observable<R>;
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
  <R>(predicate?: _PredicateObservable<T>, resultSelector?: _IndexSelector<T, R>, defaultValue?: R): Observable<T | R>;
}
export interface operator_proto_every<T> {
  (predicate: _PredicateObservable<T>, thisArg?: any): Observable<boolean>;
}
export interface operator_proto_map<T> {
  <R>(project: _IndexSelector<T, R>, thisArg?: any): Observable<R>;
}
export interface operator_proto_mapTo<T> {
  <R>(value: R): Observable<R>;
}
export interface operator_proto_materialize<T> {
  (): Observable<Notification<T>>;
}
export interface operator_proto_merge<T> {
  <T2>( second: ObservableOrPromiseOrIterable<T2>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2>;
  <T2, T3>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3>;
  <T2, T3, T4>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, forth: ObservableOrPromiseOrIterable<T4>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3 | T4>;
  <T2, T3, T4, T5>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, forth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5>;
  <T2, T3, T4, T5, T6>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, forth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6>;
  <T2, T3, T4, T5, T6, T7>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, forth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6 | T7>;
  <T2, T3, T4, T5, T6, T7, T8>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, forth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, eigth: ObservableOrPromiseOrIterable<T8>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
  <T2, T3, T4, T5, T6, T7, T8, T9>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, forth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, eigth: ObservableOrPromiseOrIterable<T8>, ninth: ObservableOrPromiseOrIterable<T9>, concurrent?: number, scheduler?: Scheduler): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
  (...observables: (ObservableOrPromiseOrIterable<T> | Scheduler | number)[]): Observable<T>;
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
  <TResult>( project: _MergeMapProjector<T, Observable<TResult>>): Observable<TResult>;
  <TOther, TResult>( project: _MergeMapProjector<T, Observable<TOther>>, resultSelector: _SwitchMapResultSelector<T, TOther, TResult>): Observable<TResult>;
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
  <T2>( second: ObservableOrPromiseOrIterable<T2>): Observable<[T, T2]>;
  <T2, TResult>( second: ObservableOrPromiseOrIterable<T2>, project: (v1: T, v2: T2) => TResult): Observable<TResult>;
  <T2, T3>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>): Observable<[T, T2, T3]>;
  <T2, T3, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
  <T2, T3, T4>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>): Observable<[T, T2, T3, T4]>;
  <T2, T3, T4, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
  <T2, T3, T4, T5>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>): Observable<[T, T2, T3, T4, T5]>;
  <T2, T3, T4, T5, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, T6>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
  <T2, T3, T4, T5, T6, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, T6, T7>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, eventh: ObservableOrPromiseOrIterable<T7>): Observable<[T, T2, T3, T4, T5, T6, T7]>;
  <T2, T3, T4, T5, T6, T7, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, eventh: ObservableOrPromiseOrIterable<T7>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, T6, T7, T8>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, eighth: ObservableOrPromiseOrIterable<T8>): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;
  <T2, T3, T4, T5, T6, T7, T8, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, eighth: ObservableOrPromiseOrIterable<T8>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, T6, T7, T8, T9>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, eighth: ObservableOrPromiseOrIterable<T8>, ninth: ObservableOrPromiseOrIterable<T9>): Observable<[T, T2, T3, T4, T5, T6, T7, T8, T9]>;
  <T2, T3, T4, T5, T6, T7, T8, T9, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, eighth: ObservableOrPromiseOrIterable<T8>, ninth: ObservableOrPromiseOrIterable<T9>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult): Observable<TResult>;
  <A, R>( ...observables: Array<ObservableOrPromiseOrIterable<A> | ((...values: Array<T | A>) => R)>): Observable<R>;
  (): Observable<[T]>;
  <TResult>( project: (v1: T) => TResult): Observable<TResult>;
  <A>( ...observables: Array<A>): ObservableOrPromiseOrIterable<(T | A)[]>;
}
export interface operator_proto_zip<T> {
  Proto<T, T2>( second: ObservableOrPromiseOrIterable<T2>): Observable<[T, T2]>;
  Proto<T, T2, TResult>( second: ObservableOrPromiseOrIterable<T2>, project: (v1: T, v2: T2) => TResult): Observable<TResult>;
  Proto<T, T2, T3>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>): Observable<[T, T2, T3]>;
  Proto<T, T2, T3, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
  Proto<T, T2, T3, T4>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>): Observable<[T, T2, T3, T4]>;
  Proto<T, T2, T3, T4, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
  Proto<T, T2, T3, T4, T5>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>): Observable<[T, T2, T3, T4, T5]>;
  Proto<T, T2, T3, T4, T5, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
  Proto<T, T2, T3, T4, T5, T6>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
  Proto<T, T2, T3, T4, T5, T6, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;
  Proto<T, T2, T3, T4, T5, T6, T7>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, eventh: ObservableOrPromiseOrIterable<T7>): Observable<[T, T2, T3, T4, T5, T6, T7]>;
  Proto<T, T2, T3, T4, T5, T6, T7, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, eventh: ObservableOrPromiseOrIterable<T7>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult): Observable<TResult>;
  Proto<T, T2, T3, T4, T5, T6, T7, T8>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, eighth: ObservableOrPromiseOrIterable<T8>): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;
  Proto<T, T2, T3, T4, T5, T6, T7, T8, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, eighth: ObservableOrPromiseOrIterable<T8>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult): Observable<TResult>;
  Proto<T, T2, T3, T4, T5, T6, T7, T8, T9>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, eighth: ObservableOrPromiseOrIterable<T8>, ninth: ObservableOrPromiseOrIterable<T9>): Observable<[T, T2, T3, T4, T5, T6, T7, T8, T9]>;
  Proto<T, T2, T3, T4, T5, T6, T7, T8, T9, TResult>( second: ObservableOrPromiseOrIterable<T2>, third: ObservableOrPromiseOrIterable<T3>, fourth: ObservableOrPromiseOrIterable<T4>, fifth: ObservableOrPromiseOrIterable<T5>, sixth: ObservableOrPromiseOrIterable<T6>, seventh: ObservableOrPromiseOrIterable<T7>, eighth: ObservableOrPromiseOrIterable<T8>, ninth: ObservableOrPromiseOrIterable<T9>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult): Observable<TResult>;
  Proto<T, A, R>( ...observables: Array<ObservableOrPromiseOrIterable<A> | ((...values: Array<T | A>) => R)>): Observable<R>;
  Proto<T>(): Observable<[T]>;
}
export interface operator_proto_zipAll<T> {
  <R>(project?: (...values: Array<any>) => R): Observable<R>;
}
