import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { OperatorFunction, TruthyTypesOf } from '../types';
import { buckets } from './buckets';

export interface SplitByOptions<T> {
  /**
   * The factory used to create the subject that will connect the source observable to
   * multicast consumers.
   */
  connector?: (match: boolean) => Subject<T>;
}

export function splitBy<T, U extends T>(
  predicate: (value: T) => value is U,
  options?: SplitByOptions<T>
): OperatorFunction<T, [Observable<U>, Observable<Exclude<T, U>>]>;
export function splitBy<T>(
  predicate: BooleanConstructor,
  options?: SplitByOptions<T>
): OperatorFunction<T, [Observable<TruthyTypesOf<T>>, Observable<Exclude<T, TruthyTypesOf<T>>>]>;
export function splitBy<T>(
  predicate: (value: T) => boolean,
  options?: SplitByOptions<T>
): OperatorFunction<T, [Observable<T>, Observable<T>]>;

/**
 * Maps a source observable into an observable that does a single immediate and
 * synchronous emit that contains an array of two multicasted ("hot")
 * observables into which the source values are partitioned into according to a
 * given predicate applied over each source value. The values that match the
 * predicate are piped into the first observable and the remaining, that do not
 * match the predicate, into the second one.
 *
 * This enables similar behavior to the {@link groupBy} operator with the
 * difference that both groups are available immediately when using `splitBy`.
 *
 * ## Example
 *
 * ```ts
 * import { interval } from 'rxjs';
 * import { splitBy, mergeMap, mapTo, mergeAll, groupBy } from 'rxjs/operators';
 *
 * interval(1000).pipe(
 *   splitBy((value) => value % 2 === 0),
 *   mergeAll(),
 *   mergeMap((bucket, index) => {
 *     const kind = index === 0 ? 'even' : 'odd';
 *     console.log(`${kind} bucket discovered`);
 *
 *     return bucket.pipe(mapTo(kind));
 *   }),
 * ).subscribe(console.log);
 *
 * // Result
 * // "even bucket discovered"
 * // "odd bucket discovered"
 * // "even"
 * // "odd"
 * // "even"
 * // "odd"
 * // "even"
 * // ...
 *
 * // groupBy is similar but different
 *
 * interval(1000).pipe(
 *   groupBy((value) => value % 2 === 0),
 *   mergeMap((group) => {
 *     const kind = group.key ? 'even' : 'odd';
 *     console.log(`${kind} group discovered`);
 *
 *     return group.pipe(mapTo(kind));
 *   }),
 * ).subscribe(console.log);
 *
 * // Result
 * // "even group discovered"
 * // "even"
 * // "odd group discovered"
 * // "odd"
 * // "even"
 * // "odd"
 * // "even"
 * // ...
 *
 * ```
 *
 * @param predicate The predicate to partition by
 * @return A function that returns an Observable that does a single emit
 *  containing the two observables for matching and non-matching values
 *
 * @see {@link buckets}
 * @see {@link groupBy}
 * @see {@link partition}
 */
export function splitBy<T>(
  predicate: (value: T) => boolean,
  options: SplitByOptions<T> = {}
): OperatorFunction<T, [Observable<T>, Observable<T>]> {
  const { connector } = options;

  return buckets(2, {
    hashFn: (value) => Number(!predicate(value)),
    connector: connector === undefined ? undefined : (bucketIndex) => connector(bucketIndex === 0),
  }) as OperatorFunction<T, [Observable<T>, Observable<T>]>;
}
