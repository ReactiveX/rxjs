/** @prettier */
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { ObservableInput, OperatorFunction, ObservedValueOf } from '../types';
import { map } from './map';
import { from } from '../observable/from';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/* tslint:disable:max-line-length */
export function mergeMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  concurrent?: number
): OperatorFunction<T, ObservedValueOf<O>>;
/** @deprecated resultSelector no longer supported, use inner map instead */
export function mergeMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector: undefined,
  concurrent?: number
): OperatorFunction<T, ObservedValueOf<O>>;
/** @deprecated resultSelector no longer supported, use inner map instead */
export function mergeMap<T, R, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R,
  concurrent?: number
): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * Projects each source value to an Observable which is merged in the output
 * Observable.
 *
 * <span class="informal">Maps each value to an Observable, then flattens all of
 * these inner Observables using {@link mergeAll}.</span>
 *
 * ![](mergeMap.png)
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an Observable, and then merging those resulting Observables and
 * emitting the results of this merger.
 *
 * ## Example
 * Map and flatten each letter to an Observable ticking every 1 second
 * ```ts
 * import { of, interval } from 'rxjs';
 * import { mergeMap, map } from 'rxjs/operators';
 *
 * const letters = of('a', 'b', 'c');
 * const result = letters.pipe(
 *   mergeMap(x => interval(1000).pipe(map(i => x+i))),
 * );
 * result.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // a0
 * // b0
 * // c0
 * // a1
 * // b1
 * // c1
 * // continues to list a,b,c with respective ascending integers
 * ```
 *
 * @see {@link concatMap}
 * @see {@link exhaustMap}
 * @see {@link merge}
 * @see {@link mergeAll}
 * @see {@link mergeMapTo}
 * @see {@link mergeScan}
 * @see {@link switchMap}
 *
 * @param {function(value: T, ?index: number): ObservableInput} project A function
 * that, when applied to an item emitted by the source Observable, returns an
 * Observable.
 * @param {number} [concurrent=Infinity] Maximum number of input
 * Observables being subscribed to concurrently.
 * @return {Observable} An Observable that emits the result of applying the
 * projection function (and the optional deprecated `resultSelector`) to each item
 * emitted by the source Observable and merging the results of the Observables
 * obtained from this transformation.
 */
export function mergeMap<T, R, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector?: ((outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R) | number,
  concurrent: number = Infinity
): OperatorFunction<T, ObservedValueOf<O> | R> {
  if (typeof resultSelector === 'function') {
    // DEPRECATED PATH
    return (source: Observable<T>) =>
      source.pipe(mergeMap((a, i) => from(project(a, i)).pipe(map((b: any, ii: number) => resultSelector(a, b, i, ii))), concurrent));
  } else if (typeof resultSelector === 'number') {
    concurrent = resultSelector;
  }
  return operate((source, subscriber) => {
    // Whether or not the outer subscription is complete
    let isComplete = false;
    // The number of active inner subscriptions
    let active = 0;
    // The index of the value from source (used for projection)
    let index = 0;
    // The buffered values from the source (used for concurrency)
    let buffer: T[] = [];

    /**
     * Called to check to see if we can complete, and completes the result if
     * nothing is active.
     */
    const checkComplete = () => isComplete && !active && subscriber.complete();

    /**
     * Attempts to start an inner subscription from a buffered value,
     * so long as we don't have more active inner subscriptions than
     * the concurrency limit allows.
     */
    const tryInnerSub = () => {
      while (active < concurrent && buffer.length > 0) {
        doInnerSub(buffer.shift()!);
      }
    };

    /**
     * Creates an inner observable and subscribes to it with the
     * given outer value.
     * @param value the value to process
     */
    const doInnerSub = (value: T) => {
      // Subscribe to the inner source
      active++;
      subscriber.add(
        from(project(value, index++)).subscribe(
          new OperatorSubscriber(
            subscriber,
            // INNER SOURCE NEXT
            // We got a value from the inner source, emit it from the result.
            (innerValue) => subscriber.next(innerValue),
            // Errors are sent to the consumer.
            undefined,
            () => {
              // INNER SOURCE COMPLETE
              // Decrement the active count to ensure that the next time
              // we try to call `doInnerSub`, the number is accurate.
              active--;
              // If we have more values in the buffer, try to process those
              // Note that this call will increment `active` ahead of the
              // next conditional, if there were any more inner subscriptions
              // to start.
              buffer.length && tryInnerSub();
              // Check to see if we can complete, and complete if so.
              checkComplete();
            }
          )
        )
      );
    };

    let outerSubs: Subscription;
    outerSubs = source.subscribe(
      new OperatorSubscriber(
        subscriber,
        // OUTER SOURCE NEXT
        // If we are under our concurrency limit, start the inner subscription with the value
        // right away. Otherwise, push it onto the buffer and wait.
        (value) => (active < concurrent ? doInnerSub(value) : buffer.push(value)),
        // Let errors pass through.
        undefined,
        () => {
          // OUTER SOURCE COMPLETE
          // We don't necessarily stop here. If have any pending inner subscriptions
          // we need to wait for those to be done first. That includes buffered inners
          // that we haven't even subscribed to yet.
          isComplete = true;
          // If nothing is active, and nothing in the buffer, with no hope of getting any more
          // we can complete the result
          checkComplete();
          // Be sure to teardown the outer subscription ASAP, in any case.
          outerSubs?.unsubscribe();
        }
      )
    );

    // Additional teardown. Called when the destination is torn down.
    // Other teardown is registered implicitly above during subscription.
    return () => {
      // Release buffered values
      buffer = null!;
    };
  });
}

/**
 * @deprecated renamed. Use {@link mergeMap}.
 */
export const flatMap = mergeMap;
