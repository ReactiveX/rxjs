import '@rxjs/observable-polyfill';
import { eachValueAsyncGenerator } from './util/observable-async-generators.js';

/**
 * Iterates every source value in arrival order without loss.
 *
 * Calling this method creates a fresh, one-shot async generator but does not
 * subscribe immediately. The subscription begins when the generator is first
 * advanced. If the source produces values faster than the consumer advances,
 * unread values remain in an unbounded FIFO queue.
 *
 * Every generator owns its own queue and source observer. For a platform
 * Observable, whether native or fallback, the first active generator starts
 * the source producer and concurrently active generators join that same
 * shared, ref-counted producer. A later generator therefore receives only
 * values emitted after it joins. Closing one generator removes only its
 * observer; closing the last one ends the active producer, and a later
 * iteration starts a new producer run.
 *
 * `ColdObservable` has a different direct-subscription contract: every
 * generator starts an independent producer run and receives that run's full
 * sequence. This method deliberately preserves whichever subscription
 * lifecycle the receiver provides.
 *
 * Breaking out of `for await...of`, throwing from the loop body, or explicitly
 * closing the generator aborts its source observer. Source completion ends the
 * iteration, while a source error is thrown from the generator after already
 * queued values have been yielded.
 *
 * @example
 * ```ts
 * for await (const value of source[iterateEachValue]()) {
 *   console.log(value);
 * }
 * ```
 */
export const iterateEachValue: unique symbol = Symbol('iterateEachValue');

declare global {
  interface Observable<T> {
    [iterateEachValue]: () => AsyncGenerator<T, void, void>;
  }
}

Observable.prototype[iterateEachValue] = function <T>(this: Observable<T>): AsyncGenerator<T, void, void> {
  return eachValueAsyncGenerator(this);
};
