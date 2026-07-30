import '@rxjs/observable-polyfill';
import { latestValueAsyncGenerator } from './util/observable-async-generators.js';

/**
 * Iterates the latest unread source value and intentionally drops superseded
 * values.
 *
 * Calling this method creates a fresh, one-shot async generator but does not
 * subscribe immediately. The subscription begins when the generator is first
 * advanced. While the consumer is busy, each source value replaces the
 * preceding unread value. Same-turn emissions are coalesced through a
 * microtask, so only the final value in that burst is yielded.
 *
 * Every generator owns its own latest-value slot and source observer. For a
 * platform Observable, whether native or fallback, the first active generator
 * starts the source producer and concurrently active generators join that same
 * shared, ref-counted producer. A late generator has no access to values
 * emitted before it joined. Closing the last generator ends the active
 * producer; a later iteration starts a new producer run.
 *
 * `ColdObservable` instead starts an independent producer run for every
 * generator. Each iterator's latest-value slot is then driven by its own run.
 * This method deliberately preserves the receiver's subscription lifecycle.
 *
 * Breaking out of `for await...of`, throwing from the loop body, or explicitly
 * closing the generator aborts its source observer. Source completion yields
 * an accepted latest value before ending. A source error is thrown after an
 * already accepted latest value has been yielded.
 *
 * @example
 * ```ts
 * for await (const value of source[iterateLatestValue]()) {
 *   console.log(value);
 * }
 * ```
 */
export const iterateLatestValue: unique symbol = Symbol('iterateLatestValue');

declare global {
  interface Observable<T> {
    [iterateLatestValue]: () => AsyncGenerator<T, void, void>;
  }
}

Observable.prototype[iterateLatestValue] = function <T>(this: Observable<T>): AsyncGenerator<T, void, void> {
  return latestValueAsyncGenerator(this);
};
