import { Observable } from './Observable';
import { EmptyError } from './util/EmptyError';
import { SafeSubscriber } from './Subscriber';
import { AbortError } from './util/AbortError';
import { linkSignalToSubscription } from './util/linkSignalToSubscription';

export interface FirstValueFromConfig<T> {
  defaultValue?: T;
  signal?: AbortSignal;
}

export function firstValueFrom<T, D>(source: Observable<T>, config: { defaultValue: D; signal?: AbortSignal }): Promise<T | D>;
export function firstValueFrom<T, D>(source: Observable<T>, config: { signal?: AbortSignal }): Promise<T>;
export function firstValueFrom<T>(source: Observable<T>): Promise<T>;

/**
 * Converts an observable to a promise by subscribing to the observable,
 * and returning a promise that will resolve as soon as the first value
 * arrives from the observable. The subscription will then be closed.
 *
 * If the observable stream completes before any values were emitted, the
 * returned promise will reject with {@link EmptyError} or will resolve
 * with the default value if a default was specified.
 *
 * If the observable stream emits an error, the returned promise will reject
 * with that error.
 *
 * **WARNING**: Only use this with observables you *know* will emit at least one value,
 * *OR* complete. If the source observable does not emit one value or complete, you will
 * end up with a promise that is hung up, and potentially all of the state of an
 * async function hanging out in memory. To avoid this situation, look into adding
 * something like {@link timeout}, {@link take}, {@link takeWhile}, or {@link takeUntil}
 * amongst others.
 *
 * ### Example
 *
 * Wait for the first value from a stream and emit it from a promise in
 * an async function.
 *
 * ```ts
 * import { interval, firstValueFrom } from 'rxjs';
 *
 * async function execute() {
 *   const source$ = interval(2000);
 *   const firstNumber = await firstValueFrom(source$);
 *   console.log(`The first number is ${firstNumber}`);
 * }
 *
 * execute();
 *
 * // Expected output:
 * // "The first number is 0"
 * ```
 *
 * @see {@link lastValueFrom}
 *
 * @param source the observable to convert to a promise
 * @param config a configuration object to define the `defaultValue` to use if the source completes without emitting a value
 */
export function firstValueFrom<T, D>(source: Observable<T>, config?: FirstValueFromConfig<D>): Promise<T | D> {
  return new Promise<T | D>((resolve, reject) => {
    // This is creating our subscriber, which is also our subscription.
    const subscriber = new SafeSubscriber<T>({
      next: (value) => {
        // We have a value, unsubscribe as soon as we can and then emit.
        subscriber.unsubscribe();
        resolve(value);
      },
      error: reject,
      complete: () => {
        // We should never hit complete if we have a value! This is because we're unsubscribing
        // as soon as we get a value in `next`. Therefore any call that lands here means the
        // promised value never arrived.
        if (config && 'defaultValue' in config) {
          // If they gave use a default value it, resolve the promise with that.
          resolve(config.defaultValue!);
        } else {
          // Otherwise, reject with an empty error because promises *must* resolve or reject.
          // If we don't reject here, it will leave our promise hanging and any other promises
          // that were built off of it will never resolve or reject, either.
          reject(new EmptyError());
        }
      },
    });
    const signal = config?.signal;
    if (signal) {
      // The user provided an abort signal, wire it up.
      linkSignalToSubscription(signal, subscriber, () => {
        reject(new AbortError());
      });
    }

    // Start our subscription. Notice we are not capturing the returned subscription
    // because it's technically the same instance as the `subscriber` above.
    source.subscribe(subscriber);
  });
}
