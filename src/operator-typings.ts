import { Observable, ObservableOrIterable, ObservableOrPromise, ArrayOrIterable } from './Observable';
import {Scheduler} from "./Scheduler";
import {Notification} from "./Notification";
import {Subject} from "./Subject";
import {Observer} from "./Observer";
import {GroupedObservable} from "./operators/groupBy-support";
import {GroupByObservable} from "./operators/groupby";

export interface operator_proto_buffer<T> {
  (closingNotifier: Observable<any>): Observable<T[]>;
}
export interface operator_proto_bufferCount<T> {
  (bufferSize: number, startBufferEvery: number): Observable<T[]>;
}
export interface operator_proto_bufferTime<T> {
  (bufferTimeSpan: number, bufferCreationInterval: number, scheduler: Scheduler): Observable<T[]>;
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
  () : ObservableOrIterable<T[]>;
}
export interface operator_proto_combineLatest<T> {
  (): Observable<[T]>;
  <TResult>(project: (v1: T) => TResult): Observable<TResult>;
  <T2>(second: ObservableOrIterable<T2>): Observable<[T, T2]>;
  <T2, TResult>(second: ObservableOrIterable<T2>, project: (v1: T, v2: T2) => TResult): Observable<TResult>;
  <T2, T3>(second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>): Observable<[T, T2, T3]>;
  <T2, T3, TResult>(second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
  <T2, T3, T4>(second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>): Observable<[T, T2, T3, T4]>;
  <T2, T3, T4, TResult>(second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
  <T2, T3, T4, T5>(second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>): Observable<[T, T2, T3, T4, T5]>;
  <T2, T3, T4, T5, TResult>(second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, T6>(second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
  <T2, T3, T4, T5, T6, TResult>(second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, T6, T7>(second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, eventh: ObservableOrIterable<T7>): Observable<[T, T2, T3, T4, T5, T6, T7]>;
  <T2, T3, T4, T5, T6, T7, TResult>(second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, eventh: ObservableOrIterable<T7>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, T6, T7, T8>(second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;
  <T2, T3, T4, T5, T6, T7, T8, TResult>(second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult): Observable<TResult>;
  <T2, T3, T4, T5, T6, T7, T8, T9>(second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>, ninth: ObservableOrIterable<T9>): Observable<[T, T2, T3, T4, T5, T6, T7, T8, T9]>;
  <T2, T3, T4, T5, T6, T7, T8, T9, TResult>(second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>, ninth: ObservableOrIterable<T9>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult): Observable<TResult>;
  <R>(...observables: Array<ObservableOrIterable<T> | ((...values: Array<T>) => R)>): Observable<R>;
  (...observables: Array<T>): Observable<T[]>;
}
export interface operator_proto_concat<T> {
  <R>(...observables: (Observable<any> | Scheduler)[]): Observable<R>;
}
export interface operator_proto_concatAll<T> {
  (): Observable<T>;
}
export interface operator_proto_concatMap<T> {
  <R>(project: (value: T, index: number) => Observable<any>, projectResult?: (outerValue: T, innerValue: any, outerIndex: number, innerIndex: number) => R);
}
export interface operator_proto_concatMapTo<T> {
  <R, R2>(observable: Observable<R>, projectResult?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2): Observable<R2>;
}
export interface operator_proto_count<T> {
  (predicate?: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<number>;
}
export interface operator_proto_dematerialize<T> {
  (): Observable<any>;
}
export interface operator_proto_debounce<T> {
  (durationSelector: (value: T) => Observable<any> | Promise<any>): Observable<T>;
}
export interface operator_proto_debounceTime<T> {
  (dueTime: number, scheduler: Scheduler): Observable<T>;
}
export interface operator_proto_defaultIfEmpty<T> {
  <R>(defaultValue: R): Observable<T> | Observable<R>;
}
export interface operator_proto_delay<T> {
  (delay: number|Date, scheduler: Scheduler);
}
export interface operator_proto_distinctUntilChanged<T> {
  (compare?: (x: T, y: T) => boolean, thisArg?: any);
}
export interface operator_proto_do<T> {
  (nextOrObserver?: Observer<T>|((x: T) => void), error?: (e: any) => void, complete?: () => void);
}
export interface operator_proto_expand<T> {
  <R>(project: (value: T, index: number) => Observable<R>, concurrent: number): Observable<R>;
}
export interface operator_proto_filter<T> {
  (select: (x: T, ix?: number) => boolean, thisArg?: any);
}
export interface operator_proto_finally<T> {
  (finallySelector: () => void, thisArg?: any);
}
export interface operator_proto_first<T> {
  <R>(predicate?: (value: T, index: number, source: Observable<T>) => boolean, resultSelector?: (value: T, index: number) => R, defaultValue?: any): Observable<T> | Observable<R>;
}
export interface operator_proto_mergeMap<T> {
  <R, R2>(project: (value: T, index: number) => Observable<R>, concurrent: number);
  <R, R2>(project: (value: T, index: number) => Observable<R>, resultSelector: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R, concurrent: number);
}
export interface operator_proto_mergeMapTo<T> {
  <R, R2>(observable: Observable<R>, concurrent: number): Observable<R2>;
  <R, R2>(observable: Observable<R>, resultSelector: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2, concurrent: number): Observable<R2>;
}
export interface operator_proto_groupBy<T> {
  <R>(keySelector: (value: T) => string, elementSelector?: any, durationSelector?: (grouped: GroupedObservable<R>) => Observable<any>): GroupByObservable<T, R>;
}
export interface operator_proto_ignoreElements<T> {
  ();
}
export interface operator_proto_last<T> {
  <R>(predicate?: (value: T, index: number, source: Observable<T>) => boolean, resultSelector?: (value: T, index: number) => R, defaultValue?: any): Observable<T> | Observable<R>;
}
export interface operator_proto_every<T> {
  (predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<boolean>;
}
export interface operator_proto_map<T> {
  <R>(project: (x: T, ix?: number) => R, thisArg?: any): Observable<R>;
}
export interface operator_proto_mapTo<T> {
  <R>(value: R);
}
export interface operator_proto_materialize<T> {
  (): Observable<Notification<T>>;
}
export interface operator_proto_merge<T> {
  <R>(...observables: (Observable<any>|Scheduler|number)[]): Observable<R>;
}
export interface operator_proto_mergeAll<T> {
  <R>(concurrent: number): Observable<R>;
}
export interface operator_proto_multicast<T> {
  (subjectOrSubjectFactory: Subject<T>|(() => Subject<T>));
}
export interface operator_proto_observeOn<T> {
  (scheduler: Scheduler, delay: number): Observable<T>;
}
export interface operator_proto_partition<T> {
  (predicate: (x: any, i?: any, a?: any) => boolean, thisArg?: any): Observable<T>[];
}
export interface operator_proto_publish<T> {
  ();
}
export interface operator_proto_publishBehavior<T> {
  (value: any);
}
export interface operator_proto_publishReplay<T> {
  (bufferSize: number, windowTime: number, scheduler?: Scheduler);
}
export interface operator_proto_reduce<T> {
  <R>(project: (acc: R, x: T) => R, seed?: R): Observable<R>;
}
export interface operator_proto_repeat<T> {
  (count: number): Observable<T>;
}
export interface operator_proto_retry<T> {
  (count: number): Observable<T>;
}
export interface operator_proto_retryWhen<T> {
  (notifier: (errors: Observable<any>) => Observable<any>);
}
export interface operator_proto_sample<T> {
  (notifier: Observable<any>): Observable<T>;
}
export interface operator_proto_sampleTime<T> {
  (delay: number, scheduler: Scheduler): Observable<T>;
}
export interface operator_proto_scan<T> {
  <R>(project: (acc: R, x: T) => R, acc?: R);
}
export interface operator_proto_share<T> {
  (): Observable<T>;
}
export interface operator_proto_single<T> {
  (predicate?: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<T>;
}
export interface operator_proto_skip<T> {
  (total);
}
export interface operator_proto_skipUntil<T> {
  (notifier: Observable<any>): Observable<T>;
}
export interface operator_proto_startWith<T> {
  (...array: (T | Scheduler)[]): Observable<T>;
}
export interface operator_proto_subscribeOn<T> {
  (scheduler: Scheduler, delay: number): Observable<T>;
}
export interface operator_proto_switch<T> {
  (): Observable<T>;
}
export interface operator_proto_switchMap<T> {
  <R, R2>(project: (value: T, index: number) => Observable<R>, resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2): Observable<R>;
}
export interface operator_proto_switchMapTo<T> {
  <R, R2>(observable: Observable<R>, projectResult?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2): Observable<R2>;
}
export interface operator_proto_take<T> {
  (total);
}
export interface operator_proto_takeUntil<T> {
  (notifier: Observable<any>);
}
export interface operator_proto_throttle<T> {
  (durationSelector: (value: T) => Observable<any> | Promise<any>): Observable<T>;
}
export interface operator_proto_throttleTime<T> {
  (delay: number, scheduler: Scheduler);
}
export interface operator_proto_timeout<T> {
  (due: number|Date, errorToSend: any, scheduler: Scheduler);
}
export interface operator_proto_timeoutWith<T> {
  <R>(due: number | Date, withObservable: Observable<R>, scheduler: Scheduler): Observable<T> | Observable<R>;
}
export interface operator_proto_toArray<T> {
  ();
}
export interface operator_proto_toPromise<T> {
  (PromiseCtor?: PromiseConstructor): Promise<T>;
}
export interface operator_proto_window<T> {
  (closingNotifier: Observable<any>): Observable<Observable<T>>;
}
export interface operator_proto_windowCount<T> {
  (windowSize: number, startWindowEvery: number): Observable<Observable<T>>;
}
export interface operator_proto_windowTime<T> {
  (windowTimeSpan: number, windowCreationInterval: number, scheduler: Scheduler): Observable<Observable<T>>;
}
export interface operator_proto_windowToggle<T> {
  <O>(openings: Observable<O>, closingSelector: (openValue: O) => Observable<any>): Observable<Observable<T>>;
}
export interface operator_proto_windowWhen<T> {
  (closingSelector: () => Observable<any>): Observable<Observable<T>>;
}
export interface operator_proto_withLatestFrom<T> {
  <R>(...args: Array<Observable<any> | ((...values: Array<any>) => R)>): Observable<R>;
}
export interface operator_proto_zip<T> {
  Proto<R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>): Observable<R>;
}
export interface operator_proto_zipAll<T> {
  <R>(project?: (...values: Array<any>) => R);
}
