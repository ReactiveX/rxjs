/** @prettier */

import { Subject } from '../Subject';

import { MonoTypeOperatorFunction, OperatorFunction, SubjectLike } from '../types';
import { Subscription } from '../Subscription';
import { from } from '../observable/from';
import { operate } from '../util/lift';

export interface ShareConfig<T> {
  /**
   * The factory used to create the subject that will connect the source observable to
   * multicast consumers.
   */
  connector?: () => SubjectLike<T>;
  /**
   * If true, the resulting observable will reset internal state on error from source and return to a "cold" state. This
   * allows the resulting observable to be "retried" in the event of an error.
   * If false, when an error comes from the source it will push the error into the connecting subject, and the subject
   * will remain the connecting subject, meaning the resulting observable will not go "cold" again, and subsequent retries
   * or resubscriptions will resubscribe to that same subject. In all cases, RxJS subjects will emit the same error again, however
   * {@link ReplaySubject} will also push its buffered values before pushing the error.
   */
  resetOnError?: boolean;
  /**
   * If true, the resulting observable will reset internal state on completion from source and return to a "cold" state. This
   * allows the resulting observable to be "repeated" after it is done.
   * If false, when the source completes, it will push the completion through the connecting subject, and the subject
   * will remain the connecting subject, meaning the resulting observable will not go "cold" again, and subsequent repeats
   * or resubscriptions will resubscribe to that same subject.
   */
  resetOnComplete?: boolean;
  /**
   * If true, when the number of subscribers to the resulting observable reaches zero due to those subscribers unsubscribing, the
   * internal state will be reset and the resulting observable will return to a "cold" state. This means that the next
   * time the resulting observable is subscribed to, a new subject will be created and the source will be subscribed to
   * again.
   * If false, when the number of subscribers to the resulting observable reaches zero due to unsubscription, the subject
   * will remain connected to the source, and new subscriptions to the result will be connected through that same subject.
   */
  resetOnRefCountZero?: boolean;
}

export function share<T>(): MonoTypeOperatorFunction<T>;

export function share<T>(options: ShareConfig<T>): MonoTypeOperatorFunction<T>;

/**
 * Returns a new Observable that multicasts (shares) the original Observable. As long as there is at least one
 * Subscriber this Observable will be subscribed and emitting data. When all subscribers have unsubscribed it will
 * unsubscribe from the source Observable. Because the Observable is multicasting it makes the stream `hot`.
 * This is an alias for `multicast(() => new Subject()), refCount()`.
 *
 * ![](share.png)
 *
 * ## Example
 * Generate new multicast Observable from the source Observable value
 * ```ts
 * import { interval } from 'rxjs';
 * import { share, map } from 'rxjs/operators';
 *
 * const source = interval(1000)
 *   .pipe(
 *         map((x: number) => {
 *             console.log('Processing: ', x);
 *             return x*x;
 *         }),
 *         share()
 * );
 *
 * source.subscribe(x => console.log('subscription 1: ', x));
 * source.subscribe(x => console.log('subscription 1: ', x));
 *
 * // Logs:
 * // Processing:  0
 * // subscription 1:  0
 * // subscription 1:  0
 * // Processing:  1
 * // subscription 1:  1
 * // subscription 1:  1
 * // Processing:  2
 * // subscription 1:  4
 * // subscription 1:  4
 * // Processing:  3
 * // subscription 1:  9
 * // subscription 1:  9
 * // ... and so on
 * ```
 */
export function share<T>(options?: ShareConfig<T>): OperatorFunction<T, T> {
  options = options || {};
  const { connector = () => new Subject<T>(), resetOnComplete = true, resetOnError = true, resetOnRefCountZero = true } = options;

  let connection: Subscription | null = null;
  let subject: SubjectLike<T> | null = null;
  let refCount = 0;
  let hasCompleted = false;
  let hasErrored = false;

  const reset = () => {
    connection = subject = null;
    hasCompleted = hasErrored = false;
  };

  return operate((source, subscriber) => {
    refCount++;
    if (!subject) {
      subject = connector!();
    }

    const castSubscription = subject.subscribe(subscriber);

    if (!connection) {
      connection = from(source).subscribe({
        next: (value) => subject!.next(value),
        error: (err) => {
          hasErrored = true;
          const dest = subject!;
          if (resetOnError) {
            reset();
          }
          dest.error(err);
        },
        complete: () => {
          hasCompleted = true;
          const dest = subject!;
          if (resetOnComplete) {
            reset();
          }
          dest.complete();
        },
      });
    }

    return () => {
      refCount--;
      castSubscription.unsubscribe();
      if (!refCount && resetOnRefCountZero && !hasErrored && !hasCompleted) {
        const conn = connection;
        reset();
        conn?.unsubscribe();
      }
    };
  });
}
