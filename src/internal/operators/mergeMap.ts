/** @prettier */
import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { ObservableInput, OperatorFunction, ObservedValueOf } from '../types';
import { map } from './map';
import { from } from '../observable/from';
import { lift } from '../util/lift';
import { innerSubscribe, SimpleOuterSubscriber, SimpleInnerSubscriber } from '../innerSubscribe';

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
  return (source: Observable<T>) =>
    lift(source, function (this: Subscriber<ObservedValueOf<O>>, source: Observable<T>) {
      const subscriber = this;
      // Whether or not the outer subscription is complete
      let isComplete = false;
      // The number of active inner subscriptions
      let active = 0;
      // The index of the value from source (used for projection)
      let index = 0;
      // The buffered values from the source (used for concurrency)
      let buffer: T[] = [];

      /**
       * Attempts to start an inner subscription from a buffered value,
       * so long as we don't have more active inner subscriptions than
       * the concurrency limit allows.
       */
      const doInnerSub = () => {
        while (active < concurrent && buffer.length > 0) {
          const value = buffer.shift()!;

          // Get the inner source from the projection function
          let innerSource: Observable<ObservedValueOf<O>>;
          try {
            innerSource = from(project(value, index++));
          } catch (err) {
            subscriber.error(err);
            return;
          }

          // Subscribe to the inner source
          active++;
          let innerSubs: Subscription;
          subscriber.add(
            (innerSubs = innerSource.subscribe(
              new MergeMapSubscriber(
                subscriber,
                (innerValue) => {
                  // INNER SOURCE NEXT
                  // We got a value from the inner source, emit it from the result.
                  subscriber.next(innerValue);
                },
                () => {
                  // INNER SOURCE COMPLETE
                  // Decrement the active count to ensure that the next time
                  // we try to call `doInnerSub`, the number is accurate.
                  active--;
                  if (buffer.length > 0) {
                    // If we have more values in the buffer, try to process those
                    // Note that this call will increment `active` ahead of the
                    // next conditional, if there were any more inner subscriptions
                    // to start.
                    doInnerSub();
                  }
                  if (isComplete && active === 0) {
                    // If the outer is complete, and there are no more active,
                    // then we can complete the resulting observable subscription
                    subscriber.complete();
                  }
                  // Make sure to teardown the inner subscription ASAP.
                  innerSubs?.unsubscribe();
                }
              )
            ))
          );
        }
      };

      let outerSubs: Subscription;
      outerSubs = source.subscribe(
        new MergeMapSubscriber(
          subscriber,
          (value) => {
            // OUTER SOURCE NEXT
            // Push the value onto the buffer. We have no idea what the concurrency limit
            // is and we don't care. Just buffer it and then call `doInnerSub()` to try to
            // process what is in the buffer.
            buffer.push(value);
            doInnerSub();
          },
          () => {
            // OUTER SOURCE COMPLETE
            // We don't necessarily stop here. If have any pending inner subscriptions
            // we need to wait for those to be done first. That includes buffered inners
            // that we haven't even subscribed to yet.
            isComplete = true;
            if (active === 0 && buffer.length === 0) {
              // Nothing is active, and nothing in the buffer, with no hope of getting any more
              // we can complete the result
              subscriber.complete();
            }
            // Be sure to teardown the outer subscription ASAP, in any case.
            outerSubs?.unsubscribe();
          }
        )
      );
    });
}

// TODO(benlesh): This may end up being so common that we can centralize on one Subscriber for a few operators.

/**
 * A simple overridden Subscriber, used in both inner and outer subscriptions
 */
class MergeMapSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<any>, protected _next: (value: T) => void, protected _complete: () => void) {
    super(destination);
  }
}

/**
 * @deprecated renamed. Use {@link mergeMap}.
 */
export const flatMap = mergeMap;
