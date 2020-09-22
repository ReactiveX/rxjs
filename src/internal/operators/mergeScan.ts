/** @prettier */
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { ObservableInput, OperatorFunction } from '../types';
import { lift } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { from } from '../observable/from';

/**
 * Applies an accumulator function over the source Observable where the
 * accumulator function itself returns an Observable, then each intermediate
 * Observable returned is merged into the output Observable.
 *
 * <span class="informal">It's like {@link scan}, but the Observables returned
 * by the accumulator are merged into the outer Observable.</span>
 *
 * ## Example
 * Count the number of click events
 * ```ts
 * import { fromEvent, of } from 'rxjs';
 * import { mapTo, mergeScan } from 'rxjs/operators';
 *
 * const click$ = fromEvent(document, 'click');
 * const one$ = click$.pipe(mapTo(1));
 * const seed = 0;
 * const count$ = one$.pipe(
 *   mergeScan((acc, one) => of(acc + one), seed),
 * );
 * count$.subscribe(x => console.log(x));
 *
 * // Results:
 * // 1
 * // 2
 * // 3
 * // 4
 * // ...and so on for each click
 * ```
 *
 * @param {function(acc: R, value: T): Observable<R>} accumulator
 * The accumulator function called on each source value.
 * @param seed The initial accumulation value.
 * @param {number} [concurrent=Infinity] Maximum number of
 * input Observables being subscribed to concurrently.
 * @return {Observable<R>} An observable of the accumulated values.
 * @name mergeScan
 */
export function mergeScan<T, R>(
  accumulator: (acc: R, value: T, index: number) => ObservableInput<R>,
  seed: R,
  concurrent = Infinity
): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    lift(source, function (this: Subscriber<R>, source: Observable<T>) {
      const subscriber = this;
      // Buffered values, in the event of going over our concurrency limit
      let buffer: T[] = [];
      // The number of active inner subscriptions.
      let active = 0;
      // Whether or not we have gotten any accumulated state. This is used to
      // decide whether or not to emit in the event of an empty result.
      let hasState = false;
      // The accumulated state.
      let state = seed;
      // An index to pass to our accumulator function
      let index = 0;
      // Whether or not the outer source has completed.
      let isComplete = false;

      /**
       * Checks to see if we can complete our result or not.
       */
      const checkComplete = () => {
        // If the outer has completed, and nothing is left in the buffer,
        // and we don't have any active inner subscriptions, then we can
        // Emit the state and complete.
        if (isComplete && !buffer.length && !active) {
          // TODO: This seems like it might result in a double emission, perhaps bad behavior?
          // maybe we should change this in an upcoming major?
          !hasState && subscriber.next(state);
          subscriber.complete();
        }
      };

      const nextSourceValue = (value: T) => {
        // If we're under our concurrency limit, go ahead and
        // call the accumulator and subscribe to the result.
        if (active < concurrent) {
          active++;
          from(accumulator(state!, value, index++)).subscribe(
            new OperatorSubscriber(
              subscriber,
              (innerValue) => {
                hasState = true;
                // Intentially terse. Set the state, then emit it.
                subscriber.next((state = innerValue));
              },
              // Errors are passed to the destination.
              undefined,
              () => {
                // The inner completed, decrement the number of actives.
                active--;
                // If we have anything in the buffer, process it, otherwise check to see if we can complete.
                buffer.length ? nextSourceValue(buffer.shift()!) : checkComplete();
              }
            )
          );
        } else {
          // We're over our concurrency limit, push it onto the buffer to be
          // process later when one of our inners completes.
          buffer.push(value);
        }
      };

      source.subscribe(
        new OperatorSubscriber(
          subscriber,
          nextSourceValue,
          // Errors are passed through
          undefined,
          () => {
            // Outer completed, make a note of it, and check to see if we can complete everything.
            isComplete = true;
            checkComplete();
          }
        )
      );

      // Additional teardown (for when the destination is torn down).
      // Other teardown is added implicitly via subscription above.
      return () => {
        // Ensure buffered values are released.
        buffer = null!;
      };
    });
}
