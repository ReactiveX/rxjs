/** @prettier */
import { Observable } from '../Observable';
import { innerFrom } from '../observable/from';
import { Subscriber } from '../Subscriber';
import { ObservableInput } from '../types';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * A process embodying the general "merge" strategy. This is used in
 * `mergeMap` and `mergeScan` because the logic is otherwise nearly identical.
 * @param source The original source observable
 * @param subscriber The consumer subscriber
 * @param project The projection function to get our inner sources
 * @param concurrent The number of concurrent inner subscriptions
 * @param onBeforeNext Additional logic to apply before nexting to our consumer
 * @param onBeforeComplete Additional logic to apply before telling the consumer we're complete.
 */
export function mergeInternals<T, R>(
  source: Observable<T>,
  subscriber: Subscriber<R>,
  project: (value: T, index: number) => ObservableInput<R>,
  concurrent: number,
  onBeforeNext?: (innerValue: R) => void,
  onBeforeComplete?: () => void
) {
  // Buffered values, in the event of going over our concurrency limit
  let buffer: T[] = [];
  // The number of active inner subscriptions.
  let active = 0;
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
      // In the case of `mergeScan`, we need additional handling here.
      onBeforeComplete?.();
      subscriber.complete();
    }
  };

  const doInnerSub = (value: T) => {
    active++;
    innerFrom(project(value, index++)).subscribe(
      new OperatorSubscriber(
        subscriber,
        (innerValue) => {
          // `mergeScan` has additional handling here. For example
          // taking the inner value and updating state.
          onBeforeNext?.(innerValue);
          subscriber.next(innerValue);
        },
        // Errors are passed to the destination.
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
          while (buffer.length && active < concurrent) {
            doInnerSub(buffer.shift()!);
          }
          // Check to see if we can complete, and complete if so.
          checkComplete();
        }
      )
    );
  };

  // Subscribe to our source observable.
  source.subscribe(
    new OperatorSubscriber(
      subscriber,
      // If we're under our concurrency limit, just start the inner subscription, otherwise buffer and wait.
      (value) => (active < concurrent ? doInnerSub(value) : buffer.push(value)),
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
}
