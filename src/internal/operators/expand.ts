/** @prettier */
import { MonoTypeOperatorFunction, OperatorFunction, ObservableInput, SchedulerLike } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/from';

/* tslint:disable:max-line-length */
export function expand<T, R>(
  project: (value: T, index: number) => ObservableInput<R>,
  concurrent?: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, R>;
export function expand<T>(
  project: (value: T, index: number) => ObservableInput<T>,
  concurrent?: number,
  scheduler?: SchedulerLike
): MonoTypeOperatorFunction<T>;
/* tslint:enable:max-line-length */

/**
 * Recursively projects each source value to an Observable which is merged in
 * the output Observable.
 *
 * <span class="informal">It's similar to {@link mergeMap}, but applies the
 * projection function to every source value as well as every output value.
 * It's recursive.</span>
 *
 * ![](expand.png)
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an Observable, and then merging those resulting Observables and
 * emitting the results of this merger. *Expand* will re-emit on the output
 * Observable every source value. Then, each output value is given to the
 * `project` function which returns an inner Observable to be merged on the
 * output Observable. Those output values resulting from the projection are also
 * given to the `project` function to produce new output values. This is how
 * *expand* behaves recursively.
 *
 * ## Example
 * Start emitting the powers of two on every click, at most 10 of them
 * ```ts
 * import { fromEvent, of } from 'rxjs';
 * import { expand, mapTo, delay, take } from 'rxjs/operators';
 *
 * const clicks = fromEvent(document, 'click');
 * const powersOfTwo = clicks.pipe(
 *   mapTo(1),
 *   expand(x => of(2 * x).pipe(delay(1000))),
 *   take(10),
 * );
 * powersOfTwo.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link mergeMap}
 * @see {@link mergeScan}
 *
 * @param {function(value: T, index: number) => Observable} project A function
 * that, when applied to an item emitted by the source or the output Observable,
 * returns an Observable.
 * @param {number} [concurrent=Infinity] Maximum number of input
 * Observables being subscribed to concurrently.
 * @param {SchedulerLike} [scheduler=null] The {@link SchedulerLike} to use for subscribing to
 * each projected inner Observable.
 * @return {Observable} An Observable that emits the source values and also
 * result of applying the projection function to each value emitted on the
 * output Observable and merging the results of the Observables obtained
 * from this transformation.
 * @name expand
 */
export function expand<T, R>(
  project: (value: T, index: number) => ObservableInput<R>,
  concurrent = Infinity,
  scheduler?: SchedulerLike
): OperatorFunction<T, R> {
  concurrent = (concurrent || 0) < 1 ? Infinity : concurrent;

  return operate((source, subscriber) => {
    // The number of active subscriptions.
    let active = 0;
    // The buffered values that we will subscribe to.
    let buffer: (T | R)[] = [];
    // An index to pass to the projection function.
    let index = 0;
    // Whether or not the source has completed.
    let isComplete = false;

    /**
     * Emits the given value, then projects it into an inner observable which
     * is then subscribed to for the expansion.
     * @param value the value to emit and start the expansion with
     */
    const emitAndExpand = (value: T | R) => {
      subscriber.next(value as R);
      // Doing the `from` and `project` here so that it is caught by the
      // try/catch in our OperatorSubscriber. Otherwise, if we were to inline
      // this in `doSub` below, if it is called with a scheduler, errors thrown
      // would be out-of-band with the try/catch and we would have to do the
      // try catching manually there. While this does mean we have to potentially
      // keep a larger allocation (the observable) in memory, the tradeoff is it
      // keeps the size down.
      // TODO: Correct the types here. `project` could be R or T.
      const inner = innerFrom(project(value as any, index++));
      active++;
      const doSub = () => {
        inner.subscribe(
          new OperatorSubscriber(subscriber, next, undefined, () => {
            --active === 0 && isComplete && !buffer.length ? subscriber.complete() : trySub();
          })
        );
      };

      scheduler ? subscriber.add(scheduler.schedule(doSub)) : doSub();
    };

    /**
     * Tries to dequeue a value from the buffer, if there is one, and
     * process it.
     */
    const trySub = () => {
      // It seems like here we could just make the assumption that we've arrived here because
      // we need to start one more expansion because one has just completed. However, it's
      // possible, due to scheduling, that multiple inner subscriptions could complete and we
      // could need to start more than one inner subscription from our buffer. Hence the loop.
      while (0 < buffer.length && active < concurrent) {
        emitAndExpand(buffer.shift()!);
      }
    };

    /**
     * Handle the next value. Captured here because this is called "recursively" by both incoming
     * values from the source, and values emitted by the expanded inner subscriptions.
     * @param value The value to process
     */
    const next = (value: T | R) => (active < concurrent ? emitAndExpand(value) : buffer.push(value));

    // subscribe to our source.
    source.subscribe(
      new OperatorSubscriber(subscriber, next, undefined, () => {
        isComplete = true;
        active === 0 && subscriber.complete();
      })
    );

    return () => {
      // Release buffered values.
      buffer = null!;
    };
  });
}
