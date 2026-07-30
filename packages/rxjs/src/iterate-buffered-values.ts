import '@rxjs/observable-polyfill';
import { bufferedValuesAsyncGenerator } from './util/observable-async-generators.js';

/**
 * Iterates lossless snapshots of values accumulated while the consumer is
 * between iterations.
 *
 * Calling this method creates a fresh, one-shot async generator but does not
 * subscribe immediately. The subscription begins when the generator is first
 * advanced. Values delivered in one synchronous turn are coalesced through a
 * microtask and yielded together. The buffer is unbounded, so a producer that
 * persistently outruns a consumer can still create memory pressure.
 *
 * Every generator owns its own buffer and source observer. For a platform
 * Observable, whether native or fallback, the first active generator starts
 * the source producer and concurrently active generators join that same
 * shared, ref-counted producer. Their buffers are independent, but a late
 * generator sees only values emitted after it joins. Closing the last
 * generator ends the active producer; a later iteration starts a new producer
 * run.
 *
 * With `ColdObservable`, every generator creates an independent producer run,
 * so each buffer reflects that separate run rather than a shared timeline.
 * This method deliberately preserves the receiver's subscription lifecycle.
 *
 * Breaking out of `for await...of`, throwing from the loop body, or explicitly
 * closing the generator aborts its source observer. Source completion flushes
 * an accepted final buffer before ending. A source error is thrown after an
 * already accepted buffer has been yielded.
 *
 * @example
 * ```ts
 * for await (const values of source[iterateBufferedValues]()) {
 *   console.log(values);
 * }
 * ```
 */
export const iterateBufferedValues: unique symbol = Symbol('iterateBufferedValues');

declare global {
  interface Observable<T> {
    [iterateBufferedValues]: () => AsyncGenerator<T[], void, void>;
  }
}

Observable.prototype[iterateBufferedValues] = function <T>(this: Observable<T>): AsyncGenerator<T[], void, void> {
  return bufferedValuesAsyncGenerator(this);
};
