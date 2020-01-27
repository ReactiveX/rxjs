import { merge as mergeStatic } from '../observable/merge';
import { Observable } from '../Observable';
import { ObservableInput, OperatorFunction, MonoTypeOperatorFunction, SchedulerLike, ObservedValueUnionFromArray } from '../types';

/* tslint:disable:max-line-length */

/** @deprecated use {@link mergeWith} */
export function merge<T>(): MonoTypeOperatorFunction<T>;
/** @deprecated use {@link mergeWith} */
export function merge<T, T2>(v2: ObservableInput<T2>, ): OperatorFunction<T, T | T2>;
/** @deprecated use {@link mergeWith} */
export function merge<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, ): OperatorFunction<T, T | T2 | T3>;
/** @deprecated use {@link mergeWith} */
export function merge<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, ): OperatorFunction<T, T | T2 | T3 | T4>;
/** @deprecated use {@link mergeWith} */
export function merge<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, ): OperatorFunction<T, T | T2 | T3 | T4 | T5>;
/** @deprecated use {@link mergeWith} */
export function merge<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, ): OperatorFunction<T, T | T2 | T3 | T4 | T5 | T6>;

// Below are signatures we no longer wish to support in this format.
// They include either a concurrency argument or a scheduler argument.
// For these, users should use the merge static, and in fact
// for scheduling, they should compose that behavior with fromScheduled
// and observeOn, etc.

/** @deprecated use static {@link merge} */
export function merge<T>(scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;
/** @deprecated use static {@link merge} */
export function merge<T>(concurrent: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
/** @deprecated use static {@link merge} */
export function merge<T, T2>(v2: ObservableInput<T2>, scheduler: SchedulerLike): OperatorFunction<T, T | T2>;
/** @deprecated use static {@link merge} */
export function merge<T, T2>(v2: ObservableInput<T2>, concurrent: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2>;
/** @deprecated use static {@link merge} */
export function merge<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, scheduler: SchedulerLike): OperatorFunction<T, T | T2 | T3>;
/** @deprecated use static {@link merge} */
export function merge<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, concurrent: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3>;
/** @deprecated use static {@link merge} */
export function merge<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, scheduler: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4>;
/** @deprecated use static {@link merge} */
export function merge<T, T2, T3, T4>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, concurrent: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4>;
/** @deprecated use static {@link merge} */
export function merge<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, scheduler: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5>;
/** @deprecated use static {@link merge} */
export function merge<T, T2, T3, T4, T5>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, concurrent: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5>;
/** @deprecated use static {@link merge} */
export function merge<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, scheduler: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5 | T6>;
/** @deprecated use static {@link merge} */
export function merge<T, T2, T3, T4, T5, T6>(v2: ObservableInput<T2>, v3: ObservableInput<T3>, v4: ObservableInput<T4>, v5: ObservableInput<T5>, v6: ObservableInput<T6>, concurrent: number, scheduler?: SchedulerLike): OperatorFunction<T, T | T2 | T3 | T4 | T5 | T6>;
/** @deprecated use static {@link merge} */
export function merge<T>(...observables: Array<ObservableInput<T> | SchedulerLike | number>): MonoTypeOperatorFunction<T>;
/** @deprecated use static {@link merge} */
export function merge<T, R>(...observables: Array<ObservableInput<any> | SchedulerLike | number>): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * @deprecated use {@link mergeWith} or static {@link merge}
 */
export function merge<T, R>(...observables: Array<ObservableInput<any> | SchedulerLike | number | undefined>): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.lift.call(
    mergeStatic(source, ...(observables as any[])),
    undefined
  ) as Observable<R>;
}

export function mergeWith<T>(): OperatorFunction<T, T>;
export function mergeWith<T, A extends ObservableInput<any>[]>(...otherSources: A): OperatorFunction<T, (T | ObservedValueUnionFromArray<A>)>;

/**
 * Merge the values from all observables to an single observable result.
 *
 * Creates an observable, that when subscribed to, subscribes to the source
 * observable, and all other sources provided as arguments. All values from
 * every source are emitted from the resulting subscription.
 *
 * When all sources complete, the resulting observable will complete.
 *
 * When any one source errors, the resulting observable will error.
 *
 *
 * ### Example
 *
 * Joining all outputs from multiple user input event streams:
 *
 * ```ts
 * import { fromEvent } from 'rxjs';
 * import { map, mergeWith } from 'rxjs/operators';
 *
 * const clicks$ = fromEvent(document, 'click').pipe(map(() => 'click'));
 * const mousemoves$ = fromEvent(document, 'mousemove').pipe(map(() => 'mousemove'));
 * const dblclicks$ = fromEvent(document, 'dblclick').pipe(map(() => 'dblclick'));
 *
 * mousemoves$.pipe(
 *   mergeWith(clicks$, dblclicks$),
 * )
 * .subscribe(x => console.log(x));
 *
 * // result (assuming user interactions)
 * // "mousemove"
 * // "mousemove"
 * // "mousemove"
 * // "click"
 * // "click"
 * // "dblclick"
 * ```
 * @param otherSources the sources to combine the current source with.
 */
export function mergeWith<T, A extends ObservableInput<any>[]>(...otherSources: A): OperatorFunction<T, (T | ObservedValueUnionFromArray<A>)> {
  return merge(...otherSources);
}