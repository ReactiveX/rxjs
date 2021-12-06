export declare const animationFrame: AnimationFrameScheduler;

export declare function animationFrames(timestampProvider?: TimestampProvider): Observable<{
    timestamp: number;
    elapsed: number;
}>;

export declare const animationFrameScheduler: AnimationFrameScheduler;

export interface ArgumentOutOfRangeError extends Error {
}

export declare const ArgumentOutOfRangeError: ArgumentOutOfRangeErrorCtor;

export declare const asap: AsapScheduler;

export declare const asapScheduler: AsapScheduler;

export declare const async: AsyncScheduler;

export declare const asyncScheduler: AsyncScheduler;

export declare class AsyncSubject<T> extends Subject<T> {
    complete(): void;
    next(value: T): void;
}

export declare function audit<T>(durationSelector: (value: T) => ObservableInput<any>): MonoTypeOperatorFunction<T>;

export declare function auditTime<T>(duration: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare class BehaviorSubject<T> extends Subject<T> {
    get value(): T;
    constructor(_value: T);
    getValue(): T;
    next(value: T): void;
}

export declare function bindCallback(callbackFunc: (...args: any[]) => void, resultSelector: (...args: any[]) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any>;
export declare function bindCallback<A extends readonly unknown[], R extends readonly unknown[]>(callbackFunc: (...args: [...A, (...res: R) => void]) => void, schedulerLike?: SchedulerLike): (...arg: A) => Observable<R extends [] ? void : R extends [any] ? R[0] : R>;

export declare function bindNodeCallback(callbackFunc: (...args: any[]) => void, resultSelector: (...args: any[]) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any>;
export declare function bindNodeCallback<A extends readonly unknown[], R extends readonly unknown[]>(callbackFunc: (...args: [...A, (err: any, ...res: R) => void]) => void, schedulerLike?: SchedulerLike): (...arg: A) => Observable<R extends [] ? void : R extends [any] ? R[0] : R>;

export declare function buffer<T>(closingNotifier: Observable<any>): OperatorFunction<T, T[]>;

export declare function bufferCount<T>(bufferSize: number, startBufferEvery?: number | null): OperatorFunction<T, T[]>;

export declare function bufferTime<T>(bufferTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
export declare function bufferTime<T>(bufferTimeSpan: number, bufferCreationInterval: number | null | undefined, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
export declare function bufferTime<T>(bufferTimeSpan: number, bufferCreationInterval: number | null | undefined, maxBufferSize: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;

export declare function bufferToggle<T, O>(openings: ObservableInput<O>, closingSelector: (value: O) => ObservableInput<any>): OperatorFunction<T, T[]>;

export declare function bufferWhen<T>(closingSelector: () => ObservableInput<any>): OperatorFunction<T, T[]>;

export declare function catchError<T, O extends ObservableInput<any>>(selector: (err: any, caught: Observable<T>) => O): OperatorFunction<T, T | ObservedValueOf<O>>;

export declare const combineAll: typeof combineLatestAll;

export declare function combineLatest<T extends AnyCatcher>(arg: T): Observable<unknown>;
export declare function combineLatest(sources: []): Observable<never>;
export declare function combineLatest<A extends readonly unknown[]>(sources: readonly [...ObservableInputTuple<A>]): Observable<A>;
export declare function combineLatest<A extends readonly unknown[], R>(sources: readonly [...ObservableInputTuple<A>], resultSelector: (...values: A) => R, scheduler: SchedulerLike): Observable<R>;
export declare function combineLatest<A extends readonly unknown[], R>(sources: readonly [...ObservableInputTuple<A>], resultSelector: (...values: A) => R): Observable<R>;
export declare function combineLatest<A extends readonly unknown[]>(sources: readonly [...ObservableInputTuple<A>], scheduler: SchedulerLike): Observable<A>;
export declare function combineLatest<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A>;
export declare function combineLatest<A extends readonly unknown[], R>(...sourcesAndResultSelectorAndScheduler: [...ObservableInputTuple<A>, (...values: A) => R, SchedulerLike]): Observable<R>;
export declare function combineLatest<A extends readonly unknown[], R>(...sourcesAndResultSelector: [...ObservableInputTuple<A>, (...values: A) => R]): Observable<R>;
export declare function combineLatest<A extends readonly unknown[]>(...sourcesAndScheduler: [...ObservableInputTuple<A>, SchedulerLike]): Observable<A>;
export declare function combineLatest(sourcesObject: {
    [K in any]: never;
}): Observable<never>;
export declare function combineLatest<T extends Record<string, ObservableInput<any>>>(sourcesObject: T): Observable<{
    [K in keyof T]: ObservedValueOf<T[K]>;
}>;

export declare function combineLatestAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
export declare function combineLatestAll<T>(): OperatorFunction<any, T[]>;
export declare function combineLatestAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
export declare function combineLatestAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;

export declare function combineLatestWith<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, Cons<T, A>>;

export interface CompleteNotification {
    kind: 'C';
}

export interface CompletionObserver<T> {
    closed?: boolean;
    complete: () => void;
    error?: (err: any) => void;
    next?: (value: T) => void;
}

export declare function concat<T extends readonly unknown[]>(...inputs: [...ObservableInputTuple<T>]): Observable<T[number]>;
export declare function concat<T extends readonly unknown[]>(...inputsAndScheduler: [...ObservableInputTuple<T>, SchedulerLike]): Observable<T[number]>;

export declare function concatAll<O extends ObservableInput<any>>(): OperatorFunction<O, ObservedValueOf<O>>;

export declare function concatMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
export declare function concatMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: undefined): OperatorFunction<T, ObservedValueOf<O>>;
export declare function concatMap<T, R, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;

export declare function concatMapTo<O extends ObservableInput<unknown>>(observable: O): OperatorFunction<any, ObservedValueOf<O>>;
export declare function concatMapTo<O extends ObservableInput<unknown>>(observable: O, resultSelector: undefined): OperatorFunction<any, ObservedValueOf<O>>;
export declare function concatMapTo<T, R, O extends ObservableInput<unknown>>(observable: O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;

export declare function concatWith<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;

export declare const config: GlobalConfig;

export declare function connect<T, O extends ObservableInput<unknown>>(selector: (shared: Observable<T>) => O, config?: ConnectConfig<T>): OperatorFunction<T, ObservedValueOf<O>>;

export declare function connectable<T>(source: ObservableInput<T>, config?: ConnectableConfig<T>): Connectable<T>;

export interface Connectable<T> extends Observable<T> {
    connect(): Subscription;
}

export declare class ConnectableObservable<T> extends Observable<T> {
    protected _connection: Subscription | null;
    protected _refCount: number;
    protected _subject: Subject<T> | null;
    source: Observable<T>;
    protected subjectFactory: () => Subject<T>;
    constructor(source: Observable<T>, subjectFactory: () => Subject<T>);
    protected _teardown(): void;
    connect(): Subscription;
    protected getSubject(): Subject<T>;
    refCount(): Observable<T>;
}

export declare type Cons<X, Y extends readonly any[]> = ((arg: X, ...rest: Y) => any) extends (...args: infer U) => any ? U : never;

export declare function count<T>(predicate?: (value: T, index: number) => boolean): OperatorFunction<T, number>;

export declare function debounce<T>(durationSelector: (value: T) => ObservableInput<any>): MonoTypeOperatorFunction<T>;

export declare function debounceTime<T>(dueTime: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function defaultIfEmpty<T, R>(defaultValue: R): OperatorFunction<T, T | R>;

export declare function defer<R extends ObservableInput<any>>(observableFactory: () => R): Observable<ObservedValueOf<R>>;

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

export declare function empty(scheduler?: SchedulerLike): Observable<never>;

export declare const EMPTY: Observable<never>;

export interface EmptyError extends Error {
}

export declare const EmptyError: EmptyErrorCtor;

export declare function endWith<T>(scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;
export declare function endWith<T, A extends unknown[] = T[]>(...valuesAndScheduler: [...A, SchedulerLike]): OperatorFunction<T, T | ValueFromArray<A>>;
export declare function endWith<T, A extends unknown[] = T[]>(...values: A): OperatorFunction<T, T | ValueFromArray<A>>;

export interface ErrorNotification {
    error: any;
    kind: 'E';
}

export interface ErrorObserver<T> {
    closed?: boolean;
    complete?: () => void;
    error: (err: any) => void;
    next?: (value: T) => void;
}

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

export declare type FactoryOrValue<T> = T | (() => T);

export declare type Falsy = null | undefined | false | 0 | -0 | 0n | '';

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

export declare function firstValueFrom<T, D>(source: Observable<T>, config: FirstValueFromConfig<D>): Promise<T | D>;
export declare function firstValueFrom<T>(source: Observable<T>): Promise<T>;

export declare const flatMap: typeof mergeMap;

export declare function forkJoin<T extends AnyCatcher>(arg: T): Observable<unknown>;
export declare function forkJoin(scheduler: null | undefined): Observable<never>;
export declare function forkJoin(sources: readonly []): Observable<never>;
export declare function forkJoin<A extends readonly unknown[]>(sources: readonly [...ObservableInputTuple<A>]): Observable<A>;
export declare function forkJoin<A extends readonly unknown[], R>(sources: readonly [...ObservableInputTuple<A>], resultSelector: (...values: A) => R): Observable<R>;
export declare function forkJoin<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A>;
export declare function forkJoin<A extends readonly unknown[], R>(...sourcesAndResultSelector: [...ObservableInputTuple<A>, (...values: A) => R]): Observable<R>;
export declare function forkJoin(sourcesObject: {
    [K in any]: never;
}): Observable<never>;
export declare function forkJoin<T extends Record<string, ObservableInput<any>>>(sourcesObject: T): Observable<{
    [K in keyof T]: ObservedValueOf<T[K]>;
}>;

export declare function from<O extends ObservableInput<any>>(input: O): Observable<ObservedValueOf<O>>;
export declare function from<O extends ObservableInput<any>>(input: O, scheduler: SchedulerLike | undefined): Observable<ObservedValueOf<O>>;

export declare function fromEvent<T>(target: HasEventTargetAddRemove<T> | ArrayLike<HasEventTargetAddRemove<T>>, eventName: string): Observable<T>;
export declare function fromEvent<T, R>(target: HasEventTargetAddRemove<T> | ArrayLike<HasEventTargetAddRemove<T>>, eventName: string, resultSelector: (event: T) => R): Observable<R>;
export declare function fromEvent<T>(target: HasEventTargetAddRemove<T> | ArrayLike<HasEventTargetAddRemove<T>>, eventName: string, options: EventListenerOptions): Observable<T>;
export declare function fromEvent<T, R>(target: HasEventTargetAddRemove<T> | ArrayLike<HasEventTargetAddRemove<T>>, eventName: string, options: EventListenerOptions, resultSelector: (event: T) => R): Observable<R>;
export declare function fromEvent(target: NodeStyleEventEmitter | ArrayLike<NodeStyleEventEmitter>, eventName: string): Observable<unknown>;
export declare function fromEvent<T>(target: NodeStyleEventEmitter | ArrayLike<NodeStyleEventEmitter>, eventName: string): Observable<T>;
export declare function fromEvent<R>(target: NodeStyleEventEmitter | ArrayLike<NodeStyleEventEmitter>, eventName: string, resultSelector: (...args: any[]) => R): Observable<R>;
export declare function fromEvent(target: NodeCompatibleEventEmitter | ArrayLike<NodeCompatibleEventEmitter>, eventName: string): Observable<unknown>;
export declare function fromEvent<T>(target: NodeCompatibleEventEmitter | ArrayLike<NodeCompatibleEventEmitter>, eventName: string): Observable<T>;
export declare function fromEvent<R>(target: NodeCompatibleEventEmitter | ArrayLike<NodeCompatibleEventEmitter>, eventName: string, resultSelector: (...args: any[]) => R): Observable<R>;
export declare function fromEvent<T>(target: JQueryStyleEventEmitter<any, T> | ArrayLike<JQueryStyleEventEmitter<any, T>>, eventName: string): Observable<T>;
export declare function fromEvent<T, R>(target: JQueryStyleEventEmitter<any, T> | ArrayLike<JQueryStyleEventEmitter<any, T>>, eventName: string, resultSelector: (value: T, ...args: any[]) => R): Observable<R>;

export declare function fromEventPattern<T>(addHandler: (handler: NodeEventHandler) => any, removeHandler?: (handler: NodeEventHandler, signal?: any) => void): Observable<T>;
export declare function fromEventPattern<T>(addHandler: (handler: NodeEventHandler) => any, removeHandler?: (handler: NodeEventHandler, signal?: any) => void, resultSelector?: (...args: any[]) => T): Observable<T>;

export declare function generate<T, S>(initialState: S, condition: ConditionFunc<S>, iterate: IterateFunc<S>, resultSelector: ResultFunc<S, T>, scheduler?: SchedulerLike): Observable<T>;
export declare function generate<S>(initialState: S, condition: ConditionFunc<S>, iterate: IterateFunc<S>, scheduler?: SchedulerLike): Observable<S>;
export declare function generate<S>(options: GenerateBaseOptions<S>): Observable<S>;
export declare function generate<T, S>(options: GenerateOptions<T, S>): Observable<T>;

export interface GlobalConfig {
    Promise?: PromiseConstructorLike;
    onStoppedNotification: ((notification: ObservableNotification<any>, subscriber: Subscriber<any>) => void) | null;
    onUnhandledError: ((err: any) => void) | null;
    useDeprecatedNextContext: boolean;
    useDeprecatedSynchronousErrorHandling: boolean;
}

export declare function groupBy<T, K>(key: (value: T) => K, options: BasicGroupByOptions<K, T>): OperatorFunction<T, GroupedObservable<K, T>>;
export declare function groupBy<T, K, E>(key: (value: T) => K, options: GroupByOptionsWithElement<K, E, T>): OperatorFunction<T, GroupedObservable<K, E>>;
export declare function groupBy<T, K extends T>(key: (value: T) => value is K): OperatorFunction<T, GroupedObservable<true, K> | GroupedObservable<false, Exclude<T, K>>>;
export declare function groupBy<T, K>(key: (value: T) => K): OperatorFunction<T, GroupedObservable<K, T>>;
export declare function groupBy<T, K>(key: (value: T) => K, element: void, duration: (grouped: GroupedObservable<K, T>) => Observable<any>): OperatorFunction<T, GroupedObservable<K, T>>;
export declare function groupBy<T, K, R>(key: (value: T) => K, element?: (value: T) => R, duration?: (grouped: GroupedObservable<K, R>) => Observable<any>): OperatorFunction<T, GroupedObservable<K, R>>;
export declare function groupBy<T, K, R>(key: (value: T) => K, element?: (value: T) => R, duration?: (grouped: GroupedObservable<K, R>) => Observable<any>, connector?: () => Subject<R>): OperatorFunction<T, GroupedObservable<K, R>>;

export interface GroupedObservable<K, T> extends Observable<T> {
    readonly key: K;
}

export declare type Head<X extends readonly any[]> = ((...args: X) => any) extends (arg: infer U, ...rest: any[]) => any ? U : never;

export declare function identity<T>(x: T): T;

export declare function ignoreElements(): OperatorFunction<any, never>;

export declare function iif<T, F>(condition: () => boolean, trueResult: ObservableInput<T>, falseResult: ObservableInput<F>): Observable<T | F>;

export interface InteropObservable<T> {
    [Symbol.observable]: () => Subscribable<T>;
}

export declare function interval(period?: number, scheduler?: SchedulerLike): Observable<number>;

export declare function isEmpty<T>(): OperatorFunction<T, boolean>;

export declare function isObservable(obj: any): obj is Observable<unknown>;

export declare function last<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export declare function last<T, D>(predicate: BooleanConstructor, defaultValue: D): OperatorFunction<T, TruthyTypesOf<T> | D>;
export declare function last<T, D = T>(predicate?: null, defaultValue?: D): OperatorFunction<T, T | D>;
export declare function last<T, S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue?: S): OperatorFunction<T, S>;
export declare function last<T, D = T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>;

export declare function lastValueFrom<T, D>(source: Observable<T>, config: LastValueFromConfig<D>): Promise<T | D>;
export declare function lastValueFrom<T>(source: Observable<T>): Promise<T>;

export declare function map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R>;
export declare function map<T, R, A>(project: (this: A, value: T, index: number) => R, thisArg: A): OperatorFunction<T, R>;

export declare function mapTo<R>(value: R): OperatorFunction<any, R>;
export declare function mapTo<T, R>(value: R): OperatorFunction<T, R>;

export declare function materialize<T>(): OperatorFunction<T, Notification<T> & ObservableNotification<T>>;

export declare function max<T>(comparer?: (x: T, y: T) => number): MonoTypeOperatorFunction<T>;

export declare function merge<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A[number]>;
export declare function merge<A extends readonly unknown[]>(...sourcesAndConcurrency: [...ObservableInputTuple<A>, number?]): Observable<A[number]>;
export declare function merge<A extends readonly unknown[]>(...sourcesAndScheduler: [...ObservableInputTuple<A>, SchedulerLike?]): Observable<A[number]>;
export declare function merge<A extends readonly unknown[]>(...sourcesAndConcurrencyAndScheduler: [...ObservableInputTuple<A>, number?, SchedulerLike?]): Observable<A[number]>;

export declare function mergeAll<O extends ObservableInput<any>>(concurrent?: number): OperatorFunction<O, ObservedValueOf<O>>;

export declare function mergeMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
export declare function mergeMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: undefined, concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
export declare function mergeMap<T, R, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R, concurrent?: number): OperatorFunction<T, R>;

export declare function mergeMapTo<O extends ObservableInput<unknown>>(innerObservable: O, concurrent?: number): OperatorFunction<any, ObservedValueOf<O>>;
export declare function mergeMapTo<T, R, O extends ObservableInput<unknown>>(innerObservable: O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R, concurrent?: number): OperatorFunction<T, R>;

export declare function mergeScan<T, R>(accumulator: (acc: R, value: T, index: number) => ObservableInput<R>, seed: R, concurrent?: number): OperatorFunction<T, R>;

export declare function mergeWith<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;

export declare function min<T>(comparer?: (x: T, y: T) => number): MonoTypeOperatorFunction<T>;

export interface MonoTypeOperatorFunction<T> extends OperatorFunction<T, T> {
}

export declare function multicast<T>(subject: Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
export declare function multicast<T, O extends ObservableInput<any>>(subject: Subject<T>, selector: (shared: Observable<T>) => O): OperatorFunction<T, ObservedValueOf<O>>;
export declare function multicast<T>(subjectFactory: () => Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
export declare function multicast<T, O extends ObservableInput<any>>(subjectFactory: () => Subject<T>, selector: (shared: Observable<T>) => O): OperatorFunction<T, ObservedValueOf<O>>;

export declare function never(): Observable<never>;

export declare const NEVER: Observable<never>;

export interface NextNotification<T> {
    kind: 'N';
    value: T;
}

export interface NextObserver<T> {
    closed?: boolean;
    complete?: () => void;
    error?: (err: any) => void;
    next: (value: T) => void;
}

export declare function noop(): void;

export interface NotFoundError extends Error {
}

export declare const NotFoundError: NotFoundErrorCtor;

export declare class Notification<T> {
    readonly error?: any;
    readonly hasValue: boolean;
    readonly kind: 'N' | 'E' | 'C';
    readonly value?: T | undefined;
    constructor(kind: 'C');
    constructor(kind: 'E', value: undefined, error: any);
    constructor(kind: 'N', value?: T);
    accept(next: (value: T) => void, error: (err: any) => void, complete: () => void): void;
    accept(next: (value: T) => void, error: (err: any) => void): void;
    accept(next: (value: T) => void): void;
    accept(observer: PartialObserver<T>): void;
    do(next: (value: T) => void, error: (err: any) => void, complete: () => void): void;
    do(next: (value: T) => void, error: (err: any) => void): void;
    do(next: (value: T) => void): void;
    observe(observer: PartialObserver<T>): void;
    toObservable(): Observable<T>;
    static createComplete(): Notification<never> & CompleteNotification;
    static createError(err?: any): Notification<never> & ErrorNotification;
    static createNext<T>(value: T): Notification<T> & NextNotification<T>;
}

export declare enum NotificationKind {
    NEXT = "N",
    ERROR = "E",
    COMPLETE = "C"
}

export interface ObjectUnsubscribedError extends Error {
}

export declare const ObjectUnsubscribedError: ObjectUnsubscribedErrorCtor;

export declare const observable: string | symbol;

export declare class Observable<T> implements Subscribable<T> {
    operator: Operator<any, T> | undefined;
    source: Observable<any> | undefined;
    constructor(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic);
    forEach(next: (value: T) => void): Promise<void>;
    forEach(next: (value: T) => void, promiseCtor: PromiseConstructorLike): Promise<void>;
    lift<R>(operator?: Operator<T, R>): Observable<R>;
    pipe(): Observable<T>;
    pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
    pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
    pipe<A, B, C>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
    pipe<A, B, C, D>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>): Observable<D>;
    pipe<A, B, C, D, E>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>): Observable<E>;
    pipe<A, B, C, D, E, F>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>): Observable<F>;
    pipe<A, B, C, D, E, F, G>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>): Observable<G>;
    pipe<A, B, C, D, E, F, G, H>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>): Observable<H>;
    pipe<A, B, C, D, E, F, G, H, I>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, I>): Observable<I>;
    pipe<A, B, C, D, E, F, G, H, I>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, I>, ...operations: OperatorFunction<any, any>[]): Observable<unknown>;
    subscribe(observer?: Partial<Observer<T>>): Subscription;
    subscribe(next: (value: T) => void): Subscription;
    subscribe(next?: ((value: T) => void) | null, error?: ((error: any) => void) | null, complete?: (() => void) | null): Subscription;
    toPromise(): Promise<T | undefined>;
    toPromise(PromiseCtor: typeof Promise): Promise<T | undefined>;
    toPromise(PromiseCtor: PromiseConstructorLike): Promise<T | undefined>;
    static create: (...args: any[]) => any;
}

export declare type ObservableInput<T> = Observable<T> | InteropObservable<T> | AsyncIterable<T> | PromiseLike<T> | ArrayLike<T> | Iterable<T> | ReadableStreamLike<T>;

export declare type ObservableInputTuple<T> = {
    [K in keyof T]: ObservableInput<T[K]>;
};

export declare type ObservableLike<T> = InteropObservable<T>;

export declare type ObservableNotification<T> = NextNotification<T> | ErrorNotification | CompleteNotification;

export declare type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never;

export declare type ObservedValuesFromArray<X> = ObservedValueUnionFromArray<X>;

export declare type ObservedValueTupleFromArray<X> = {
    [K in keyof X]: ObservedValueOf<X[K]>;
};

export declare type ObservedValueUnionFromArray<X> = X extends Array<ObservableInput<infer T>> ? T : never;

export declare function observeOn<T>(scheduler: SchedulerLike, delay?: number): MonoTypeOperatorFunction<T>;

export interface Observer<T> {
    complete: () => void;
    error: (err: any) => void;
    next: (value: T) => void;
}

export declare function of(value: null): Observable<null>;
export declare function of(value: undefined): Observable<undefined>;
export declare function of(scheduler: SchedulerLike): Observable<never>;
export declare function of<A extends readonly unknown[]>(...valuesAndScheduler: [...A, SchedulerLike]): Observable<ValueFromArray<A>>;
export declare function of(): Observable<never>;
export declare function of<T>(): Observable<T>;
export declare function of<T>(value: T): Observable<T>;
export declare function of<A extends readonly unknown[]>(...values: A): Observable<ValueFromArray<A>>;

export declare function onErrorResumeNext<A extends readonly unknown[]>(sources: [...ObservableInputTuple<A>]): Observable<A[number]>;
export declare function onErrorResumeNext<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A[number]>;

export interface Operator<T, R> {
    call(subscriber: Subscriber<R>, source: any): TeardownLogic;
}

export interface OperatorFunction<T, R> extends UnaryFunction<Observable<T>, Observable<R>> {
}

export declare function pairs<T>(arr: readonly T[], scheduler?: SchedulerLike): Observable<[string, T]>;
export declare function pairs<O extends Record<string, unknown>>(obj: O, scheduler?: SchedulerLike): Observable<[keyof O, O[keyof O]]>;
export declare function pairs<T>(iterable: Iterable<T>, scheduler?: SchedulerLike): Observable<[string, T]>;
export declare function pairs(n: number | bigint | boolean | ((...args: any[]) => any) | symbol, scheduler?: SchedulerLike): Observable<[never, never]>;

export declare function pairwise<T>(): OperatorFunction<T, [T, T]>;

export declare type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompletionObserver<T>;

export declare function partition<T, U extends T, A>(source: ObservableInput<T>, predicate: (this: A, value: T, index: number) => value is U, thisArg: A): [Observable<U>, Observable<Exclude<T, U>>];
export declare function partition<T, U extends T>(source: ObservableInput<T>, predicate: (value: T, index: number) => value is U): [Observable<U>, Observable<Exclude<T, U>>];
export declare function partition<T, A>(source: ObservableInput<T>, predicate: (this: A, value: T, index: number) => boolean, thisArg: A): [Observable<T>, Observable<T>];
export declare function partition<T>(source: ObservableInput<T>, predicate: (value: T, index: number) => boolean): [Observable<T>, Observable<T>];

export declare function pipe(): typeof identity;
export declare function pipe<T, A>(fn1: UnaryFunction<T, A>): UnaryFunction<T, A>;
export declare function pipe<T, A, B>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>): UnaryFunction<T, B>;
export declare function pipe<T, A, B, C>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>): UnaryFunction<T, C>;
export declare function pipe<T, A, B, C, D>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>): UnaryFunction<T, D>;
export declare function pipe<T, A, B, C, D, E>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>): UnaryFunction<T, E>;
export declare function pipe<T, A, B, C, D, E, F>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>): UnaryFunction<T, F>;
export declare function pipe<T, A, B, C, D, E, F, G>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>, fn7: UnaryFunction<F, G>): UnaryFunction<T, G>;
export declare function pipe<T, A, B, C, D, E, F, G, H>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>, fn7: UnaryFunction<F, G>, fn8: UnaryFunction<G, H>): UnaryFunction<T, H>;
export declare function pipe<T, A, B, C, D, E, F, G, H, I>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>, fn7: UnaryFunction<F, G>, fn8: UnaryFunction<G, H>, fn9: UnaryFunction<H, I>): UnaryFunction<T, I>;
export declare function pipe<T, A, B, C, D, E, F, G, H, I>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>, fn7: UnaryFunction<F, G>, fn8: UnaryFunction<G, H>, fn9: UnaryFunction<H, I>, ...fns: UnaryFunction<any, any>[]): UnaryFunction<T, unknown>;

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

export declare const queue: QueueScheduler;

export declare const queueScheduler: QueueScheduler;

export declare function race<T extends readonly unknown[]>(inputs: [...ObservableInputTuple<T>]): Observable<T[number]>;
export declare function race<T extends readonly unknown[]>(...inputs: [...ObservableInputTuple<T>]): Observable<T[number]>;

export declare function raceWith<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;

export declare function range(start: number, count?: number): Observable<number>;
export declare function range(start: number, count: number | undefined, scheduler: SchedulerLike): Observable<number>;

export interface ReadableStreamLike<T> {
    getReader(): ReadableStreamDefaultReaderLike<T>;
}

export declare function reduce<V, A = V>(accumulator: (acc: A | V, value: V, index: number) => A): OperatorFunction<V, V | A>;
export declare function reduce<V, A>(accumulator: (acc: A, value: V, index: number) => A, seed: A): OperatorFunction<V, A>;
export declare function reduce<V, A, S = A>(accumulator: (acc: A | S, value: V, index: number) => A, seed: S): OperatorFunction<V, A>;

export declare function refCount<T>(): MonoTypeOperatorFunction<T>;

export declare function repeat<T>(count?: number): MonoTypeOperatorFunction<T>;

export declare function repeatWhen<T>(notifier: (notifications: Observable<void>) => Observable<any>): MonoTypeOperatorFunction<T>;

export declare class ReplaySubject<T> extends Subject<T> {
    constructor(_bufferSize?: number, _windowTime?: number, _timestampProvider?: TimestampProvider);
    next(value: T): void;
}

export declare function retry<T>(count?: number): MonoTypeOperatorFunction<T>;
export declare function retry<T>(config: RetryConfig): MonoTypeOperatorFunction<T>;

export declare function retryWhen<T>(notifier: (errors: Observable<any>) => Observable<any>): MonoTypeOperatorFunction<T>;

export declare function sample<T>(notifier: Observable<any>): MonoTypeOperatorFunction<T>;

export declare function sampleTime<T>(period: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export declare function scan<V, A = V>(accumulator: (acc: A | V, value: V, index: number) => A): OperatorFunction<V, V | A>;
export declare function scan<V, A>(accumulator: (acc: A, value: V, index: number) => A, seed: A): OperatorFunction<V, A>;
export declare function scan<V, A, S>(accumulator: (acc: A | S, value: V, index: number) => A, seed: S): OperatorFunction<V, A>;

export declare function scheduled<T>(input: ObservableInput<T>, scheduler: SchedulerLike): Observable<T>;

export declare class Scheduler implements SchedulerLike {
    now: () => number;
    constructor(schedulerActionCtor: typeof Action, now?: () => number);
    schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription;
    static now: () => number;
}

export interface SchedulerAction<T> extends Subscription {
    schedule(state?: T, delay?: number): Subscription;
}

export interface SchedulerLike extends TimestampProvider {
    schedule<T>(work: (this: SchedulerAction<T>, state: T) => void, delay: number, state: T): Subscription;
    schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay: number, state?: T): Subscription;
    schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription;
}

export declare function sequenceEqual<T>(compareTo: Observable<T>, comparator?: (a: T, b: T) => boolean): OperatorFunction<T, boolean>;

export interface SequenceError extends Error {
}

export declare const SequenceError: SequenceErrorCtor;

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

export declare class Subject<T> extends Observable<T> implements SubscriptionLike {
    closed: boolean;
    hasError: boolean;
    isStopped: boolean;
    get observed(): boolean;
    observers: Observer<T>[];
    thrownError: any;
    constructor();
    asObservable(): Observable<T>;
    complete(): void;
    error(err: any): void;
    lift<R>(operator: Operator<T, R>): Observable<R>;
    next(value: T): void;
    unsubscribe(): void;
    static create: (...args: any[]) => any;
}

export interface SubjectLike<T> extends Observer<T>, Subscribable<T> {
}

export interface Subscribable<T> {
    subscribe(observer: Partial<Observer<T>>): Unsubscribable;
}

export declare type SubscribableOrPromise<T> = Subscribable<T> | Subscribable<never> | PromiseLike<T> | InteropObservable<T>;

export declare function subscribeOn<T>(scheduler: SchedulerLike, delay?: number): MonoTypeOperatorFunction<T>;

export declare class Subscriber<T> extends Subscription implements Observer<T> {
    protected destination: Subscriber<any> | Observer<any>;
    protected isStopped: boolean;
    constructor(destination?: Subscriber<any> | Observer<any>);
    protected _complete(): void;
    protected _error(err: any): void;
    protected _next(value: T): void;
    complete(): void;
    error(err?: any): void;
    next(value?: T): void;
    unsubscribe(): void;
    static create<T>(next?: (x?: T) => void, error?: (e?: any) => void, complete?: () => void): Subscriber<T>;
}

export declare class Subscription implements SubscriptionLike {
    closed: boolean;
    constructor(initialTeardown?: (() => void) | undefined);
    add(teardown: TeardownLogic): void;
    remove(teardown: Exclude<TeardownLogic, void>): void;
    unsubscribe(): void;
    static EMPTY: Subscription;
}

export interface SubscriptionLike extends Unsubscribable {
    readonly closed: boolean;
    unsubscribe(): void;
}

export declare function switchAll<O extends ObservableInput<any>>(): OperatorFunction<O, ObservedValueOf<O>>;

export declare function switchMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
export declare function switchMap<T, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: undefined): OperatorFunction<T, ObservedValueOf<O>>;
export declare function switchMap<T, R, O extends ObservableInput<any>>(project: (value: T, index: number) => O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;

export declare function switchMapTo<O extends ObservableInput<unknown>>(observable: O): OperatorFunction<any, ObservedValueOf<O>>;
export declare function switchMapTo<O extends ObservableInput<unknown>>(observable: O, resultSelector: undefined): OperatorFunction<any, ObservedValueOf<O>>;
export declare function switchMapTo<T, R, O extends ObservableInput<unknown>>(observable: O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;

export declare function switchScan<T, R, O extends ObservableInput<any>>(accumulator: (acc: R, value: T, index: number) => O, seed: R): OperatorFunction<T, ObservedValueOf<O>>;

export declare type Tail<X extends readonly any[]> = ((...args: X) => any) extends (arg: any, ...rest: infer U) => any ? U : never;

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

export declare type TeardownLogic = Subscription | Unsubscribable | (() => void) | void;

export declare function throttle<T>(durationSelector: (value: T) => ObservableInput<any>, { leading, trailing }?: ThrottleConfig): MonoTypeOperatorFunction<T>;

export declare function throttleTime<T>(duration: number, scheduler?: SchedulerLike, config?: import("./throttle").ThrottleConfig): MonoTypeOperatorFunction<T>;

export declare function throwError(errorFactory: () => any): Observable<never>;
export declare function throwError(error: any): Observable<never>;
export declare function throwError(errorOrErrorFactory: any, scheduler: SchedulerLike): Observable<never>;

export declare function throwIfEmpty<T>(errorFactory?: () => any): MonoTypeOperatorFunction<T>;

export declare function timeInterval<T>(scheduler?: SchedulerLike): OperatorFunction<T, TimeInterval<T>>;

export interface TimeInterval<T> {
    interval: number;
    value: T;
}

export declare function timeout<T, O extends ObservableInput<unknown>, M = unknown>(config: TimeoutConfig<T, O, M> & {
    with: (info: TimeoutInfo<T, M>) => O;
}): OperatorFunction<T, T | ObservedValueOf<O>>;
export declare function timeout<T, M = unknown>(config: Omit<TimeoutConfig<T, any, M>, 'with'>): OperatorFunction<T, T>;
export declare function timeout<T>(first: Date, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
export declare function timeout<T>(each: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;

export interface TimeoutError<T = unknown, M = unknown> extends Error {
    info: TimeoutInfo<T, M> | null;
}

export declare const TimeoutError: TimeoutErrorCtor;

export declare function timeoutWith<T, R>(dueBy: Date, switchTo: ObservableInput<R>, scheduler?: SchedulerLike): OperatorFunction<T, T | R>;
export declare function timeoutWith<T, R>(waitFor: number, switchTo: ObservableInput<R>, scheduler?: SchedulerLike): OperatorFunction<T, T | R>;

export declare function timer(due: number | Date, scheduler?: SchedulerLike): Observable<0>;
export declare function timer(startDue: number | Date, intervalDuration: number, scheduler?: SchedulerLike): Observable<number>;
export declare function timer(dueTime: number | Date, unused: undefined, scheduler?: SchedulerLike): Observable<0>;

export declare function timestamp<T>(timestampProvider?: TimestampProvider): OperatorFunction<T, Timestamp<T>>;

export interface Timestamp<T> {
    timestamp: number;
    value: T;
}

export interface TimestampProvider {
    now(): number;
}

export declare function toArray<T>(): OperatorFunction<T, T[]>;

export declare type TruthyTypesOf<T> = T extends Falsy ? never : T;

export interface UnaryFunction<T, R> {
    (source: T): R;
}

export interface Unsubscribable {
    unsubscribe(): void;
}

export interface UnsubscriptionError extends Error {
    readonly errors: any[];
}

export declare const UnsubscriptionError: UnsubscriptionErrorCtor;

export declare function using<T extends ObservableInput<any>>(resourceFactory: () => Unsubscribable | void, observableFactory: (resource: Unsubscribable | void) => T | void): Observable<ObservedValueOf<T>>;

export declare type ValueFromArray<A extends readonly unknown[]> = A extends Array<infer T> ? T : never;

export declare type ValueFromNotification<T> = T extends {
    kind: 'N' | 'E' | 'C';
} ? T extends NextNotification<any> ? T extends {
    value: infer V;
} ? V : undefined : never : never;

export declare class VirtualAction<T> extends AsyncAction<T> {
    protected active: boolean;
    protected index: number;
    protected scheduler: VirtualTimeScheduler;
    protected work: (this: SchedulerAction<T>, state?: T) => void;
    constructor(scheduler: VirtualTimeScheduler, work: (this: SchedulerAction<T>, state?: T) => void, index?: number);
    protected _execute(state: T, delay: number): any;
    protected recycleAsyncId(scheduler: VirtualTimeScheduler, id?: any, delay?: number): any;
    protected requestAsyncId(scheduler: VirtualTimeScheduler, id?: any, delay?: number): any;
    schedule(state?: T, delay?: number): Subscription;
}

export declare class VirtualTimeScheduler extends AsyncScheduler {
    frame: number;
    index: number;
    maxFrames: number;
    constructor(schedulerActionCtor?: typeof AsyncAction, maxFrames?: number);
    flush(): void;
    static frameTimeFactor: number;
}

export declare function window<T>(windowBoundaries: Observable<any>): OperatorFunction<T, Observable<T>>;

export declare function windowCount<T>(windowSize: number, startWindowEvery?: number): OperatorFunction<T, Observable<T>>;

export declare function windowTime<T>(windowTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
export declare function windowTime<T>(windowTimeSpan: number, windowCreationInterval: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
export declare function windowTime<T>(windowTimeSpan: number, windowCreationInterval: number | null | void, maxWindowSize: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;

export declare function windowToggle<T, O>(openings: ObservableInput<O>, closingSelector: (openValue: O) => ObservableInput<any>): OperatorFunction<T, Observable<T>>;

export declare function windowWhen<T>(closingSelector: () => ObservableInput<any>): OperatorFunction<T, Observable<T>>;

export declare function withLatestFrom<T, O extends unknown[]>(...inputs: [...ObservableInputTuple<O>]): OperatorFunction<T, [T, ...O]>;
export declare function withLatestFrom<T, O extends unknown[], R>(...inputs: [...ObservableInputTuple<O>, (...value: [T, ...O]) => R]): OperatorFunction<T, R>;

export declare function zip<A extends readonly unknown[]>(sources: [...ObservableInputTuple<A>]): Observable<A>;
export declare function zip<A extends readonly unknown[], R>(sources: [...ObservableInputTuple<A>], resultSelector: (...values: A) => R): Observable<R>;
export declare function zip<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A>;
export declare function zip<A extends readonly unknown[], R>(...sourcesAndResultSelector: [...ObservableInputTuple<A>, (...values: A) => R]): Observable<R>;

export declare function zipAll<T>(): OperatorFunction<ObservableInput<T>, T[]>;
export declare function zipAll<T>(): OperatorFunction<any, T[]>;
export declare function zipAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
export declare function zipAll<R>(project: (...values: Array<any>) => R): OperatorFunction<any, R>;

export declare function zipWith<T, A extends readonly unknown[]>(...otherInputs: [...ObservableInputTuple<A>]): OperatorFunction<T, Cons<T, A>>;
