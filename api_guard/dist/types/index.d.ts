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
    protected _checkFinalizedStatuses(subscriber: Subscriber<T>): void;
    complete(): void;
    next(value: T): void;
}

export declare class BehaviorSubject<T> extends Subject<T> {
    get value(): T;
    constructor(_value: T);
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
    getValue(): T;
    next(value: T): void;
}

export declare function bindCallback(callbackFunc: (...args: any[]) => void, resultSelector: (...args: any[]) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any>;
export declare function bindCallback<A extends readonly unknown[], R extends readonly unknown[]>(callbackFunc: (...args: [...A, (...res: R) => void]) => void, schedulerLike?: SchedulerLike): (...arg: A) => Observable<R extends [] ? void : R extends [any] ? R[0] : R>;

export declare function bindNodeCallback(callbackFunc: (...args: any[]) => void, resultSelector: (...args: any[]) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any>;
export declare function bindNodeCallback<A extends readonly unknown[], R extends readonly unknown[]>(callbackFunc: (...args: [...A, (err: any, ...res: R) => void]) => void, schedulerLike?: SchedulerLike): (...arg: A) => Observable<R extends [] ? void : R extends [any] ? R[0] : R>;

export declare function combineLatest(sources: []): Observable<never>;
export declare function combineLatest<A extends readonly unknown[]>(sources: readonly [...ObservableInputTuple<A>]): Observable<A>;
export declare function combineLatest<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A>;
export declare function combineLatest(sourcesObject: {
    [K in any]: never;
}): Observable<never>;
export declare function combineLatest<T>(sourcesObject: T): Observable<{
    [K in keyof T]: ObservedValueOf<T[K]>;
}>;
export declare function combineLatest<O1 extends ObservableInput<any>, R>(sources: [O1], resultSelector: (v1: ObservedValueOf<O1>) => R, scheduler?: SchedulerLike): Observable<R>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, R>(sources: [O1, O2], resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>) => R, scheduler?: SchedulerLike): Observable<R>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, R>(sources: [O1, O2, O3], resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>) => R, scheduler?: SchedulerLike): Observable<R>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, R>(sources: [O1, O2, O3, O4], resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>) => R, scheduler?: SchedulerLike): Observable<R>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, R>(sources: [O1, O2, O3, O4, O5], resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>, v5: ObservedValueOf<O5>) => R, scheduler?: SchedulerLike): Observable<R>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>, R>(sources: [O1, O2, O3, O4, O5, O6], resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>, v5: ObservedValueOf<O5>, v6: ObservedValueOf<O6>) => R, scheduler?: SchedulerLike): Observable<R>;
export declare function combineLatest<O extends ObservableInput<any>, R>(sources: O[], resultSelector: (...args: ObservedValueOf<O>[]) => R, scheduler?: SchedulerLike): Observable<R>;
export declare function combineLatest<O1 extends ObservableInput<any>, R>(v1: O1, resultSelector: (v1: ObservedValueOf<O1>) => R, scheduler?: SchedulerLike): Observable<R>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, R>(v1: O1, v2: O2, resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>) => R, scheduler?: SchedulerLike): Observable<R>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, R>(v1: O1, v2: O2, v3: O3, resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>) => R, scheduler?: SchedulerLike): Observable<R>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, R>(v1: O1, v2: O2, v3: O3, v4: O4, resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>) => R, scheduler?: SchedulerLike): Observable<R>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, R>(v1: O1, v2: O2, v3: O3, v4: O4, v5: O5, resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>, v5: ObservedValueOf<O5>) => R, scheduler?: SchedulerLike): Observable<R>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>, R>(v1: O1, v2: O2, v3: O3, v4: O4, v5: O5, v6: O6, resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>, v5: ObservedValueOf<O5>, v6: ObservedValueOf<O6>) => R, scheduler?: SchedulerLike): Observable<R>;
export declare function combineLatest<O1 extends ObservableInput<any>>(sources: [O1], scheduler: SchedulerLike): Observable<[ObservedValueOf<O1>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>>(sources: [O1, O2], scheduler: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(sources: [O1, O2, O3], scheduler: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>>(sources: [O1, O2, O3, O4], scheduler: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>>(sources: [O1, O2, O3, O4, O5], scheduler: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>>(sources: [O1, O2, O3, O4, O5, O6], scheduler: SchedulerLike): Observable<[
    ObservedValueOf<O1>,
    ObservedValueOf<O2>,
    ObservedValueOf<O3>,
    ObservedValueOf<O4>,
    ObservedValueOf<O5>,
    ObservedValueOf<O6>
]>;
export declare function combineLatest<O extends ObservableInput<any>>(sources: O[], scheduler: SchedulerLike): Observable<ObservedValueOf<O>[]>;
export declare function combineLatest<O1 extends ObservableInput<any>>(v1: O1, scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>>(v1: O1, v2: O2, scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4, scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4, v5: O5, scheduler?: SchedulerLike): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4, v5: O5, v6: O6, scheduler?: SchedulerLike): Observable<[
    ObservedValueOf<O1>,
    ObservedValueOf<O2>,
    ObservedValueOf<O3>,
    ObservedValueOf<O4>,
    ObservedValueOf<O5>,
    ObservedValueOf<O6>
]>;
export declare function combineLatest<O extends ObservableInput<any>>(...observables: O[]): Observable<any[]>;
export declare function combineLatest<O extends ObservableInput<any>, R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
export declare function combineLatest<O extends ObservableInput<any>, R>(array: O[], resultSelector: (...values: ObservedValueOf<O>[]) => R, scheduler?: SchedulerLike): Observable<R>;
export declare function combineLatest<O extends ObservableInput<any>>(...observables: Array<O | SchedulerLike>): Observable<any[]>;
export declare function combineLatest<O extends ObservableInput<any>, R>(...observables: Array<O | ((...values: ObservedValueOf<O>[]) => R) | SchedulerLike>): Observable<R>;
export declare function combineLatest<R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R) | SchedulerLike>): Observable<R>;

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

export declare const config: {
    onUnhandledError: ((err: any) => void) | null;
    onStoppedNotification: ((notification: ObservableNotification<any>, subscriber: Subscriber<any>) => void) | null;
    Promise: PromiseConstructorLike | undefined;
    useDeprecatedSynchronousErrorHandling: boolean;
    useDeprecatedNextContext: boolean;
};

export declare function connectable<T>(source: ObservableInput<T>, connector?: Subject<T>): ConnectableObservableLike<T>;

export declare class ConnectableObservable<T> extends Observable<T> {
    protected _connection: Subscription | null;
    protected _refCount: number;
    protected _subject: Subject<T> | null;
    source: Observable<T>;
    protected subjectFactory: () => Subject<T>;
    constructor(source: Observable<T>, subjectFactory: () => Subject<T>);
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
    protected _teardown(): void;
    connect(): Subscription;
    protected getSubject(): Subject<T>;
    refCount(): Observable<T>;
}

export declare type Cons<X, Y extends readonly any[]> = ((arg: X, ...rest: Y) => any) extends (...args: infer U) => any ? U : never;

export declare function defer<R extends ObservableInput<any>>(observableFactory: () => R): Observable<ObservedValueOf<R>>;

export declare function empty(scheduler?: SchedulerLike): Observable<never>;

export declare const EMPTY: Observable<never>;

export interface EmptyError extends Error {
}

export declare const EmptyError: EmptyErrorCtor;

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

export declare type FactoryOrValue<T> = T | (() => T);

export declare type Falsy = null | undefined | false | 0 | -0 | 0n | '';

export declare function firstValueFrom<T>(source: Observable<T>): Promise<T>;

export declare function forkJoin(sources: readonly []): Observable<never>;
export declare function forkJoin<A extends readonly unknown[]>(sources: readonly [...ObservableInputTuple<A>]): Observable<A>;
export declare function forkJoin<A extends readonly unknown[], R>(sources: readonly [...ObservableInputTuple<A>], resultSelector: (...values: A) => R): Observable<R>;
export declare function forkJoin<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A>;
export declare function forkJoin<A extends readonly unknown[], R>(...sourcesAndResultSelector: [...ObservableInputTuple<A>, (...values: A) => R]): Observable<R>;
export declare function forkJoin(sourcesObject: {
    [K in any]: never;
}): Observable<never>;
export declare function forkJoin<T>(sourcesObject: T): Observable<{
    [K in keyof T]: ObservedValueOf<T[K]>;
}>;

export declare function from<O extends ObservableInput<any>>(input: O): Observable<ObservedValueOf<O>>;
export declare function from<O extends ObservableInput<any>>(input: O, scheduler: SchedulerLike): Observable<ObservedValueOf<O>>;

export declare function fromEvent<T>(target: FromEventTarget<T>, eventName: string): Observable<T>;
export declare function fromEvent<T>(target: FromEventTarget<T>, eventName: string, resultSelector?: (...args: any[]) => T): Observable<T>;
export declare function fromEvent<T>(target: FromEventTarget<T>, eventName: string, options?: EventListenerOptions): Observable<T>;
export declare function fromEvent<T>(target: FromEventTarget<T>, eventName: string, options: EventListenerOptions, resultSelector: (...args: any[]) => T): Observable<T>;

export declare function fromEventPattern<T>(addHandler: (handler: NodeEventHandler) => any, removeHandler?: (handler: NodeEventHandler, signal?: any) => void): Observable<T>;
export declare function fromEventPattern<T>(addHandler: (handler: NodeEventHandler) => any, removeHandler?: (handler: NodeEventHandler, signal?: any) => void, resultSelector?: (...args: any[]) => T): Observable<T>;

export declare function generate<T, S>(initialState: S, condition: ConditionFunc<S>, iterate: IterateFunc<S>, resultSelector: ResultFunc<S, T>, scheduler?: SchedulerLike): Observable<T>;
export declare function generate<S>(initialState: S, condition: ConditionFunc<S>, iterate: IterateFunc<S>, scheduler?: SchedulerLike): Observable<S>;
export declare function generate<S>(options: GenerateBaseOptions<S>): Observable<S>;
export declare function generate<T, S>(options: GenerateOptions<T, S>): Observable<T>;

export interface GroupedObservable<K, T> extends Observable<T> {
    readonly key: K;
}

export declare type Head<X extends readonly any[]> = ((...args: X) => any) extends (arg: infer U, ...rest: any[]) => any ? U : never;

export declare function identity<T>(x: T): T;

export declare function iif<T>(condition: () => true, trueResult: ObservableInput<T>, falseResult: ObservableInput<any>): Observable<T>;
export declare function iif<F>(condition: () => false, trueResult: ObservableInput<any>, falseResult: ObservableInput<F>): Observable<F>;
export declare function iif<T, F>(condition: () => boolean, trueResult: ObservableInput<T>, falseResult: ObservableInput<F>): Observable<T | F>;

export interface InteropObservable<T> {
    [Symbol.observable]: () => Subscribable<T>;
}

export declare function interval(period?: number, scheduler?: SchedulerLike): Observable<number>;

export declare function isObservable<T>(obj: any): obj is Observable<T>;

export declare function lastValueFrom<T>(source: Observable<T>): Promise<T>;

export declare function merge<A extends readonly unknown[]>(...args: [...ObservableInputTuple<A>]): Observable<A[number]>;
export declare function merge<A extends readonly unknown[]>(...args: [...ObservableInputTuple<A>, number?]): Observable<A[number]>;
export declare function merge<A extends readonly unknown[]>(...args: [...ObservableInputTuple<A>, SchedulerLike?]): Observable<A[number]>;
export declare function merge<A extends readonly unknown[]>(...args: [...ObservableInputTuple<A>, number?, SchedulerLike?]): Observable<A[number]>;

export interface MonoTypeOperatorFunction<T> extends OperatorFunction<T, T> {
}

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

export declare const observable: string | SymbolConstructor["observable"];

export declare class Observable<T> implements Subscribable<T> {
    protected operator: Operator<any, T> | undefined;
    protected source: Observable<any> | undefined;
    constructor(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic);
    protected _subscribe(subscriber: Subscriber<any>): TeardownLogic;
    protected _trySubscribe(sink: Subscriber<T>): TeardownLogic;
    forEach(next: (value: T) => void): Promise<void>;
    forEach(next: (value: T) => void, promiseCtor: PromiseConstructorLike): Promise<void>;
    protected lift<R>(operator?: Operator<T, R>): Observable<R>;
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
    subscribe(next: null | undefined, error: null | undefined, complete: () => void): Subscription;
    subscribe(next: null | undefined, error: (error: any) => void, complete?: () => void): Subscription;
    subscribe(next: (value: T) => void, error: null | undefined, complete: () => void): Subscription;
    subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
    toPromise(): Promise<T | undefined>;
    toPromise(PromiseCtor: typeof Promise): Promise<T | undefined>;
    toPromise(PromiseCtor: PromiseConstructorLike): Promise<T | undefined>;
    static create: (...args: any[]) => any;
}

export declare type ObservableInput<T> = Observable<T> | InteropObservable<T> | AsyncIterable<T> | PromiseLike<T> | ArrayLike<T> | Iterable<T>;

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

export interface Observer<T> {
    complete: () => void;
    error: (err: any) => void;
    next: (value: T) => void;
}

export declare function of(scheduler: SchedulerLike): Observable<never>;
export declare function of<T>(a: T, scheduler: SchedulerLike): Observable<T>;
export declare function of<T, T2>(a: T, b: T2, scheduler: SchedulerLike): Observable<T | T2>;
export declare function of<T, T2, T3>(a: T, b: T2, c: T3, scheduler: SchedulerLike): Observable<T | T2 | T3>;
export declare function of<T, T2, T3, T4>(a: T, b: T2, c: T3, d: T4, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4>;
export declare function of<T, T2, T3, T4, T5>(a: T, b: T2, c: T3, d: T4, e: T5, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
export declare function of<T, T2, T3, T4, T5, T6>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
export declare function of<T, T2, T3, T4, T5, T6, T7>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6 | T7>;
export declare function of<T, T2, T3, T4, T5, T6, T7, T8>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, h: T8, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
export declare function of<T, T2, T3, T4, T5, T6, T7, T8, T9>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, h: T8, i: T9, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
export declare function of(): Observable<never>;
export declare function of<T>(): Observable<T>;
export declare function of<T>(value: T): Observable<T>;
export declare function of<A extends readonly unknown[]>(...args: A): Observable<ValueFromArray<A>>;

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

export declare type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompletionObserver<T>;

export declare function partition<T>(source: ObservableInput<T>, predicate: (value: T, index: number) => boolean, thisArg?: any): [Observable<T>, Observable<T>];

export declare function pipe<T>(): UnaryFunction<T, T>;
export declare function pipe<T, A>(fn1: UnaryFunction<T, A>): UnaryFunction<T, A>;
export declare function pipe<T, A, B>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>): UnaryFunction<T, B>;
export declare function pipe<T, A, B, C>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>): UnaryFunction<T, C>;
export declare function pipe<T, A, B, C, D>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>): UnaryFunction<T, D>;
export declare function pipe<T, A, B, C, D, E>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>): UnaryFunction<T, E>;
export declare function pipe<T, A, B, C, D, E, F>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>): UnaryFunction<T, F>;
export declare function pipe<T, A, B, C, D, E, F, G>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>, fn7: UnaryFunction<F, G>): UnaryFunction<T, G>;
export declare function pipe<T, A, B, C, D, E, F, G, H>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>, fn7: UnaryFunction<F, G>, fn8: UnaryFunction<G, H>): UnaryFunction<T, H>;
export declare function pipe<T, A, B, C, D, E, F, G, H, I>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>, fn7: UnaryFunction<F, G>, fn8: UnaryFunction<G, H>, fn9: UnaryFunction<H, I>): UnaryFunction<T, I>;
export declare function pipe<T, A, B, C, D, E, F, G, H, I>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>, fn7: UnaryFunction<F, G>, fn8: UnaryFunction<G, H>, fn9: UnaryFunction<H, I>, ...fns: UnaryFunction<any, any>[]): UnaryFunction<T, {}>;

export declare const queue: QueueScheduler;

export declare const queueScheduler: QueueScheduler;

export declare function race<T extends readonly unknown[]>(inputs: [...ObservableInputTuple<T>]): Observable<T[number]>;
export declare function race<T extends readonly unknown[]>(...inputs: [...ObservableInputTuple<T>]): Observable<T[number]>;

export declare function range(start: number, count?: number): Observable<number>;
export declare function range(start: number, count: number | undefined, scheduler: SchedulerLike): Observable<number>;

export declare class ReplaySubject<T> extends Subject<T> {
    constructor(bufferSize?: number, windowTime?: number, timestampProvider?: TimestampProvider);
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
    next(value: T): void;
}

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
    schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription;
}

export interface SequenceError extends Error {
}

export declare const SequenceError: SequenceErrorCtor;

export declare class Subject<T> extends Observable<T> implements SubscriptionLike {
    closed: boolean;
    hasError: boolean;
    isStopped: boolean;
    observers: Observer<T>[];
    thrownError: any;
    constructor();
    protected _checkFinalizedStatuses(subscriber: Subscriber<any>): void;
    protected _innerSubscribe(subscriber: Subscriber<any>): Subscription;
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
    protected _throwIfClosed(): void;
    protected _trySubscribe(subscriber: Subscriber<T>): TeardownLogic;
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

export declare type Tail<X extends readonly any[]> = ((...args: X) => any) extends (arg: any, ...rest: infer U) => any ? U : never;

export declare type TeardownLogic = Subscription | Unsubscribable | (() => void) | void;

export declare function throwError(errorFactory: () => any): Observable<never>;
export declare function throwError(error: any): Observable<never>;
export declare function throwError(errorOrErrorFactory: any, scheduler: SchedulerLike): Observable<never>;

export interface TimeInterval<T> {
    interval: number;
    value: T;
}

export interface TimeoutError<T = unknown, M = unknown> extends Error {
    info: TimeoutInfo<T, M> | null;
}

export declare const TimeoutError: TimeoutErrorCtor;

export declare function timer(due: number | Date, scheduler?: SchedulerLike): Observable<0>;
export declare function timer(startDue: number | Date, intervalDuration: number, scheduler?: SchedulerLike): Observable<number>;
export declare function timer(dueTime: number | Date, unused: undefined, scheduler?: SchedulerLike): Observable<0>;

export interface Timestamp<T> {
    timestamp: number;
    value: T;
}

export interface TimestampProvider {
    now(): number;
}

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

export declare function using<T>(resourceFactory: () => Unsubscribable | void, observableFactory: (resource: Unsubscribable | void) => ObservableInput<T> | void): Observable<T>;

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

export declare function zip<A extends readonly unknown[]>(sources: [...ObservableInputTuple<A>]): Observable<A>;
export declare function zip<A extends readonly unknown[], R>(sources: [...ObservableInputTuple<A>], resultSelector: (...values: A) => R): Observable<R>;
export declare function zip<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A>;
export declare function zip<A extends readonly unknown[], R>(...sourcesAndResultSelector: [...ObservableInputTuple<A>, (...values: A) => R]): Observable<R>;
