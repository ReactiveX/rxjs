import {Observable, ObservableOrIterable} from './Observable';
import {Scheduler} from './Scheduler';
import {ConnectableObservable} from './observables/ConnectableObservable';
import {Subject} from './Subject';
import {GroupedObservable} from './operators/groupBy-support';
import {Notification} from './Notification';

// Once we get the ability to declare the type of `this` as a generic <T>
// We can replace these duplicates with typeof abc;
// https://github.com/Microsoft/TypeScript/issues/3694
export interface CoreOperators<T> {
  buffer?: (closingNotifier: Observable<any>) => Observable<T[]>;
  bufferCount?: (bufferSize: number, startBufferEvery: number) => Observable<T[]>;
  bufferTime?: (bufferTimeSpan: number, bufferCreationInterval?: number, scheduler?: Scheduler) => Observable<T[]>;
  bufferToggle?: <O>(openings: Observable<O>, closingSelector?: (openValue: O) => Observable<any>) => Observable<T[]>;
  bufferWhen?: (closingSelector: () => Observable<any>) => Observable<T[]>;
  catch?: (selector: (err: any, source: Observable<T>, caught: Observable<any>) => Observable<any>) => Observable<T>;
    combineAll: {
        (project?: (...values: Array<any>) => T): Observable<T>;
        <R>(project?: (...values: Array<any>) => R): Observable<R>;
    };
    combineLatest: {
        (first: ObservableOrIterable<T>): Observable<[T]>;
        <TResult>(first: ObservableOrIterable<T>, project: (v1: T) => TResult): Observable<TResult>;
        <T2>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>): Observable<[T, T2]>;
        <T2, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, project: (v1: T, v2: T2) => TResult): Observable<TResult>;
        <T2, T3>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>): Observable<[T, T2, T3]>;
        <T2, T3, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;
        <T2, T3, T4>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>): Observable<[T, T2, T3, T4]>;
        <T2, T3, T4, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;
        <T2, T3, T4, T5>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>): Observable<[T, T2, T3, T4, T5]>;
        <T2, T3, T4, T5, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;
        <T2, T3, T4, T5, T6>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
        <T2, T3, T4, T5, T6, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;
        <T2, T3, T4, T5, T6, T7>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, eventh: ObservableOrIterable<T7>): Observable<[T, T2, T3, T4, T5, T6, T7]>;
        <T2, T3, T4, T5, T6, T7, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, eventh: ObservableOrIterable<T7>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult): Observable<TResult>;
        <T2, T3, T4, T5, T6, T7, T8>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;
        <T2, T3, T4, T5, T6, T7, T8, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult): Observable<TResult>;
        <T2, T3, T4, T5, T6, T7, T8, T9>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>, ninth: ObservableOrIterable<T9>): Observable<[T, T2, T3, T4, T5, T6, T7, T8, T9]>;
        <T2, T3, T4, T5, T6, T7, T8, T9, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>, ninth: ObservableOrIterable<T9>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult): Observable<TResult>;
        (...observables: Array<ObservableOrIterable<T> | ((...values: Array<T>) => T)>): Observable<T>;
        <R>(...observables: Array<ObservableOrIterable<T> | ((...values: Array<T>) => R)>): Observable<R>;
        (...observables: Array<T>): Observable<T[]>;
    };
  concat?: <R>(...observables: (Observable<any> | Scheduler)[]) => Observable<R>;
  concatAll?: () => Observable<T>;
  concatMap?: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  concatMapTo?: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  count?: (predicate?: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any) => Observable<number>;
  dematerialize?: () => Observable<any>;
  debounce?: (durationSelector: (value: T) => Observable<any> | Promise<any>) => Observable<T>;
  debounceTime?: <R>(dueTime: number, scheduler?: Scheduler) => Observable<R>;
  defaultIfEmpty?: <R>(defaultValue?: T | R) => Observable<T> | Observable<R>;
  delay?: (delay: number, scheduler?: Scheduler) => Observable<T>;
  distinctUntilChanged?: (compare?: (x: T, y: T) => boolean, thisArg?: any) => Observable<T>;
  do?: (next?: (x: T) => void, error?: (e: any) => void, complete?: () => void) => Observable<T>;
  expand?: <R>(project: (x: T, ix: number) => Observable<R>) => Observable<R>;
  filter?: (predicate: (x: T) => boolean, ix?: number, thisArg?: any) => Observable<T>;
  finally?: (ensure: () => void, thisArg?: any) => Observable<T>;
  first?: <R>(predicate?: (value: T, index: number, source: Observable<T>) => boolean,
              resultSelector?: (value: T, index: number) => R, thisArg?: any, defaultValue?: any) => Observable<T> | Observable<R>;
  flatMap?: <R>(project: ((x: T, ix: number) => Observable<any>),
                projectResult?: (x: T, y: any, ix: number, iy: number) => R,
                concurrent?: number) => Observable<R>;
  flatMapTo?: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
  groupBy?: <R>(keySelector: (value: T) => string,
                elementSelector?: (value: T) => R,
                durationSelector?: (group: GroupedObservable<R>) => Observable<any>) => Observable<GroupedObservable<R>>;
  ignoreElements?: () => Observable<T>;
  last?: <R>(predicate?: (value: T, index: number) => boolean,
             resultSelector?: (value: T, index: number) => R,
             thisArg?: any, defaultValue?: any) => Observable<T> | Observable<R>;
  every?: (predicate: (value: T, index: number) => boolean, thisArg?: any) => Observable<T>;
  map?: <R>(project: (x: T, ix?: number) => R, thisArg?: any) => Observable<R>;
  mapTo?: <R>(value: R) => Observable<R>;
  materialize?: () => Observable<Notification<T>>;
  merge?: (...observables: any[]) => Observable<any>;
  mergeAll?: (concurrent?: number) => Observable<T>;
  mergeMap?: <R>(project: ((x: T, ix: number) => Observable<any>),
                 projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
  mergeMapTo?: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R, concurrent?: number) => Observable<R>;
  multicast?: (subjectFactory: () => Subject<T>) => ConnectableObservable<T>;
  observeOn?: (scheduler: Scheduler, delay?: number) => Observable<T>;
  partition?: (predicate: (x: T) => boolean) => Observable<T>[];
  publish?: () => ConnectableObservable<T>;
  publishBehavior?: (value: any) => ConnectableObservable<T>;
  publishReplay?: (bufferSize: number, windowTime: number, scheduler?: Scheduler) => ConnectableObservable<T>;
  reduce?: <R>(project: (acc: R, x: T) => R, seed?: R) => Observable<R>;
  repeat?: (count?: number) => Observable<T>;
  retry?: (count?: number) => Observable<T>;
  retryWhen?: (notifier: (errors: Observable<any>) => Observable<any>) => Observable<T>;
  sample?: (notifier: Observable<any>) => Observable<T>;
  sampleTime?: (delay: number, scheduler?: Scheduler) => Observable<T>;
  scan?: <R>(project: (acc: R, x: T) => R, acc?: R) => Observable<R>;
  share?: () => Observable<T>;
  single?: (predicate?: (value: T, index: number) => boolean, thisArg?: any) => Observable<T>;
  skip?: (count: number) => Observable<T>;
  skipUntil?: (notifier: Observable<any>) => Observable<T>;
  skipWhile?: (predicate: (x: T, index: number) => boolean, thisArg?: any) => Observable<T>;
  startWith?: (x: T) => Observable<T>;
  subscribeOn?: (scheduler: Scheduler, delay?: number) => Observable<T>;
  switch?: () => Observable<T>;
  switchMap?: <R>(project: ((x: T, ix: number) => Observable<any>), projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  switchMapTo?: <R>(observable: Observable<any>, projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
  take?: (count: number) => Observable<T>;
  takeUntil?: (notifier: Observable<any>) => Observable<T>;
  takeWhile?: (predicate: (value: T, index: number) => boolean, thisArg?: any) => Observable<T>;
  throttle?: (durationSelector: (value: T) => Observable<any> | Promise<any>) => Observable<T>;
  throttleTime?: (delay: number, scheduler?: Scheduler) => Observable<T>;
  timeout?: (due: number | Date, errorToSend?: any, scheduler?: Scheduler) => Observable<T>;
  timeoutWith?: <R>(due: number | Date, withObservable: Observable<R>, scheduler?: Scheduler) => Observable<T> | Observable<R>;
  toArray?: () => Observable<T[]>;
  toPromise?: (PromiseCtor: PromiseConstructor) => Promise<T>;
  window?: (closingNotifier: Observable<any>) => Observable<Observable<T>>;
  windowCount?: (windowSize: number, startWindowEvery: number) => Observable<Observable<T>>;
  windowTime?: (windowTimeSpan: number, windowCreationInterval?: number, scheduler?: Scheduler) => Observable<Observable<T>>;
  windowToggle?: <O>(openings: Observable<O>, closingSelector?: (openValue: O) => Observable<any>) => Observable<Observable<T>>;
  windowWhen?: (closingSelector: () => Observable<any>) => Observable<Observable<T>>;
  withLatestFrom?: <R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>) => Observable<R>;
  zip?: <R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>) => Observable<R>;
  zipAll?: <R>(project?: (...values: Array<any>) => R) => Observable<R>;
}
