interface operator_proto_buffer{ <T>(closingNotifier: Observable<any>): Observable<T[]> }
interface operator_proto_bufferCount{ <T>(bufferSize: number, startBufferEvery: number = null): Observable<T[]> }
interface operator_proto_bufferTime{ <T>(bufferTimeSpan: number, }
interface operator_proto_bufferToggle{ <T, O>(openings: Observable<O>, }
interface operator_proto_bufferWhen{ <T>(closingSelector: () => Observable<any>): Observable<T[]> }
interface operator_proto_catch{ <T>(selector: (err: any, caught: Observable<any>) => Observable<any>): Observable<T> }
interface operator_proto_combineAll{ <T>() : ObservableOrIterable<T[]>;; <T, R>(project?: (...values: T[]) => R): ObservableOrIterable<R> }
interface operator_proto_combineLatest{ <T>(first: ObservableOrIterable<T>): Observable<[T]>;; <T, TResult>(first: ObservableOrIterable<T>, project: (v1: T) => TResult): Observable<TResult>;; <T, T2>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>): Observable<[T, T2]>;; <T, T2, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, project: (v1: T, v2: T2) => TResult): Observable<TResult>;; <T, T2, T3>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>): Observable<[T, T2, T3]>;; <T, T2, T3, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, project: (v1: T, v2: T2, v3: T3) => TResult): Observable<TResult>;; <T, T2, T3, T4>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>): Observable<[T, T2, T3, T4]>;; <T, T2, T3, T4, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, project: (v1: T, v2: T2, v3: T3, v4: T4) => TResult): Observable<TResult>;; <T, T2, T3, T4, T5>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>): Observable<[T, T2, T3, T4, T5]>;; <T, T2, T3, T4, T5, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => TResult): Observable<TResult>;; <T, T2, T3, T4, T5, T6>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>): Observable<[T, T2, T3, T4, T5, T6]>;; <T, T2, T3, T4, T5, T6, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => TResult): Observable<TResult>;; <T, T2, T3, T4, T5, T6, T7>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, eventh: ObservableOrIterable<T7>): Observable<[T, T2, T3, T4, T5, T6, T7]>;; <T, T2, T3, T4, T5, T6, T7, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, eventh: ObservableOrIterable<T7>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7) => TResult): Observable<TResult>;; <T, T2, T3, T4, T5, T6, T7, T8>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;; <T, T2, T3, T4, T5, T6, T7, T8, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8) => TResult): Observable<TResult>;; <T, T2, T3, T4, T5, T6, T7, T8, T9>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>, ninth: ObservableOrIterable<T9>): Observable<[T, T2, T3, T4, T5, T6, T7, T8, T9]>;; <T, T2, T3, T4, T5, T6, T7, T8, T9, TResult>(first: ObservableOrIterable<T>, second: ObservableOrIterable<T2>, third: ObservableOrIterable<T3>, fourth: ObservableOrIterable<T4>, fifth: ObservableOrIterable<T5>, sixth: ObservableOrIterable<T6>, seventh: ObservableOrIterable<T7>, eighth: ObservableOrIterable<T8>, ninth: ObservableOrIterable<T9>, project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, v7: T7, v8: T8, v9: T9) => TResult): Observable<TResult>;; <T>(...observables: Array<ObservableOrIterable<T> | ((...values: Array<T>) => T)>): Observable<T>;; <T, R>(...observables: Array<ObservableOrIterable<T> | ((...values: Array<T>) => R)>): Observable<R>;; <T>(...observables: Array<T>): Observable<T[]>;; <T, R>(...observables: Array<Observable<T> | ((...values: Array<T>) => R)>): Observable<R> }
interface operator_proto_concat{ <R>(...observables: (Observable<any> | Scheduler)[]): Observable<R> }
interface operator_proto_concatAll{ <T>(): Observable<T> }
interface operator_proto_concatMap{ <T, R>(project: (value: T, index: number) => Observable<any>, }
interface operator_proto_concatMapTo{ <T, R, R2>(observable: Observable<R>, }
interface operator_proto_count{ <T>(predicate?: (value: T, }
interface operator_proto_dematerialize{ <T>(): Observable<any> }
interface operator_proto_debounce{ <T>(durationSelector: (value: T) => Observable<any> | Promise<any>): Observable<T> }
interface operator_proto_debounceTime{ <T>(dueTime: number, scheduler: Scheduler = nextTick): Observable<T> }
interface operator_proto_defaultIfEmpty{ <T, R>(defaultValue: R = null): Observable<T> | Observable<R> }
interface operator_proto_delay{ <T>(delay: number|Date, }
interface operator_proto_distinctUntilChanged{ <T>(compare?: (x: T, y: T) => boolean, thisArg?: any) }
interface operator_proto_do{ <T>(nextOrObserver?: Observer<T>|((x: T) => void), error?: (e: any) => void, complete?: () => void) }
interface operator_proto_expand{ <T, R>(project: (value: T, index: number) => Observable<R>, }
interface operator_proto_filter{ <T>(select: (x: T, ix?: number) => boolean, thisArg?: any) }
interface operator_proto_finally{ <T>(finallySelector: () => void, thisArg?: any) }
interface operator_proto_first{ <T, R>(predicate?: (value: T, index: number, source: Observable<T>) => boolean, }
interface operator_proto_mergeMap{ <T, R, R2>(project: (value: T, index: number) => Observable<R>, }
interface operator_proto_mergeMapTo{ <T, R, R2>(observable: Observable<R>, }
interface operator_proto_groupBy{ <T, R>(keySelector: (value: T) => string, }
interface operator_proto_ignoreElements{ () }
interface operator_proto_last{ <T, R>(predicate?: (value: T, index: number, source: Observable<T>) => boolean, }
interface operator_proto_every{ <T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, }
interface operator_proto_map{ <T, R>(project: (x: T, ix?: number) => R, thisArg?: any): Observable<R> }
interface operator_proto_mapTo{ <T, R>(value: R) }
interface operator_proto_materialize{ <T>(): Observable<Notification<T>> }
interface operator_proto_merge{ <R>(...observables: (Observable<any>|Scheduler|number)[]): Observable<R> }
interface operator_proto_mergeAll{ <R>(concurrent: number = Number.POSITIVE_INFINITY): Observable<R> }
interface operator_proto_multicast{ <T>(subjectOrSubjectFactory: Subject<T>|(() => Subject<T>)) }
interface operator_proto_observeOn{ <T>(scheduler: Scheduler, delay: number = 0): Observable<T> }
interface operator_proto_partition{ <T>(predicate: (x: any, i?: any, a?: any) => boolean, thisArg?: any): Observable<T>[] }
interface operator_proto_publish{ () }
interface operator_proto_publishBehavior{ (value: any) }
interface operator_proto_publishReplay{ (bufferSize: number = Number.POSITIVE_INFINITY, }
interface operator_proto_reduce{ <T, R>(project: (acc: R, x: T) => R, seed?: R): Observable<R> }
interface operator_proto_repeat{ <T>(count: number = -1): Observable<T> }
interface operator_proto_retry{ <T>(count: number = 0): Observable<T> }
interface operator_proto_retryWhen{ <T>(notifier: (errors: Observable<any>) => Observable<any>) }
interface operator_proto_sample{ <T>(notifier: Observable<any>): Observable<T> }
interface operator_proto_sampleTime{ <T>(delay: number, scheduler: Scheduler = nextTick): Observable<T> }
interface operator_proto_scan{ <T, R>(project: (acc: R, x: T) => R, acc?: R) }
interface operator_proto_share{ <T>(): Observable<T> }
interface operator_proto_single{ <T>(predicate?: (value: T, }
interface operator_proto_skip{ (total) }
interface operator_proto_skipUntil{ <T>(notifier: Observable<any>): Observable<T> }
interface operator_proto_startWith{ <T>(...array: (T | Scheduler)[]): Observable<T> }
interface operator_proto_subscribeOn{ <T>(scheduler: Scheduler, delay: number = 0): Observable<T> }
interface operator_proto_switch{ <T>(): Observable<T> }
interface operator_proto_switchMap{ <T, R, R2>(project: (value: T, index: number) => Observable<R>, }
interface operator_proto_switchMapTo{ <T, R, R2>(observable: Observable<R>, }
interface operator_proto_take{ (total) }
interface operator_proto_takeUntil{ <T>(notifier: Observable<any>) }
interface operator_proto_throttle{ <T>(durationSelector: (value: T) => Observable<any> | Promise<any>): Observable<T> }
interface operator_proto_throttleTime{ <T>(delay: number, scheduler: Scheduler = nextTick) }
interface operator_proto_timeout{ (due: number|Date, }
interface operator_proto_timeoutWith{ <T, R>(due: number | Date, }
interface operator_proto_toArray{ () }
interface operator_proto_toPromise{ <T>(PromiseCtor?: PromiseConstructor): Promise<T> }
interface operator_proto_window{ <T>(closingNotifier: Observable<any>): Observable<Observable<T>> }
interface operator_proto_windowCount{ <T>(windowSize: number, }
interface operator_proto_windowTime{ <T>(windowTimeSpan: number, }
interface operator_proto_windowToggle{ <T, O>(openings: Observable<O>, }
interface operator_proto_windowWhen{ <T>(closingSelector: () => Observable<any>): Observable<Observable<T>> }
interface operator_proto_withLatestFrom{ <R>(...args: Array<Observable<any> | ((...values: Array<any>) => R)>): Observable<R> }
interface operator_proto_zip{ Proto<R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>): Observable<R> }
interface operator_proto_zipAll{ <T, R>(project?: (...values: Array<any>) => R) }
