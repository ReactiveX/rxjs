export declare function audit<T>(durationSelector: (value: T) => SubscribableOrPromise<any>): MonoTypeOperatorFunction<T>;

export declare function auditTime<T>(duration: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function buffer<T>(closingNotifier: Observable<any>): OperatorFunction<T, T[]>;

export declare function bufferCount<T>(bufferSize: number, startBufferEvery?: number): OperatorFunction<T, T[]>;

export declare function bufferTime<T>(bufferTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
export declare function bufferTime<T>(bufferTimeSpan: number, bufferCreationInterval: number | null | undefined, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
export declare function bufferTime<T>(bufferTimeSpan: number, bufferCreationInterval: number | null | undefined, maxBufferSize: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;

export declare function bufferToggle<T, O>(openings: SubscribableOrPromise<O>, closingSelector: (value: O) => SubscribableOrPromise<any>): OperatorFunction<T, T[]>;

export declare function bufferWhen<T>(closingSelector: () => Observable<any>): OperatorFunction<T, T[]>;

export declare function catchError<T, O extends ObservableInput<any>>(selector: (err: any, caught: Observable<T>) => O): OperatorFunction<T, T | ObservedValueOf<O>>;

export declare function combineAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
export declare function combineAll<T>(): OperatorFunction<any, T[]>;
export declare function combineAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
export declare function combineAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;

export declare function combineLatest<T, R>(project: (v1: T) => R): OperatorFunction<T, R>;
export declare function combineLatest<T, T2, R>(v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): OperatorFunction<T, R>;
export declare function combineLatest<T, T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R): OperatorFunction<T, R>;
export declare function combineLatest<T, T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R): OperatorFunction<T, R>;
export declare function combineLatest<T, T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): OperatorFunction<T, R>;
export declare function combineLatest<T, T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): OperatorFunction<T, R>;
export declare function combineLatest<T, T2>(v2: ObservableInput<T2>): OperatorFunction<T, [T, T2]>;
export declare function combineLatest<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): OperatorFunction<T, [T, T2, T3]>;
export declare function combineLatest<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): OperatorFunction<T, [T, T2, T3, T4]>;
export declare function combineLatest<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): OperatorFunction<T, [T, T2, T3, T4, T5]>;
export declare function combineLatest<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): OperatorFunction<T, [T, T2, T3, T4, T5, T6]>;
export declare function combineLatest<T, R>(...observables: Array<ObservableInput<T> | ((...values: Array<T>) => R)>): OperatorFunction<T, R>;
export declare function combineLatest<T, R>(array: ObservableInput<T>[]): OperatorFunction<T, Array<T>>;
export declare function combineLatest<T, TOther, R>(array: ObservableInput<TOther>[], project: (v1: T, ...values: Array<TOther>) => R): OperatorFunction<T, R>;

export declare function concat<T>(scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
export declare function concat<T, T2>(v2: ObservableInput<T2>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2>;
export declare function concat<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3>;
export declare function concat<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4>;
export declare function concat<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5>;
export declare function concat<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5 | T6>;
export declare function concat<T>(...observables: Array<ObservableInput<T> | SchedulerLike>): MonoTypeOperatorFunction<T>;
export declare function concat<T, R>(...observables: Array<ObservableInput<any> | SchedulerLike>): OperatorFunction<T, R>;

export declare function concatAll<T>(): OperatorFunction<ObservableInput<T>, T>;
export declare function concatAll<R>(): OperatorFunction<any, R>;

export declare function concatMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
export declare function concatMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: undefined): OperatorFunction<T, ObservedValueOf<O>>;
export declare function concatMap<T, R, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;

export declare function concatMapTo<T, O extends ObservableInput<any>>(observable: O): OperatorFunction<T, ObservedValueOf<O>>;
export declare function concatMapTo<T, O extends ObservableInput<any>>(observable: O, resultSelector: undefined): OperatorFunction<T, ObservedValueOf<O>>;
export declare function concatMapTo<T, R, O extends ObservableInput<any>>(observable: O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;

export declare function count<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, number>;

export declare function debounce<T>(durationSelector: (value: T) => SubscribableOrPromise<any>): MonoTypeOperatorFunction<T>;

export declare function debounceTime<T>(dueTime: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function defaultIfEmpty<T>(defaultValue?: T): MonoTypeOperatorFunction<T>;
export declare function defaultIfEmpty<T, R>(defaultValue?: R): OperatorFunction<T, T | R>;

export declare function delay<T>(delay: number | Date, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function delayWhen<T>(delayDurationSelector: (value: T, index: number) => Observable<never>, subscriptionDelay?: Observable<any>): MonoTypeOperatorFunction<T>;
export declare function delayWhen<T>(delayDurationSelector: (value: T, index: number) => Observable<any>, subscriptionDelay?: Observable<any>): MonoTypeOperatorFunction<T>;

export declare function dematerialize<T>(): OperatorFunction<Notification<T>, T>;

export declare function distinct<T, K>(keySelector?: (value: T) => K, flushes?: Observable<any>): MonoTypeOperatorFunction<T>;

export declare function distinctUntilChanged<T>(compare?: (x: T, y: T) => boolean): MonoTypeOperatorFunction<T>;
export declare function distinctUntilChanged<T, K>(compare: (x: K, y: K) => boolean, keySelector: (x: T) => K): MonoTypeOperatorFunction<T>;

export declare function distinctUntilKeyChanged<T>(key: keyof T): MonoTypeOperatorFunction<T>;
export declare function distinctUntilKeyChanged<T, K extends keyof T>(key: K, compare: (x: T[K], y: T[K]) => boolean): MonoTypeOperatorFunction<T>;

export declare function elementAt<T>(index: number, defaultValue?: T): MonoTypeOperatorFunction<T>;

export declare function endWith<T>(scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;
export declare function endWith<T, A>(v1: A, scheduler: SchedulerLike): OperatorFunction<T, T | A>;
export declare function endWith<T, A, B>(v1: A, v2: B, scheduler: SchedulerLike): OperatorFunction<T, T | A | B>;
export declare function endWith<T, A, B, C>(v1: A, v2: B, v3: C, scheduler: SchedulerLike): OperatorFunction<T, T | A | B | C>;
export declare function endWith<T, A, B, C, D>(v1: A, v2: B, v3: C, v4: D, scheduler: SchedulerLike): OperatorFunction<T, T | A | B | C | D>;
export declare function endWith<T, A, B, C, D, E>(v1: A, v2: B, v3: C, v4: D, v5: E, scheduler: SchedulerLike): OperatorFunction<T, T | A | B | C | D | E>;
export declare function endWith<T, A, B, C, D, E, F>(v1: A, v2: B, v3: C, v4: D, v5: E, v6: F, scheduler: SchedulerLike): OperatorFunction<T, T | A | B | C | D | E | F>;
export declare function endWith<T, A>(v1: A): OperatorFunction<T, T | A>;
export declare function endWith<T, A, B>(v1: A, v2: B): OperatorFunction<T, T | A | B>;
export declare function endWith<T, A, B, C>(v1: A, v2: B, v3: C): OperatorFunction<T, T | A | B | C>;
export declare function endWith<T, A, B, C, D>(v1: A, v2: B, v3: C, v4: D): OperatorFunction<T, T | A | B | C | D>;
export declare function endWith<T, A, B, C, D, E>(v1: A, v2: B, v3: C, v4: D, v5: E): OperatorFunction<T, T | A | B | C | D | E>;
export declare function endWith<T, A, B, C, D, E, F>(v1: A, v2: B, v3: C, v4: D, v5: E, v6: F): OperatorFunction<T, T | A | B | C | D | E | F>;
export declare function endWith<T, Z = T>(...array: Z[]): OperatorFunction<T, T | Z>;
export declare function endWith<T, Z = T>(...array: Array<Z | SchedulerLike>): OperatorFunction<T, T | Z>;

export declare function every<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): OperatorFunction<T, boolean>;

export declare function exhaust<T>(): OperatorFunction<ObservableInput<T>, T>;
export declare function exhaust<R>(): OperatorFunction<any, R>;

export declare function exhaustMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
export declare function exhaustMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: undefined): OperatorFunction<T, ObservedValueOf<O>>;
export declare function exhaustMap<T, I, R>(project: (value: T, index: number) => ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;

export declare function expand<T, R>(project: (value: T, index: number) => ObservableInput<R>, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, R>;
export declare function expand<T>(project: (value: T, index: number) => ObservableInput<T>, concurrent?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function filter<T, S extends T>(predicate: (value: T, index: number) => value is S, thisArg?: any): OperatorFunction<T, S>;
export declare function filter<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): MonoTypeOperatorFunction<T>;

export declare function finalize<T>(callback: () => void): MonoTypeOperatorFunction<T>;

export declare function find<T, S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S, thisArg?: any): OperatorFunction<T, S | undefined>;
export declare function find<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): OperatorFunction<T, T | undefined>;

export declare function findIndex<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): OperatorFunction<T, number>;

export declare function first<T, D = T>(predicate?: null, defaultValue?: D): OperatorFunction<T, T | D>;
export declare function first<T, S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue?: S): OperatorFunction<T, S>;
export declare function first<T, D = T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>;

export declare const flatMap: typeof mergeMap;

export declare function groupBy<T, K>(keySelector: (value: T) => K): OperatorFunction<T, GroupedObservable<K, T>>;
export declare function groupBy<T, K>(keySelector: (value: T) => K, elementSelector: void, durationSelector: (grouped: GroupedObservable<K, T>) => Observable<any>): OperatorFunction<T, GroupedObservable<K, T>>;
export declare function groupBy<T, K, R>(keySelector: (value: T) => K, elementSelector?: (value: T) => R, durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>): OperatorFunction<T, GroupedObservable<K, R>>;
export declare function groupBy<T, K, R>(keySelector: (value: T) => K, elementSelector?: (value: T) => R, durationSelector?: (grouped: GroupedObservable<K, R>) => Observable<any>, subjectSelector?: () => Subject<R>): OperatorFunction<T, GroupedObservable<K, R>>;

export declare function ignoreElements(): OperatorFunction<any, never>;

export declare function isEmpty<T>(): OperatorFunction<T, boolean>;

export declare function last<T, D = T>(predicate?: null, defaultValue?: D): OperatorFunction<T, T | D>;
export declare function last<T, S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue?: S): OperatorFunction<T, S>;
export declare function last<T, D = T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>;

export declare function map<T, R>(project: (value: T, index: number) => R, thisArg?: any): OperatorFunction<T, R>;

export declare function mapTo<T, R>(value: R): OperatorFunction<T, R>;

export declare function materialize<T>(): OperatorFunction<T, Notification<T>>;

export declare function max<T>(comparer?: (x: T, y: T) => number): MonoTypeOperatorFunction<T>;

export declare function merge<T>(scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
export declare function merge<T>(concurrent?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
export declare function merge<T, T2>(v2: ObservableInput<T2>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2>;
export declare function merge<T, T2>(v2: ObservableInput<T2>, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2>;
export declare function merge<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3>;
export declare function merge<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3>;
export declare function merge<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4>;
export declare function merge<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4>;
export declare function merge<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5>;
export declare function merge<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5>;
export declare function merge<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5 | T6>;
export declare function merge<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5 | T6>;
export declare function merge<T>(...observables: Array<ObservableInput<T> | SchedulerLike | number>): MonoTypeOperatorFunction<T>;
export declare function merge<T, R>(...observables: Array<ObservableInput<any> | SchedulerLike | number>): OperatorFunction<T, R>;

export declare function mergeAll<T>(concurrent?: number): OperatorFunction<ObservableInput<T>, T>;

export declare function mergeMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
export declare function mergeMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: undefined, concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
export declare function mergeMap<T, R, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R, concurrent?: number): OperatorFunction<T, R>;

export declare function mergeMapTo<T, O extends ObservableInput<any>>(innerObservable: O, concurrent?: number): OperatorFunction<any, ObservedValueOf<O>>;
export declare function mergeMapTo<T, R, O extends ObservableInput<any>>(innerObservable: O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R, concurrent?: number): OperatorFunction<T, R>;

export declare function mergeScan<T, R>(accumulator: (acc: R, value: T, index: number) => ObservableInput<R>, seed: R, concurrent?: number): OperatorFunction<T, R>;

export declare function min<T>(comparer?: (x: T, y: T) => number): MonoTypeOperatorFunction<T>;

export declare function multicast<T>(subject: Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
export declare function multicast<T, O extends ObservableInput<any>>(subject: Subject<T>, selector: (shared: Observable<T>) => O): UnaryFunction<Observable<T>, ConnectableObservable<ObservedValueOf<O>>>;
export declare function multicast<T>(subjectFactory: (this: Observable<T>) => Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
export declare function multicast<T, O extends ObservableInput<any>>(SubjectFactory: (this: Observable<T>) => Subject<T>, selector: (shared: Observable<T>) => O): OperatorFunction<T, ObservedValueOf<O>>;

export declare function observeOn<T>(scheduler: SchedulerLike, delay?: number): MonoTypeOperatorFunction<T>;

export declare function onErrorResumeNext<T>(): OperatorFunction<T, T>;
export declare function onErrorResumeNext<T, T2>(v: ObservableInput<T2>): OperatorFunction<T, T | T2>;
export declare function onErrorResumeNext<T, T2, T3>(v: ObservableInput<T2>, v2: ObservableInput<T3>): OperatorFunction<T, T | T2 | T3>;
export declare function onErrorResumeNext<T, T2, T3, T4>(v: ObservableInput<T2>, v2: ObservableInput<T3>, v3: ObservableInput<T4>): OperatorFunction<T, T | T2 | T3 | T4>;
export declare function onErrorResumeNext<T, T2, T3, T4, T5>(v: ObservableInput<T2>, v2: ObservableInput<T3>, v3: ObservableInput<T4>, v4: ObservableInput<T5>): OperatorFunction<T, T | T2 | T3 | T4 | T5>;
export declare function onErrorResumeNext<T, T2, T3, T4, T5, T6>(v: ObservableInput<T2>, v2: ObservableInput<T3>, v3: ObservableInput<T4>, v4: ObservableInput<T5>, v5: ObservableInput<T6>): OperatorFunction<T, T | T2 | T3 | T4 | T5 | T6>;
export declare function onErrorResumeNext<T, T2, T3, T4, T5, T6, T7>(v: ObservableInput<T2>, v2: ObservableInput<T3>, v3: ObservableInput<T4>, v4: ObservableInput<T5>, v5: ObservableInput<T6>, v6: ObservableInput<T7>): OperatorFunction<T, T | T2 | T3 | T4 | T5 | T6 | T7>;
export declare function onErrorResumeNext<T, R>(...observables: Array<ObservableInput<any>>): OperatorFunction<T, T | R>;
export declare function onErrorResumeNext<T, R>(array: ObservableInput<any>[]): OperatorFunction<T, T | R>;

export declare function pairwise<T>(): OperatorFunction<T, [T, T]>;

export declare function partition<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): UnaryFunction<Observable<T>, [Observable<T>, Observable<T>]>;

export declare function pluck<T, K1 extends keyof T>(k1: K1): OperatorFunction<T, T[K1]>;
export declare function pluck<T, K1 extends keyof T, K2 extends keyof T[K1]>(k1: K1, k2: K2): OperatorFunction<T, T[K1][K2]>;
export declare function pluck<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(k1: K1, k2: K2, k3: K3): OperatorFunction<T, T[K1][K2][K3]>;
export declare function pluck<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(k1: K1, k2: K2, k3: K3, k4: K4): OperatorFunction<T, T[K1][K2][K3][K4]>;
export declare function pluck<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3], K5 extends keyof T[K1][K2][K3][K4]>(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5): OperatorFunction<T, T[K1][K2][K3][K4][K5]>;
export declare function pluck<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3], K5 extends keyof T[K1][K2][K3][K4], K6 extends keyof T[K1][K2][K3][K4][K5]>(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6): OperatorFunction<T, T[K1][K2][K3][K4][K5][K6]>;
export declare function pluck<T, R>(...properties: string[]): OperatorFunction<T, R>;

export declare function publish<T>(): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
export declare function publish<T, O extends ObservableInput<any>>(selector: (shared: Observable<T>) => O): OperatorFunction<T, ObservedValueOf<O>>;
export declare function publish<T>(selector: MonoTypeOperatorFunction<T>): MonoTypeOperatorFunction<T>;

export declare function publishBehavior<T>(value: T): UnaryFunction<Observable<T>, ConnectableObservable<T>>;

export declare function publishLast<T>(): UnaryFunction<Observable<T>, ConnectableObservable<T>>;

export declare function publishReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
export declare function publishReplay<T, O extends ObservableInput<any>>(bufferSize?: number, windowTime?: number, selector?: (shared: Observable<T>) => O, scheduler?: SchedulerLike): OperatorFunction<T, ObservedValueOf<O>>;

export declare function race<T>(observables: Array<Observable<T>>): MonoTypeOperatorFunction<T>;
export declare function race<T, R>(observables: Array<Observable<T>>): OperatorFunction<T, R>;
export declare function race<T>(...observables: Array<Observable<T> | Array<Observable<T>>>): MonoTypeOperatorFunction<T>;
export declare function race<T, R>(...observables: Array<Observable<any> | Array<Observable<any>>>): OperatorFunction<T, R>;

export declare function reduce<T, R>(accumulator: (acc: R, value: T, index: number) => R, seed: R): OperatorFunction<T, R>;
export declare function reduce<T>(accumulator: (acc: T, value: T, index: number) => T, seed?: T): MonoTypeOperatorFunction<T>;
export declare function reduce<T, R>(accumulator: (acc: R, value: T, index: number) => R): OperatorFunction<T, R>;

export declare function refCount<T>(): MonoTypeOperatorFunction<T>;

export declare function repeat<T>(count?: number): MonoTypeOperatorFunction<T>;

export declare function repeatWhen<T>(notifier: (notifications: Observable<any>) => Observable<any>): MonoTypeOperatorFunction<T>;

export declare function retry<T>(count?: number): MonoTypeOperatorFunction<T>;

export declare function retryWhen<T>(notifier: (errors: Observable<any>) => Observable<any>): MonoTypeOperatorFunction<T>;

export declare function sample<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T>;

export declare function sampleTime<T>(period: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function scan<T, R>(accumulator: (acc: R, value: T, index: number) => R, seed: R): OperatorFunction<T, R>;
export declare function scan<T>(accumulator: (acc: T, value: T, index: number) => T, seed?: T): MonoTypeOperatorFunction<T>;
export declare function scan<T, R>(accumulator: (acc: R, value: T, index: number) => R): OperatorFunction<T, R>;

export declare function sequenceEqual<T>(compareTo: Observable<T>, comparator?: (a: T, b: T) => boolean): OperatorFunction<T, boolean>;

export declare function share<T>(): MonoTypeOperatorFunction<T>;

export declare function shareReplay<T>(config: ShareReplayConfig): MonoTypeOperatorFunction<T>;
export declare function shareReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function single<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): MonoTypeOperatorFunction<T>;

export declare function skip<T>(count: number): MonoTypeOperatorFunction<T>;

export declare function skipLast<T>(count: number): MonoTypeOperatorFunction<T>;

export declare function skipUntil<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T>;

export declare function skipWhile<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;

export declare function startWith<T>(scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;
export declare function startWith<T, D>(v1: D, scheduler: SchedulerLike): OperatorFunction<T, T | D>;
export declare function startWith<T, D, E>(v1: D, v2: E, scheduler: SchedulerLike): OperatorFunction<T, T | D | E>;
export declare function startWith<T, D, E, F>(v1: D, v2: E, v3: F, scheduler: SchedulerLike): OperatorFunction<T, T | D | E | F>;
export declare function startWith<T, D, E, F, G>(v1: D, v2: E, v3: F, v4: G, scheduler: SchedulerLike): OperatorFunction<T, T | D | E | F | G>;
export declare function startWith<T, D, E, F, G, H>(v1: D, v2: E, v3: F, v4: G, v5: H, scheduler: SchedulerLike): OperatorFunction<T, T | D | E | F | G | H>;
export declare function startWith<T, D, E, F, G, H, I>(v1: D, v2: E, v3: F, v4: G, v5: H, v6: I, scheduler: SchedulerLike): OperatorFunction<T, T | D | E | F | G | H | I>;
export declare function startWith<T, D>(v1: D): OperatorFunction<T, T | D>;
export declare function startWith<T, D, E>(v1: D, v2: E): OperatorFunction<T, T | D | E>;
export declare function startWith<T, D, E, F>(v1: D, v2: E, v3: F): OperatorFunction<T, T | D | E | F>;
export declare function startWith<T, D, E, F, G>(v1: D, v2: E, v3: F, v4: G): OperatorFunction<T, T | D | E | F | G>;
export declare function startWith<T, D, E, F, G, H>(v1: D, v2: E, v3: F, v4: G, v5: H): OperatorFunction<T, T | D | E | F | G | H>;
export declare function startWith<T, D, E, F, G, H, I>(v1: D, v2: E, v3: F, v4: G, v5: H, v6: I): OperatorFunction<T, T | D | E | F | G | H | I>;
export declare function startWith<T, D = T>(...array: D[]): OperatorFunction<T, T | D>;
export declare function startWith<T, D = T>(...array: Array<D | SchedulerLike>): OperatorFunction<T, T | D>;

export declare function subscribeOn<T>(scheduler: SchedulerLike, delay?: number): MonoTypeOperatorFunction<T>;

export declare function switchAll<T>(): OperatorFunction<ObservableInput<T>, T>;
export declare function switchAll<R>(): OperatorFunction<any, R>;

export declare function switchMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
export declare function switchMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: undefined): OperatorFunction<T, ObservedValueOf<O>>;
export declare function switchMap<T, R, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;

export declare function switchMapTo<R>(observable: ObservableInput<R>): OperatorFunction<any, R>;
export declare function switchMapTo<T, R>(observable: ObservableInput<R>, resultSelector: undefined): OperatorFunction<T, R>;
export declare function switchMapTo<T, I, R>(observable: ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;

export declare function take<T>(count: number): MonoTypeOperatorFunction<T>;

export declare function takeLast<T>(count: number): MonoTypeOperatorFunction<T>;

export declare function takeUntil<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T>;

export declare function takeWhile<T, S extends T>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
export declare function takeWhile<T, S extends T>(predicate: (value: T, index: number) => value is S, inclusive: false): OperatorFunction<T, S>;
export declare function takeWhile<T>(predicate: (value: T, index: number) => boolean, inclusive?: boolean): MonoTypeOperatorFunction<T>;

export declare function tap<T>(next: null | undefined, error: null | undefined, complete: () => void): MonoTypeOperatorFunction<T>;
export declare function tap<T>(next: null | undefined, error: (error: any) => void, complete?: () => void): MonoTypeOperatorFunction<T>;
export declare function tap<T>(next: (value: T) => void, error: null | undefined, complete: () => void): MonoTypeOperatorFunction<T>;
export declare function tap<T>(next?: (x: T) => void, error?: (e: any) => void, complete?: () => void): MonoTypeOperatorFunction<T>;
export declare function tap<T>(observer: PartialObserver<T>): MonoTypeOperatorFunction<T>;

export declare function throttle<T>(durationSelector: (value: T) => SubscribableOrPromise<any>, config?: ThrottleConfig): MonoTypeOperatorFunction<T>;

export declare function throttleTime<T>(duration: number, scheduler?: SchedulerLike, config?: ThrottleConfig): MonoTypeOperatorFunction<T>;

export declare function throwIfEmpty<T>(errorFactory?: (() => any)): MonoTypeOperatorFunction<T>;

export declare function timeInterval<T>(scheduler?: SchedulerLike): OperatorFunction<T, TimeInterval<T>>;

export declare function timeout<T>(due: number | Date, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function timeoutWith<T, R>(due: number | Date, withObservable: ObservableInput<R>, scheduler?: SchedulerLike): OperatorFunction<T, T | R>;

export declare function timestamp<T>(scheduler?: SchedulerLike): OperatorFunction<T, Timestamp<T>>;

export declare function toArray<T>(): OperatorFunction<T, T[]>;

export declare function window<T>(windowBoundaries: Observable<any>): OperatorFunction<T, Observable<T>>;

export declare function windowCount<T>(windowSize: number, startWindowEvery?: number): OperatorFunction<T, Observable<T>>;

export declare function windowTime<T>(windowTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
export declare function windowTime<T>(windowTimeSpan: number, windowCreationInterval: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
export declare function windowTime<T>(windowTimeSpan: number, windowCreationInterval: number, maxWindowSize: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;

export declare function windowToggle<T, O>(openings: Observable<O>, closingSelector: (openValue: O) => Observable<any>): OperatorFunction<T, Observable<T>>;

export declare function windowWhen<T>(closingSelector: () => Observable<any>): OperatorFunction<T, Observable<T>>;

export declare function withLatestFrom<T, R>(project: (v1: T) => R): OperatorFunction<T, R>;
export declare function withLatestFrom<T, O2 extends ObservableInput<any>, R>(source2: O2, project: (v1: T, v2: ObservedValueOf<O2>) => R): OperatorFunction<T, R>;
export declare function withLatestFrom<T, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, R>(v2: O2, v3: O3, project: (v1: T, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>) => R): OperatorFunction<T, R>;
export declare function withLatestFrom<T, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, R>(v2: O2, v3: O3, v4: O4, project: (v1: T, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>) => R): OperatorFunction<T, R>;
export declare function withLatestFrom<T, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, R>(v2: O2, v3: O3, v4: O4, v5: O5, project: (v1: T, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>, v5: ObservedValueOf<O5>) => R): OperatorFunction<T, R>;
export declare function withLatestFrom<T, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>, R>(v2: O2, v3: O3, v4: O4, v5: O5, v6: O6, project: (v1: T, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>, v5: ObservedValueOf<O5>, v6: ObservedValueOf<O6>) => R): OperatorFunction<T, R>;
export declare function withLatestFrom<T, O2 extends ObservableInput<any>>(source2: O2): OperatorFunction<T, [T, ObservedValueOf<O2>]>;
export declare function withLatestFrom<T, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(v2: O2, v3: O3): OperatorFunction<T, [T, ObservedValueOf<O2>, ObservedValueOf<O3>]>;
export declare function withLatestFrom<T, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>>(v2: O2, v3: O3, v4: O4): OperatorFunction<T, [T, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>]>;
export declare function withLatestFrom<T, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>>(v2: O2, v3: O3, v4: O4, v5: O5): OperatorFunction<T, [T, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>]>;
export declare function withLatestFrom<T, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>>(v2: O2, v3: O3, v4: O4, v5: O5, v6: O6): OperatorFunction<T, [T, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>, ObservedValueOf<O6>]>;
export declare function withLatestFrom<T, R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): OperatorFunction<T, R>;
export declare function withLatestFrom<T, R>(array: ObservableInput<any>[]): OperatorFunction<T, R>;
export declare function withLatestFrom<T, R>(array: ObservableInput<any>[], project: (...values: Array<any>) => R): OperatorFunction<T, R>;

export declare function zip<T, R>(project: (v1: T) => R): OperatorFunction<T, R>;
export declare function zip<T, T2, R>(v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): OperatorFunction<T, R>;
export declare function zip<T, T2, T3, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, project: (v1: T, v2: T2, v3: T3) => R): OperatorFunction<T, R>;
export declare function zip<T, T2, T3, T4, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => R): OperatorFunction<T, R>;
export declare function zip<T, T2, T3, T4, T5, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R): OperatorFunction<T, R>;
export declare function zip<T, T2, T3, T4, T5, T6, R>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R): OperatorFunction<T, R>;
export declare function zip<T, T2>(v2: ObservableInput<T2>): OperatorFunction<T, [T, T2]>;
export declare function zip<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): OperatorFunction<T, [T, T2, T3]>;
export declare function zip<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): OperatorFunction<T, [T, T2, T3, T4]>;
export declare function zip<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): OperatorFunction<T, [T, T2, T3, T4, T5]>;
export declare function zip<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): OperatorFunction<T, [T, T2, T3, T4, T5, T6]>;
export declare function zip<T, R>(...observables: Array<ObservableInput<T> | ((...values: Array<T>) => R)>): OperatorFunction<T, R>;
export declare function zip<T, R>(array: Array<ObservableInput<T>>): OperatorFunction<T, R>;
export declare function zip<T, TOther, R>(array: Array<ObservableInput<TOther>>, project: (v1: T, ...values: Array<TOther>) => R): OperatorFunction<T, R>;

export declare function zipAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
export declare function zipAll<T>(): OperatorFunction<any, T[]>;
export declare function zipAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
export declare function zipAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;
