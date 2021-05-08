import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { OperatorFunction } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

export interface BucketsOptions<T> {
  /**
   * The hash function used to partition the values into their buckets. The
   * default hash function converts the values into numbers, if they are not
   * already.
   */
  hashFn?: (value: T) => number;
  /**
   * The factory used to create the subject that will connect the source observable to
   * multicast consumers.
   */
  connector?: (bucketIndex: number) => Subject<T>;
}

/**
 * Maps a source observable into an observable that does a single immediate and
 * synchronous emit that contains an array of multicasted ("hot") observables
 * - the buckets - into which the source values are partitioned into according
 * to a given hash function applied over each source value.
 *
 * This enables similar behavior to the {@link groupBy} operator with the
 * difference that all possible groups are available immediately when using
 * `buckets`.
 *
 * ## Example
 *
 * ```ts
 * import { interval } from 'rxjs';
 * import { buckets, mergeMap, mapTo, mergeAll, groupBy } from 'rxjs/operators';
 *
 * interval(1000).pipe(
 *   buckets(3),
 *   mergeAll(),
 *   mergeMap((bucket, index) => {
 *     console.log(`bucket ${index} discovered`);
 *
 *     return bucket.pipe(mapTo(`in bucket ${index}`));
 *   }),
 * ).subscribe(console.log);
 *
 * // Result
 * // "bucket 0 discovered"
 * // "bucket 1 discovered"
 * // "bucket 2 discovered"
 * // "in bucket 0"
 * // "in bucket 1"
 * // "in bucket 2"
 * // "in bucket 0"
 * // "in bucket 1"
 * // "in bucket 2"
 * // "in bucket 0"
 * // ...
 *
 * // groupBy is similar but different
 *
 * interval(1000).pipe(
 *   groupBy((value) => value % 3),
 *   mergeMap((group) => {
 *     console.log(`group ${group.key} discovered`);
 *
 *     return group.pipe(mapTo(`in group ${group.key}`));
 *   }),
 * ).subscribe(console.log);
 *
 * // Result
 * // "group 0 discovered"
 * // "in group 0"
 * // "group 1 discovered"
 * // "in group 1"
 * // "group 2 discovered"
 * // "in group 2"
 * // "in group 0"
 * // "in group 1"
 * // "in group 2"
 * // "in group 0"
 * // ...
 *
 * ```
 *
 * @param bucketCount The number of buckets
 * @return A function that returns an Observable that does a single emit
 *  containing the array of buckets
 *
 * @see {@link groupBy}
 * @see {@link partition}
 * @see {@link splitBy}
 */
export function buckets<T>(bucketCount: number, options: BucketsOptions<T> = {}): OperatorFunction<T, Observable<T>[]> {
  const { hashFn = Number, connector = () => new Subject() } = options;

  return operate((source, subscriber) => {
    const { subjects, bucketFor, observables } = indexedBuckets(bucketCount, hashFn, connector);
    const observers = [...subjects, subscriber];
    const connection = new OperatorSubscriber<T>(
      subscriber,
      (value) => {
        try {
          bucketFor(value).next(value);
        } catch (e) {
          observers.forEach((observer) => observer.error(e));
        }
      },
      () => void observers.forEach((observer) => observer.complete()),
      (err) => void observers.forEach((observer) => observer.error(err))
    );

    subscriber.next(observables);

    if (!connection.closed) {
      source.subscribe(connection);
    }
  });
}

function indexedBuckets<T>(
  bucketCount: number,
  hashFn: (value: T) => number,
  connector: (bucketIndex: number) => Subject<T>
): {
  subjects: Subject<T>[];
  bucketFor: (value: T) => Subject<T>;
  observables: Observable<T>[];
} {
  const subjects = new Array(bucketCount).fill(undefined).map((_, index) => connector(index));
  const bucketFor = (value: T) => subjects[Math.abs(Math.floor(hashFn(value))) % bucketCount];
  const observables = [...subjects];

  return { subjects, bucketFor, observables };
}
