import '@rxjs/observable-polyfill';
import { nextValueAsyncGenerator } from './util/observable-async-generators.js';

/**
 * Iterates only values that arrive while the consumer is actively waiting for
 * its next result.
 *
 * Calling this method creates a fresh, one-shot async generator but does not
 * subscribe immediately. The subscription begins when the generator is first
 * advanced. The first value received for an outstanding request is yielded;
 * later values are dropped until the consumer advances the generator again.
 * Consequently, a synchronously completing source can finish before the first
 * demand slot is installed and yield no values.
 *
 * Every generator owns its own demand slot and source observer. For a platform
 * Observable, whether native or fallback, the first active generator starts
 * the source producer and concurrently active generators join that same
 * shared, ref-counted producer. A generator joining late waits for a future
 * value; it cannot recover values emitted earlier in the shared run. Closing
 * the last generator ends the active producer, and a later iteration starts a
 * new producer run.
 *
 * With `ColdObservable`, every generator creates an independent producer run.
 * Synchronous values from that run still occur before the first demand slot
 * and are intentionally dropped. This method preserves the receiver's
 * producer lifecycle while retaining its own demand-gated policy.
 *
 * Breaking out of `for await...of`, throwing from the loop body, or explicitly
 * closing the generator aborts its source observer. Source completion ends the
 * iteration, and a source error is thrown from the generator.
 *
 * @example
 * ```ts
 * for await (const value of source[iterateNextValue]()) {
 *   console.log(value);
 * }
 * ```
 */
export const iterateNextValue: unique symbol = Symbol('iterateNextValue');

declare global {
  interface Observable<T> {
    [iterateNextValue]: () => AsyncGenerator<T, void, void>;
  }
}

Observable.prototype[iterateNextValue] = function <T>(this: Observable<T>): AsyncGenerator<T, void, void> {
  return nextValueAsyncGenerator(this);
};
