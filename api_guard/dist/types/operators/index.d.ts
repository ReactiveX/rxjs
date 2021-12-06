export declare function audit<T>(durationSelector: (value: T) => ObservableInput<any>): MonoTypeOperatorFunction<T>;

export declare function auditTime<T>(duration: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function buffer<T>(closingNotifier: Observable<any>): OperatorFunction<T, T[]>;

export declare function bufferCount<T>(bufferSize: number, startBufferEvery?: number | null): OperatorFunction<T, T[]>;

export declare function bufferTime<T>(bufferTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
export declare function bufferTime<T>(bufferTimeSpan: number, bufferCreationInterval: number | null | undefined, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
export declare function bufferTime<T>(bufferTimeSpan: number, bufferCreationInterval: number | null | undefined, maxBufferSize: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;

export declare function bufferToggle<T, O>(openings: ObservableInput<O>, closingSelector: (value: O) => ObservableInput<any>): OperatorFunction<T, T[]>;

export declare function bufferWhen<T>(closingSelector: () => ObservableInput<any>): OperatorFunction<T, T[]>;

export declare function catchError<T, O extends ObservableInput<any>>(selector: (err: any, caught: Observable<T>) => O): OperatorFunction<T, T | ObservedValueOf<O>>;

export declare const combineAll: typeof combineLatestAll;

export declare function combineLatest<T, A extends readonly unknown[], R>(sources: [...ObservableInputTuple<A>], project: (...values: [T, ...A]) => R): OperatorFunction<T, R>;
export declare function combineLatest<T, A extends readonly unknown[], R>(sources: [...ObservableInputTuple<A>]): OperatorFunction<T, [T, ...A]>;
export declare function combineLatest<T, A extends readonly unknown[], R>(...sourcesAndProject: [...ObservableInputTuple<A>, (...values: [T, ...A]) => R]): OperatorFunction<T, R>;
export declare function combineLatest<T, A extends readonly unknown[], R>(...sources: [...ObservableInputTuple<A>]): OperatorFunction<T, [T, ...A]>;

export declare function combineLatestAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
export declare function combineLatestAll<T>(): OperatorFunction<any, T[]>;
export declare function combineLatestAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
export declare function combineLatestAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;

export declare function combineLatestWith<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, Cons<T, A>>;

export declare function concat<T, A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;
export declare function concat<T, A extends readonly unknown[]>(...sourcesAndScheduler: [...ObservableInputTuple<A>, SchedulerLike]): OperatorFunction<T, T | A[number]>;

export declare function concatAll<O extends ObservableInput<any>>(): OperatorFunction<O, ObservedValueOf<O>>;

export declare function concatMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
export declare function concatMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: undefined): OperatorFunction<T, ObservedValueOf<O>>;
export declare function concatMap<T, R, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;

export declare function concatMapTo<O extends ObservableInput<unknown>>(observable: O): OperatorFunction<any, ObservedValueOf<O>>;
export declare function concatMapTo<O extends ObservableInput<unknown>>(observable: O, resultSelector: undefined): OperatorFunction<any, ObservedValueOf<O>>;
export declare function concatMapTo<T, R, O extends ObservableInput<unknown>>(observable: O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;

export declare function concatWith<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;

export declare function connect<T, O extends ObservableInput<unknown>>(selector: (shared: Observable<T>) => O, config?: ConnectConfig<T>): OperatorFunction<T, ObservedValueOf<O>>;

export declare function count<T>(predicate?: (value: T, index: number) => boolean): OperatorFunction<T, number>;

export declare function debounce<T>(durationSelector: (value: T) => ObservableInput<any>): MonoTypeOperatorFunction<T>;

export declare function debounceTime<T>(dueTime: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function defaultIfEmpty<T, R>(defaultValue: R): OperatorFunction<T, T | R>;

export declare function delay<T>(due: number | Date, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function delayWhen<T>(delayDurationSelector: (value: T, index: number) => Observable<any>, subscriptionDelay: Observable<any>): MonoTypeOperatorFunction<T>;
export declare function delayWhen<T>(delayDurationSelector: (value: T, index: number) => Observable<any>): MonoTypeOperatorFunction<T>;

export declare function dematerialize<N extends ObservableNotification<any>>(): OperatorFunction<N, ValueFromNotification<N>>;

export declare function distinct<T, K>(keySelector?: (value: T) => K, flushes?: Observable<any>): MonoTypeOperatorFunction<T>;

export declare function distinctUntilChanged<T>(comparator?: (previous: T, current: T) => boolean): MonoTypeOperatorFunction<T>;
export declare function distinctUntilChanged<T, K>(comparator: (previous: K, current: K) => boolean, keySelector: (value: T) => K): MonoTypeOperatorFunction<T>;

export declare function distinctUntilKeyChanged<T>(key: keyof T): MonoTypeOperatorFunction<T>;
export declare function distinctUntilKeyChanged<T, K extends keyof T>(key: K, compare: (x: T[K], y: T[K]) => boolean): MonoTypeOperatorFunction<T>;

export declare function elementAt<T, D = T>(index: number, defaultValue?: D): OperatorFunction<T, T | D>;

export declare function endWith<T>(scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;
export declare function endWith<T, A extends unknown[] = T[]>(...valuesAndScheduler: [...A, SchedulerLike]): OperatorFunction<T, T | ValueFromArray<A>>;
export declare function endWith<T, A extends unknown[] = T[]>(...values: A): OperatorFunction<T, T | ValueFromArray<A>>;

export declare function every<T>(predicate: BooleanConstructor): OperatorFunction<T, Exclude<T, Falsy> extends never ? false : boolean>;
export declare function every<T>(predicate: BooleanConstructor, thisArg: any): OperatorFunction<T, Exclude<T, Falsy> extends never ? false : boolean>;
export declare function every<T, A>(predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean, thisArg: A): OperatorFunction<T, boolean>;
export declare function every<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, boolean>;

export declare const exhaust: typeof exhaustAll;

export declare function exhaustAll<O extends ObservableInput<any>>(): OperatorFunction<O, ObservedValueOf<O>>;

export declare function exhaustMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
export declare function exhaustMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: undefined): OperatorFunction<T, ObservedValueOf<O>>;
export declare function exhaustMap<T, I, R>(project: (value: T, index: number) => ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;

export declare function expand<T, O extends ObservableInput<unknown>>(project: (value: T, index: number) => O, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, ObservedValueOf<O>>;
export declare function expand<T, O extends ObservableInput<unknown>>(project: (value: T, index: number) => O, concurrent: number | undefined, scheduler: SchedulerLike): OperatorFunction<T, ObservedValueOf<O>>;

export declare function filter<T, S extends T, A>(predicate: (this: A, value: T, index: number) => value is S, thisArg: A): OperatorFunction<T, S>;
export declare function filter<T, S extends T>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
export declare function filter<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export declare function filter<T, A>(predicate: (this: A, value: T, index: number) => boolean, thisArg: A): MonoTypeOperatorFunction<T>;
export declare function filter<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;

export declare function finalize<T>(callback: () => void): MonoTypeOperatorFunction<T>;

export declare function find<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export declare function find<T, S extends T, A>(predicate: (this: A, value: T, index: number, source: Observable<T>) => value is S, thisArg: A): OperatorFunction<T, S | undefined>;
export declare function find<T, S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S): OperatorFunction<T, S | undefined>;
export declare function find<T, A>(predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean, thisArg: A): OperatorFunction<T, T | undefined>;
export declare function find<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, T | undefined>;

export declare function findIndex<T>(predicate: BooleanConstructor): OperatorFunction<T, T extends Falsy ? -1 : number>;
export declare function findIndex<T>(predicate: BooleanConstructor, thisArg: any): OperatorFunction<T, T extends Falsy ? -1 : number>;
export declare function findIndex<T, A>(predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean, thisArg: A): OperatorFunction<T, number>;
export declare function findIndex<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, number>;

export declare function first<T, D = T>(predicate?: null, defaultValue?: D): OperatorFunction<T, T | D>;
export declare function first<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export declare function first<T, D>(predicate: BooleanConstructor, defaultValue: D): OperatorFunction<T, TruthyTypesOf<T> | D>;
export declare function first<T, S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue?: S): OperatorFunction<T, S>;
export declare function first<T, S extends T, D>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue: D): OperatorFunction<T, S | D>;
export declare function first<T, D = T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>;

export declare const flatMap: typeof mergeMap;

export declare function groupBy<T, K>(key: (value: T) => K, options: BasicGroupByOptions<K, T>): OperatorFunction<T, GroupedObservable<K, T>>;
export declare function groupBy<T, K, E>(key: (value: T) => K, options: GroupByOptionsWithElement<K, E, T>): OperatorFunction<T, GroupedObservable<K, E>>;
export declare function groupBy<T, K extends T>(key: (value: T) => value is K): OperatorFunction<T, GroupedObservable<true, K> | GroupedObservable<false, Exclude<T, K>>>;
export declare function groupBy<T, K>(key: (value: T) => K): OperatorFunction<T, GroupedObservable<K, T>>;
export declare function groupBy<T, K>(key: (value: T) => K, element: void, duration: (grouped: GroupedObservable<K, T>) => Observable<any>): OperatorFunction<T, GroupedObservable<K, T>>;
export declare function groupBy<T, K, R>(key: (value: T) => K, element?: (value: T) => R, duration?: (grouped: GroupedObservable<K, R>) => Observable<any>): OperatorFunction<T, GroupedObservable<K, R>>;
export declare function groupBy<T, K, R>(key: (value: T) => K, element?: (value: T) => R, duration?: (grouped: GroupedObservable<K, R>) => Observable<any>, connector?: () => Subject<R>): OperatorFunction<T, GroupedObservable<K, R>>;

export declare function ignoreElements(): OperatorFunction<any, never>;

export declare function isEmpty<T>(): OperatorFunction<T, boolean>;

export declare function last<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export declare function last<T, D>(predicate: BooleanConstructor, defaultValue: D): OperatorFunction<T, TruthyTypesOf<T> | D>;
export declare function last<T, D = T>(predicate?: null, defaultValue?: D): OperatorFunction<T, T | D>;
export declare function last<T, S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue?: S): OperatorFunction<T, S>;
export declare function last<T, D = T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>;

export declare function map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R>;
export declare function map<T, R, A>(project: (this: A, value: T, index: number) => R, thisArg: A): OperatorFunction<T, R>;

export declare function mapTo<R>(value: R): OperatorFunction<any, R>;
export declare function mapTo<T, R>(value: R): OperatorFunction<T, R>;

export declare function materialize<T>(): OperatorFunction<T, Notification<T> & ObservableNotification<T>>;

export declare function max<T>(comparer?: (x: T, y: T) => number): MonoTypeOperatorFunction<T>;

export declare function merge<T, A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;
export declare function merge<T, A extends readonly unknown[]>(...sourcesAndConcurrency: [...ObservableInputTuple<A>, number]): OperatorFunction<T, T | A[number]>;
export declare function merge<T, A extends readonly unknown[]>(...sourcesAndScheduler: [...ObservableInputTuple<A>, SchedulerLike]): OperatorFunction<T, T | A[number]>;
export declare function merge<T, A extends readonly unknown[]>(...sourcesAndConcurrencyAndScheduler: [...ObservableInputTuple<A>, number, SchedulerLike]): OperatorFunction<T, T | A[number]>;

export declare function mergeAll<O extends ObservableInput<any>>(concurrent?: number): OperatorFunction<O, ObservedValueOf<O>>;

export declare function mergeMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
export declare function mergeMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: undefined, concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
export declare function mergeMap<T, R, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R, concurrent?: number): OperatorFunction<T, R>;

export declare function mergeMapTo<O extends ObservableInput<unknown>>(innerObservable: O, concurrent?: number): OperatorFunction<any, ObservedValueOf<O>>;
export declare function mergeMapTo<T, R, O extends ObservableInput<unknown>>(innerObservable: O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R, concurrent?: number): OperatorFunction<T, R>;

export declare function mergeScan<T, R>(accumulator: (acc: R, value: T, index: number) => ObservableInput<R>, seed: R, concurrent?: number): OperatorFunction<T, R>;

export declare function mergeWith<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;

export declare function min<T>(comparer?: (x: T, y: T) => number): MonoTypeOperatorFunction<T>;

export declare function multicast<T>(subject: Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
export declare function multicast<T, O extends ObservableInput<any>>(subject: Subject<T>, selector: (shared: Observable<T>) => O): OperatorFunction<T, ObservedValueOf<O>>;
export declare function multicast<T>(subjectFactory: () => Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
export declare function multicast<T, O extends ObservableInput<any>>(subjectFactory: () => Subject<T>, selector: (shared: Observable<T>) => O): OperatorFunction<T, ObservedValueOf<O>>;

export declare function observeOn<T>(scheduler: SchedulerLike, delay?: number): MonoTypeOperatorFunction<T>;

export declare function onErrorResumeNext<T, A extends readonly unknown[]>(sources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;
export declare function onErrorResumeNext<T, A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;

export declare function pairwise<T>(): OperatorFunction<T, [T, T]>;

export declare function partition<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): UnaryFunction<Observable<T>, [Observable<T>, Observable<T>]>;

export declare function pluck<T, K1 extends keyof T>(k1: K1): OperatorFunction<T, T[K1]>;
export declare function pluck<T, K1 extends keyof T, K2 extends keyof T[K1]>(k1: K1, k2: K2): OperatorFunction<T, T[K1][K2]>;
export declare function pluck<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(k1: K1, k2: K2, k3: K3): OperatorFunction<T, T[K1][K2][K3]>;
export declare function pluck<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(k1: K1, k2: K2, k3: K3, k4: K4): OperatorFunction<T, T[K1][K2][K3][K4]>;
export declare function pluck<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3], K5 extends keyof T[K1][K2][K3][K4]>(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5): OperatorFunction<T, T[K1][K2][K3][K4][K5]>;
export declare function pluck<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3], K5 extends keyof T[K1][K2][K3][K4], K6 extends keyof T[K1][K2][K3][K4][K5]>(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6): OperatorFunction<T, T[K1][K2][K3][K4][K5][K6]>;
export declare function pluck<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3], K5 extends keyof T[K1][K2][K3][K4], K6 extends keyof T[K1][K2][K3][K4][K5]>(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, ...rest: string[]): OperatorFunction<T, unknown>;
export declare function pluck<T>(...properties: string[]): OperatorFunction<T, unknown>;

export declare function publish<T>(): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
export declare function publish<T, O extends ObservableInput<any>>(selector: (shared: Observable<T>) => O): OperatorFunction<T, ObservedValueOf<O>>;

export declare function publishBehavior<T>(initialValue: T): UnaryFunction<Observable<T>, ConnectableObservable<T>>;

export declare function publishLast<T>(): UnaryFunction<Observable<T>, ConnectableObservable<T>>;

export declare function publishReplay<T>(bufferSize?: number, windowTime?: number, timestampProvider?: TimestampProvider): MonoTypeOperatorFunction<T>;
export declare function publishReplay<T, O extends ObservableInput<any>>(bufferSize: number | undefined, windowTime: number | undefined, selector: (shared: Observable<T>) => O, timestampProvider?: TimestampProvider): OperatorFunction<T, ObservedValueOf<O>>;
export declare function publishReplay<T, O extends ObservableInput<any>>(bufferSize: number | undefined, windowTime: number | undefined, selector: undefined, timestampProvider: TimestampProvider): OperatorFunction<T, ObservedValueOf<O>>;

export declare function race<T, A extends readonly unknown[]>(otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;
export declare function race<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;

export declare function raceWith<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;

export declare function reduce<V, A = V>(accumulator: (acc: A | V, value: V, index: number) => A): OperatorFunction<V, V | A>;
export declare function reduce<V, A>(accumulator: (acc: A, value: V, index: number) => A, seed: A): OperatorFunction<V, A>;
export declare function reduce<V, A, S = A>(accumulator: (acc: A | S, value: V, index: number) => A, seed: S): OperatorFunction<V, A>;

export declare function refCount<T>(): MonoTypeOperatorFunction<T>;

export declare function repeat<T>(count?: number): MonoTypeOperatorFunction<T>;

export declare function repeatWhen<T>(notifier: (notifications: Observable<void>) => Observable<any>): MonoTypeOperatorFunction<T>;

export declare function retry<T>(count?: number): MonoTypeOperatorFunction<T>;
export declare function retry<T>(config: RetryConfig): MonoTypeOperatorFunction<T>;

export declare function retryWhen<T>(notifier: (errors: Observable<any>) => Observable<any>): MonoTypeOperatorFunction<T>;

export declare function sample<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T>;

export declare function sampleTime<T>(period: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function scan<V, A = V>(accumulator: (acc: A | V, value: V, index: number) => A): OperatorFunction<V, V | A>;
export declare function scan<V, A>(accumulator: (acc: A, value: V, index: number) => A, seed: A): OperatorFunction<V, A>;
export declare function scan<V, A, S>(accumulator: (acc: A | S, value: V, index: number) => A, seed: S): OperatorFunction<V, A>;

export declare function sequenceEqual<T>(compareTo: Observable<T>, comparator?: (a: T, b: T) => boolean): OperatorFunction<T, boolean>;

export declare function share<T>(): MonoTypeOperatorFunction<T>;
export declare function share<T>(options: ShareConfig<T>): MonoTypeOperatorFunction<T>;

export declare function shareReplay<T>(config: ShareReplayConfig): MonoTypeOperatorFunction<T>;
export declare function shareReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function single<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export declare function single<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): MonoTypeOperatorFunction<T>;

export declare function skip<T>(count: number): MonoTypeOperatorFunction<T>;

export declare function skipLast<T>(skipCount: number): MonoTypeOperatorFunction<T>;

export declare function skipUntil<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T>;

export declare function skipWhile<T>(predicate: BooleanConstructor): OperatorFunction<T, Extract<T, Falsy> extends never ? never : T>;
export declare function skipWhile<T>(predicate: (value: T, index: number) => true): OperatorFunction<T, never>;
export declare function skipWhile<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;

export declare function startWith<T>(value: null): OperatorFunction<T, T | null>;
export declare function startWith<T>(value: undefined): OperatorFunction<T, T | undefined>;
export declare function startWith<T, A extends readonly unknown[] = T[]>(...valuesAndScheduler: [...A, SchedulerLike]): OperatorFunction<T, T | ValueFromArray<A>>;
export declare function startWith<T, A extends readonly unknown[] = T[]>(...values: A): OperatorFunction<T, T | ValueFromArray<A>>;

export declare function subscribeOn<T>(scheduler: SchedulerLike, delay?: number): MonoTypeOperatorFunction<T>;

export declare function switchAll<O extends ObservableInput<any>>(): OperatorFunction<O, ObservedValueOf<O>>;

export declare function switchMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
export declare function switchMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: undefined): OperatorFunction<T, ObservedValueOf<O>>;
export declare function switchMap<T, R, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;

export declare function switchMapTo<O extends ObservableInput<unknown>>(observable: O): OperatorFunction<any, ObservedValueOf<O>>;
export declare function switchMapTo<O extends ObservableInput<unknown>>(observable: O, resultSelector: undefined): OperatorFunction<any, ObservedValueOf<O>>;
export declare function switchMapTo<T, R, O extends ObservableInput<unknown>>(observable: O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;

export declare function switchScan<T, R, O extends ObservableInput<any>>(accumulator: (acc: R, value: T, index: number) => O, seed: R): OperatorFunction<T, ObservedValueOf<O>>;

export declare function take<T>(count: number): MonoTypeOperatorFunction<T>;

export declare function takeLast<T>(count: number): MonoTypeOperatorFunction<T>;

export declare function takeUntil<T>(notifier: ObservableInput<any>): MonoTypeOperatorFunction<T>;

export declare function takeWhile<T>(predicate: BooleanConstructor, inclusive: true): MonoTypeOperatorFunction<T>;
export declare function takeWhile<T>(predicate: BooleanConstructor, inclusive: false): OperatorFunction<T, TruthyTypesOf<T>>;
export declare function takeWhile<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export declare function takeWhile<T, S extends T>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
export declare function takeWhile<T, S extends T>(predicate: (value: T, index: number) => value is S, inclusive: false): OperatorFunction<T, S>;
export declare function takeWhile<T>(predicate: (value: T, index: number) => boolean, inclusive?: boolean): MonoTypeOperatorFunction<T>;

export declare function tap<T>(observer?: Partial<TapObserver<T>>): MonoTypeOperatorFunction<T>;
export declare function tap<T>(next: (value: T) => void): MonoTypeOperatorFunction<T>;
export declare function tap<T>(next?: ((value: T) => void) | null, error?: ((error: any) => void) | null, complete?: (() => void) | null): MonoTypeOperatorFunction<T>;

export declare function throttle<T>(durationSelector: (value: T) => ObservableInput<any>, { leading, trailing }?: ThrottleConfig): MonoTypeOperatorFunction<T>;

export declare function throttleTime<T>(duration: number, scheduler?: SchedulerLike, config?: import("./throttle").ThrottleConfig): MonoTypeOperatorFunction<T>;

export declare function throwIfEmpty<T>(errorFactory?: () => any): MonoTypeOperatorFunction<T>;

export declare function timeInterval<T>(scheduler?: SchedulerLike): OperatorFunction<T, TimeInterval<T>>;

export declare function timeout<T, O extends ObservableInput<unknown>, M = unknown>(config: TimeoutConfig<T, O, M> & {
    with: (info: TimeoutInfo<T, M>) => O;
}): OperatorFunction<T, T | ObservedValueOf<O>>;
export declare function timeout<T, M = unknown>(config: Omit<TimeoutConfig<T, any, M>, 'with'>): OperatorFunction<T, T>;
export declare function timeout<T>(first: Date, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
export declare function timeout<T>(each: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function timeoutWith<T, R>(dueBy: Date, switchTo: ObservableInput<R>, scheduler?: SchedulerLike): OperatorFunction<T, T | R>;
export declare function timeoutWith<T, R>(waitFor: number, switchTo: ObservableInput<R>, scheduler?: SchedulerLike): OperatorFunction<T, T | R>;

export declare function timestamp<T>(timestampProvider?: TimestampProvider): OperatorFunction<T, Timestamp<T>>;

export declare function toArray<T>(): OperatorFunction<T, T[]>;

export declare function window<T>(windowBoundaries: Observable<any>): OperatorFunction<T, Observable<T>>;

export declare function windowCount<T>(windowSize: number, startWindowEvery?: number): OperatorFunction<T, Observable<T>>;

export declare function windowTime<T>(windowTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
export declare function windowTime<T>(windowTimeSpan: number, windowCreationInterval: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
export declare function windowTime<T>(windowTimeSpan: number, windowCreationInterval: number | null | void, maxWindowSize: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;

export declare function windowToggle<T, O>(openings: ObservableInput<O>, closingSelector: (openValue: O) => ObservableInput<any>): OperatorFunction<T, Observable<T>>;

export declare function windowWhen<T>(closingSelector: () => ObservableInput<any>): OperatorFunction<T, Observable<T>>;

export declare function withLatestFrom<T, O extends unknown[]>(...inputs: [...ObservableInputTuple<O>]): OperatorFunction<T, [T, ...O]>;
export declare function withLatestFrom<T, O extends unknown[], R>(...inputs: [...ObservableInputTuple<O>, (...value: [T, ...O]) => R]): OperatorFunction<T, R>;

export declare function zip<T, A extends readonly unknown[]>(otherInputs: [...ObservableInputTuple<A>]): OperatorFunction<T, Cons<T, A>>;
export declare function zip<T, A extends readonly unknown[], R>(otherInputsAndProject: [...ObservableInputTuple<A>], project: (...values: Cons<T, A>) => R): OperatorFunction<T, R>;
export declare function zip<T, A extends readonly unknown[]>(...otherInputs: [...ObservableInputTuple<A>]): OperatorFunction<T, Cons<T, A>>;
export declare function zip<T, A extends readonly unknown[], R>(...otherInputsAndProject: [...ObservableInputTuple<A>, (...values: Cons<T, A>) => R]): OperatorFunction<T, R>;

export declare function zipAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
export declare function zipAll<T>(): OperatorFunction<any, T[]>;
export declare function zipAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
export declare function zipAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;

export declare function zipWith<T, A extends readonly unknown[]>(...otherInputs: [...ObservableInputTuple<A>]): OperatorFunction<T, Cons<T, A>>;
