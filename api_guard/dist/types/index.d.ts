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
    _subscribe(subscriber: Subscriber<any>): Subscription;
    complete(): void;
    error(error: any): void;
    next(value: T): void;
}

export declare class BehaviorSubject<T> extends Subject<T> {
    get value(): T;
    constructor(_value: T);
    _subscribe(subscriber: Subscriber<T>): Subscription;
    getValue(): T;
    next(value: T): void;
}

export declare function bindCallback(callbackFunc: Function, resultSelector: Function, scheduler?: SchedulerLike): (...args: any[]) => Observable<any>;
export declare function bindCallback<R1, R2, R3, R4>(callbackFunc: (callback: (res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): () => Observable<any[]>;
export declare function bindCallback<R1, R2, R3>(callbackFunc: (callback: (res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): () => Observable<[R1, R2, R3]>;
export declare function bindCallback<R1, R2>(callbackFunc: (callback: (res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): () => Observable<[R1, R2]>;
export declare function bindCallback<R1>(callbackFunc: (callback: (res1: R1) => any) => any, scheduler?: SchedulerLike): () => Observable<R1>;
export declare function bindCallback(callbackFunc: (callback: () => any) => any, scheduler?: SchedulerLike): () => Observable<void>;
export declare function bindCallback<A1, R1, R2, R3, R4>(callbackFunc: (arg1: A1, callback: (res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<any[]>;
export declare function bindCallback<A1, R1, R2, R3>(callbackFunc: (arg1: A1, callback: (res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<[R1, R2, R3]>;
export declare function bindCallback<A1, R1, R2>(callbackFunc: (arg1: A1, callback: (res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<[R1, R2]>;
export declare function bindCallback<A1, R1>(callbackFunc: (arg1: A1, callback: (res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<R1>;
export declare function bindCallback<A1>(callbackFunc: (arg1: A1, callback: () => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<void>;
export declare function bindCallback<A1, A2, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, callback: (res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<any[]>;
export declare function bindCallback<A1, A2, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, callback: (res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<[R1, R2, R3]>;
export declare function bindCallback<A1, A2, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, callback: (res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<[R1, R2]>;
export declare function bindCallback<A1, A2, R1>(callbackFunc: (arg1: A1, arg2: A2, callback: (res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<R1>;
export declare function bindCallback<A1, A2>(callbackFunc: (arg1: A1, arg2: A2, callback: () => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<void>;
export declare function bindCallback<A1, A2, A3, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<any[]>;
export declare function bindCallback<A1, A2, A3, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<[R1, R2, R3]>;
export declare function bindCallback<A1, A2, A3, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<[R1, R2]>;
export declare function bindCallback<A1, A2, A3, R1>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<R1>;
export declare function bindCallback<A1, A2, A3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: () => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<void>;
export declare function bindCallback<A1, A2, A3, A4, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<any[]>;
export declare function bindCallback<A1, A2, A3, A4, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<[R1, R2, R3]>;
export declare function bindCallback<A1, A2, A3, A4, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<[R1, R2]>;
export declare function bindCallback<A1, A2, A3, A4, R1>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<R1>;
export declare function bindCallback<A1, A2, A3, A4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: () => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<void>;
export declare function bindCallback<A1, A2, A3, A4, A5, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<any[]>;
export declare function bindCallback<A1, A2, A3, A4, A5, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<[R1, R2, R3]>;
export declare function bindCallback<A1, A2, A3, A4, A5, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<[R1, R2]>;
export declare function bindCallback<A1, A2, A3, A4, A5, R1>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<R1>;
export declare function bindCallback<A1, A2, A3, A4, A5>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: () => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<void>;
export declare function bindCallback<A, R>(callbackFunc: (...args: Array<A | ((result: R) => any)>) => any, scheduler?: SchedulerLike): (...args: A[]) => Observable<R>;
export declare function bindCallback<A, R>(callbackFunc: (...args: Array<A | ((...results: R[]) => any)>) => any, scheduler?: SchedulerLike): (...args: A[]) => Observable<R[]>;
export declare function bindCallback(callbackFunc: Function, scheduler?: SchedulerLike): (...args: any[]) => Observable<any>;

export declare function bindNodeCallback(callbackFunc: Function, resultSelector: Function, scheduler?: SchedulerLike): (...args: any[]) => Observable<any>;
export declare function bindNodeCallback<R1, R2, R3, R4>(callbackFunc: (callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;
export declare function bindNodeCallback<R1, R2, R3>(callbackFunc: (callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): () => Observable<[R1, R2, R3]>;
export declare function bindNodeCallback<R1, R2>(callbackFunc: (callback: (err: any, res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): () => Observable<[R1, R2]>;
export declare function bindNodeCallback<R1>(callbackFunc: (callback: (err: any, res1: R1) => any) => any, scheduler?: SchedulerLike): () => Observable<R1>;
export declare function bindNodeCallback(callbackFunc: (callback: (err: any) => any) => any, scheduler?: SchedulerLike): () => Observable<void>;
export declare function bindNodeCallback<A1, R1, R2, R3, R4>(callbackFunc: (arg1: A1, callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;
export declare function bindNodeCallback<A1, R1, R2, R3>(callbackFunc: (arg1: A1, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<[R1, R2, R3]>;
export declare function bindNodeCallback<A1, R1, R2>(callbackFunc: (arg1: A1, callback: (err: any, res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<[R1, R2]>;
export declare function bindNodeCallback<A1, R1>(callbackFunc: (arg1: A1, callback: (err: any, res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<R1>;
export declare function bindNodeCallback<A1>(callbackFunc: (arg1: A1, callback: (err: any) => any) => any, scheduler?: SchedulerLike): (arg1: A1) => Observable<void>;
export declare function bindNodeCallback<A1, A2, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;
export declare function bindNodeCallback<A1, A2, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<[R1, R2, R3]>;
export declare function bindNodeCallback<A1, A2, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, callback: (err: any, res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<[R1, R2]>;
export declare function bindNodeCallback<A1, A2, R1>(callbackFunc: (arg1: A1, arg2: A2, callback: (err: any, res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<R1>;
export declare function bindNodeCallback<A1, A2>(callbackFunc: (arg1: A1, arg2: A2, callback: (err: any) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2) => Observable<void>;
export declare function bindNodeCallback<A1, A2, A3, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;
export declare function bindNodeCallback<A1, A2, A3, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<[R1, R2, R3]>;
export declare function bindNodeCallback<A1, A2, A3, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<[R1, R2]>;
export declare function bindNodeCallback<A1, A2, A3, R1>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any, res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<R1>;
export declare function bindNodeCallback<A1, A2, A3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, callback: (err: any) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3) => Observable<void>;
export declare function bindNodeCallback<A1, A2, A3, A4, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;
export declare function bindNodeCallback<A1, A2, A3, A4, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<[R1, R2, R3]>;
export declare function bindNodeCallback<A1, A2, A3, A4, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any, res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<[R1, R2]>;
export declare function bindNodeCallback<A1, A2, A3, A4, R1>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any, res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<R1>;
export declare function bindNodeCallback<A1, A2, A3, A4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, callback: (err: any) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Observable<void>;
export declare function bindNodeCallback<A1, A2, A3, A4, A5, R1, R2, R3, R4>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any, res1: R1, res2: R2, res3: R3, res4: R4, ...args: any[]) => any) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;
export declare function bindNodeCallback<A1, A2, A3, A4, A5, R1, R2, R3>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any, res1: R1, res2: R2, res3: R3) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<[R1, R2, R3]>;
export declare function bindNodeCallback<A1, A2, A3, A4, A5, R1, R2>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any, res1: R1, res2: R2) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<[R1, R2]>;
export declare function bindNodeCallback<A1, A2, A3, A4, A5, R1>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any, res1: R1) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<R1>;
export declare function bindNodeCallback<A1, A2, A3, A4, A5>(callbackFunc: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, callback: (err: any) => any) => any, scheduler?: SchedulerLike): (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) => Observable<void>;
export declare function bindNodeCallback(callbackFunc: Function, scheduler?: SchedulerLike): (...args: any[]) => Observable<any[]>;

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
export declare function combineLatest<O1 extends ObservableInput<any>>(sources: [O1]): Observable<[ObservedValueOf<O1>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>>(sources: [O1, O2]): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(sources: [O1, O2, O3]): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>>(sources: [O1, O2, O3, O4]): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>>(sources: [O1, O2, O3, O4, O5]): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>]>;
export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>>(sources: [O1, O2, O3, O4, O5, O6]): Observable<[
    ObservedValueOf<O1>,
    ObservedValueOf<O2>,
    ObservedValueOf<O3>,
    ObservedValueOf<O4>,
    ObservedValueOf<O5>,
    ObservedValueOf<O6>
]>;
export declare function combineLatest<O extends ObservableInput<any>>(sources: O[]): Observable<ObservedValueOf<O>[]>;
export declare function combineLatest<O extends readonly ObservableInput<any>[]>(sources: O): Observable<ObservedValueTupleFromArray<O>>;
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
export declare function combineLatest(sourcesObject: {}): Observable<never>;
export declare function combineLatest<T, K extends keyof T>(sourcesObject: T): Observable<{
    [K in keyof T]: ObservedValueOf<T[K]>;
}>;

export interface CompleteNotification {
    kind: 'C';
}

export interface CompletionObserver<T> {
    closed?: boolean;
    complete: () => void;
    error?: (err: any) => void;
    next?: (value: T) => void;
}

export declare function concat<O1 extends ObservableInput<any>>(v1: O1, scheduler: SchedulerLike): Observable<ObservedValueOf<O1>>;
export declare function concat<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>>(v1: O1, v2: O2, scheduler: SchedulerLike): Observable<ObservedValueOf<O1> | ObservedValueOf<O2>>;
export declare function concat<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, scheduler: SchedulerLike): Observable<ObservedValueOf<O1> | ObservedValueOf<O2> | ObservedValueOf<O3>>;
export declare function concat<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4, scheduler: SchedulerLike): Observable<ObservedValueOf<O1> | ObservedValueOf<O2> | ObservedValueOf<O3> | ObservedValueOf<O4>>;
export declare function concat<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4, v5: O5, scheduler: SchedulerLike): Observable<ObservedValueOf<O1> | ObservedValueOf<O2> | ObservedValueOf<O3> | ObservedValueOf<O4> | ObservedValueOf<O5>>;
export declare function concat<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4, v5: O5, v6: O6, scheduler: SchedulerLike): Observable<ObservedValueOf<O1> | ObservedValueOf<O2> | ObservedValueOf<O3> | ObservedValueOf<O4> | ObservedValueOf<O5> | ObservedValueOf<O6>>;
export declare function concat<A extends ObservableInput<any>[]>(...observables: A): Observable<ObservedValueUnionFromArray<A>>;

export declare const config: {
    onUnhandledError: ((err: any) => void) | null;
    quietBadConfig: boolean;
    Promise: PromiseConstructorLike;
    useDeprecatedSynchronousErrorHandling: boolean;
    useDeprecatedNextContext: boolean;
};

export declare class ConnectableObservable<T> extends Observable<T> {
    protected _connection: Subscription | null | undefined;
    _isComplete: boolean;
    protected _refCount: number;
    protected _subject: Subject<T> | undefined;
    source: Observable<T>;
    protected subjectFactory: () => Subject<T>;
    constructor(source: Observable<T>, subjectFactory: () => Subject<T>);
    _subscribe(subscriber: Subscriber<T>): Subscription;
    connect(): Subscription;
    protected getSubject(): Subject<T>;
    refCount(): Observable<T>;
}

export declare type Cons<X, Y extends any[]> = ((arg: X, ...rest: Y) => any) extends ((...args: infer U) => any) ? U : never;

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

export declare function firstValueFrom<T>(source: Observable<T>): Promise<T>;

export declare function forkJoin<T>(v1: SubscribableOrPromise<T>): Observable<[T]>;
export declare function forkJoin<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>): Observable<[T, T2]>;
export declare function forkJoin<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<[T, T2, T3]>;
export declare function forkJoin<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<[T, T2, T3, T4]>;
export declare function forkJoin<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<[T, T2, T3, T4, T5]>;
export declare function forkJoin<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<[T, T2, T3, T4, T5, T6]>;
export declare function forkJoin<A>(sources: [ObservableInput<A>]): Observable<[A]>;
export declare function forkJoin<A, B>(sources: [ObservableInput<A>, ObservableInput<B>]): Observable<[A, B]>;
export declare function forkJoin<A, B, C>(sources: [ObservableInput<A>, ObservableInput<B>, ObservableInput<C>]): Observable<[A, B, C]>;
export declare function forkJoin<A, B, C, D>(sources: [ObservableInput<A>, ObservableInput<B>, ObservableInput<C>, ObservableInput<D>]): Observable<[A, B, C, D]>;
export declare function forkJoin<A, B, C, D, E>(sources: [ObservableInput<A>, ObservableInput<B>, ObservableInput<C>, ObservableInput<D>, ObservableInput<E>]): Observable<[A, B, C, D, E]>;
export declare function forkJoin<A, B, C, D, E, F>(sources: [ObservableInput<A>, ObservableInput<B>, ObservableInput<C>, ObservableInput<D>, ObservableInput<E>, ObservableInput<F>]): Observable<[A, B, C, D, E, F]>;
export declare function forkJoin<A extends ObservableInput<any>[]>(sources: A): Observable<ObservedValueUnionFromArray<A>[]>;
export declare function forkJoin(sourcesObject: {}): Observable<never>;
export declare function forkJoin<T, K extends keyof T>(sourcesObject: T): Observable<{
    [K in keyof T]: ObservedValueOf<T[K]>;
}>;
export declare function forkJoin(...args: Array<ObservableInput<any> | Function>): Observable<any>;
export declare function forkJoin<T>(...sources: ObservableInput<T>[]): Observable<T[]>;

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

export declare class GroupedObservable<K, T> extends Observable<T> {
    key: K;
    constructor(key: K, groupSubject: Subject<T>, refCountSubscription?: RefCountSubscription | undefined);
    _subscribe(subscriber: Subscriber<T>): Subscription;
}

export declare type Head<X extends any[]> = ((...args: X) => any) extends ((arg: infer U, ...rest: any[]) => any) ? U : never;

export declare function identity<T>(x: T): T;

export declare function iif<T = never, F = never>(condition: () => boolean, trueResult?: SubscribableOrPromise<T>, falseResult?: SubscribableOrPromise<F>): Observable<T | F>;

export declare type InteropObservable<T> = {
    [Symbol.observable]: () => Subscribable<T>;
};

export declare function interval(period?: number, scheduler?: SchedulerLike): Observable<number>;

export declare function isObservable<T>(obj: any): obj is Observable<T>;

export declare function lastValueFrom<T>(source: Observable<T>): Promise<T>;

export declare function merge<T>(v1: ObservableInput<T>, scheduler: SchedulerLike): Observable<T>;
export declare function merge<T>(v1: ObservableInput<T>, concurrent: number, scheduler: SchedulerLike): Observable<T>;
export declare function merge<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, scheduler: SchedulerLike): Observable<T | T2>;
export declare function merge<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, concurrent: number, scheduler: SchedulerLike): Observable<T | T2>;
export declare function merge<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler: SchedulerLike): Observable<T | T2 | T3>;
export declare function merge<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, concurrent: number, scheduler: SchedulerLike): Observable<T | T2 | T3>;
export declare function merge<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4>;
export declare function merge<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, concurrent: number, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4>;
export declare function merge<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
export declare function merge<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, concurrent: number, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
export declare function merge<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
export declare function merge<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, concurrent: number, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
export declare function merge<T>(v1: ObservableInput<T>): Observable<T>;
export declare function merge<T>(v1: ObservableInput<T>, concurrent?: number): Observable<T>;
export declare function merge<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>): Observable<T | T2>;
export declare function merge<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, concurrent?: number): Observable<T | T2>;
export declare function merge<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<T | T2 | T3>;
export declare function merge<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, concurrent?: number): Observable<T | T2 | T3>;
export declare function merge<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>): Observable<T | T2 | T3 | T4>;
export declare function merge<T, T2, T3, T4>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, concurrent?: number): Observable<T | T2 | T3 | T4>;
export declare function merge<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>): Observable<T | T2 | T3 | T4 | T5>;
export declare function merge<T, T2, T3, T4, T5>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, concurrent?: number): Observable<T | T2 | T3 | T4 | T5>;
export declare function merge<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>): Observable<T | T2 | T3 | T4 | T5 | T6>;
export declare function merge<T, T2, T3, T4, T5, T6>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, concurrent?: number): Observable<T | T2 | T3 | T4 | T5 | T6>;
export declare function merge<T>(...observables: (ObservableInput<T> | number)[]): Observable<T>;
export declare function merge<T>(...observables: (ObservableInput<T> | SchedulerLike | number)[]): Observable<T>;
export declare function merge<T, R>(...observables: (ObservableInput<any> | number)[]): Observable<R>;
export declare function merge<T, R>(...observables: (ObservableInput<any> | SchedulerLike | number)[]): Observable<R>;

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

export declare const observable: string | symbol;

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
    subscribe(observer?: PartialObserver<T>): Subscription;
    subscribe(next: null | undefined, error: null | undefined, complete: () => void): Subscription;
    subscribe(next: null | undefined, error: (error: any) => void, complete?: () => void): Subscription;
    subscribe(next: (value: T) => void, error: null | undefined, complete: () => void): Subscription;
    subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
    toPromise<T>(this: Observable<T>): Promise<T | undefined>;
    toPromise<T>(this: Observable<T>, PromiseCtor: typeof Promise): Promise<T | undefined>;
    toPromise<T>(this: Observable<T>, PromiseCtor: PromiseConstructorLike): Promise<T | undefined>;
    static create: Function;
}

export declare type ObservableInput<T> = SubscribableOrPromise<T> | ArrayLike<T> | Iterable<T> | AsyncIterableIterator<T>;

export declare type ObservableLike<T> = InteropObservable<T>;

export declare type ObservableNotification<T> = NextNotification<T> | ErrorNotification | CompleteNotification;

export declare type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never;

export declare type ObservedValuesFromArray<X> = ObservedValueUnionFromArray<X>;

export declare type ObservedValueTupleFromArray<X> = X extends readonly ObservableInput<any>[] ? {
    [K in keyof X]: ObservedValueOf<X[K]>;
} : never;

export declare type ObservedValueUnionFromArray<X> = X extends Array<ObservableInput<infer T>> ? T : never;

export interface Observer<T> {
    closed?: boolean;
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
export declare function of<T, U>(value1: T, value2: U): Observable<T | U>;
export declare function of<T, U, V>(value1: T, value2: U, value3: V): Observable<T | U | V>;
export declare function of<A extends Array<any>>(...args: A): Observable<ValueFromArray<A>>;

export declare function onErrorResumeNext(): Observable<never>;
export declare function onErrorResumeNext<O extends ObservableInput<any>>(arrayOfSources: O[]): Observable<ObservedValueOf<O>>;
export declare function onErrorResumeNext<A extends ObservableInput<any>[]>(...sources: A): Observable<ObservedValueUnionFromArray<A>>;

export interface Operator<T, R> {
    call(subscriber: Subscriber<R>, source: any): TeardownLogic;
}

export interface OperatorFunction<T, R> extends UnaryFunction<Observable<T>, Observable<R>> {
}

export declare function pairs<T>(obj: Object, scheduler?: SchedulerLike): Observable<[string, T]>;

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

export declare function race<A extends ObservableInput<any>[]>(observables: A): Observable<ObservedValueUnionFromArray<A>>;
export declare function race<A extends ObservableInput<any>[]>(...observables: A): Observable<ObservedValueUnionFromArray<A>>;

export declare function range(start?: number, count?: number, scheduler?: SchedulerLike): Observable<number>;

export declare class ReplaySubject<T> extends Subject<T> {
    constructor(bufferSize?: number, windowTime?: number, timestampProvider?: TimestampProvider);
    _subscribe(subscriber: Subscriber<T>): Subscription;
}

export declare function scheduled<T>(input: ObservableInput<T>, scheduler: SchedulerLike): Observable<T>;

export declare class Scheduler implements SchedulerLike {
    now: () => number;
    constructor(SchedulerAction: typeof Action, now?: () => number);
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
    _subscribe(subscriber: Subscriber<T>): Subscription;
    _trySubscribe(subscriber: Subscriber<T>): TeardownLogic;
    asObservable(): Observable<T>;
    complete(): void;
    error(err: any): void;
    lift<R>(operator: Operator<T, R>): Observable<R>;
    next(value: T): void;
    unsubscribe(): void;
    static create: Function;
}

export interface Subscribable<T> {
    subscribe(observer?: PartialObserver<T>): Unsubscribable;
    subscribe(next: null | undefined, error: null | undefined, complete: () => void): Unsubscribable;
    subscribe(next: null | undefined, error: (error: any) => void, complete?: () => void): Unsubscribable;
    subscribe(next: (value: T) => void, error: null | undefined, complete: () => void): Unsubscribable;
    subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Unsubscribable;
}

export declare type SubscribableOrPromise<T> = Subscribable<T> | Subscribable<never> | PromiseLike<T> | InteropObservable<T>;

export declare class Subscriber<T> extends Subscription implements Observer<T> {
    protected destination: Observer<any> | Subscriber<any>;
    protected isStopped: boolean;
    constructor(destinationOrNext?: PartialObserver<any> | ((value: T) => void) | null, error?: ((e?: any) => void) | null, complete?: (() => void) | null);
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

export declare type Tail<X extends any[]> = ((...args: X) => any) extends ((arg: any, ...rest: infer U) => any) ? U : never;

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

export declare function timer(dueTime?: number | Date, periodOrScheduler?: number | SchedulerLike, scheduler?: SchedulerLike): Observable<number>;

export interface Timestamp<T> {
    timestamp: number;
    value: T;
}

export interface TimestampProvider {
    now(): number;
}

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

export declare type ValueFromArray<A> = A extends Array<infer T> ? T : never;

export declare type ValueFromNotification<T> = T extends {
    kind: 'N' | 'E' | 'C';
} ? (T extends NextNotification<any> ? (T extends {
    value: infer V;
} ? V : undefined) : never) : never;

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
    constructor(SchedulerAction?: typeof AsyncAction, maxFrames?: number);
    flush(): void;
    static frameTimeFactor: number;
}

export declare function zip<O1 extends ObservableInput<any>, R>(v1: O1, resultSelector: (v1: ObservedValueOf<O1>) => R): Observable<R>;
export declare function zip<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, R>(v1: O1, v2: O2, resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>) => R): Observable<R>;
export declare function zip<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, R>(v1: O1, v2: O2, v3: O3, resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>) => R): Observable<R>;
export declare function zip<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, R>(v1: O1, v2: O2, v3: O3, v4: O4, resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>) => R): Observable<R>;
export declare function zip<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, R>(v1: O1, v2: O2, v3: O3, v4: O4, v5: O5, resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>, v5: ObservedValueOf<O5>) => R): Observable<R>;
export declare function zip<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>, R>(v1: O1, v2: O2, v3: O3, v4: O4, v5: O5, v6: O6, resultSelector: (v1: ObservedValueOf<O1>, v2: ObservedValueOf<O2>, v3: ObservedValueOf<O3>, v4: ObservedValueOf<O4>, v5: ObservedValueOf<O5>, v6: ObservedValueOf<O6>) => R): Observable<R>;
export declare function zip<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>>(v1: O1, v2: O2): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>]>;
export declare function zip<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>]>;
export declare function zip<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>]>;
export declare function zip<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4, v5: O5): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>]>;
export declare function zip<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>>(v1: O1, v2: O2, v3: O3, v4: O4, v5: O5, v6: O6): Observable<[
    ObservedValueOf<O1>,
    ObservedValueOf<O2>,
    ObservedValueOf<O3>,
    ObservedValueOf<O4>,
    ObservedValueOf<O5>,
    ObservedValueOf<O6>
]>;
export declare function zip<O extends ObservableInput<any>>(array: O[]): Observable<ObservedValueOf<O>[]>;
export declare function zip<R>(array: ObservableInput<any>[]): Observable<R>;
export declare function zip<O extends ObservableInput<any>, R>(array: O[], resultSelector: (...values: ObservedValueOf<O>[]) => R): Observable<R>;
export declare function zip<R>(array: ObservableInput<any>[], resultSelector: (...values: any[]) => R): Observable<R>;
export declare function zip<O extends ObservableInput<any>>(...observables: O[]): Observable<ObservedValueOf<O>[]>;
export declare function zip<O extends ObservableInput<any>, R>(...observables: Array<O | ((...values: ObservedValueOf<O>[]) => R)>): Observable<R>;
export declare function zip<R>(...observables: Array<ObservableInput<any> | ((...values: Array<any>) => R)>): Observable<R>;
