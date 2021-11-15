import { Observable } from './Observable';
import { SafeSubscriber } from './Subscriber';
import { AbortError } from './util/AbortError';
import { EmptyError } from './util/EmptyError';
import { linkSignalToSubscription } from './util/linkSignalToSubscription';

export interface LastValueFromConfig<T> {
  defaultValue?: T;
  signal?: AbortSignal;
}

export function lastValueFrom<T, D>(source: Observable<T>, config: { defaultValue: D; signal?: AbortSignal }): Promise<T | D>;
export function lastValueFrom<T>(source: Observable<T>, config: { signal?: AbortSignal }): Promise<T>;
export function lastValueFrom<T>(source: Observable<T>): Promise<T>;

/**
 * Converts an observable to a promise by subscribing to the observable,
 * waiting for it to complete, and resolving the returned promise with the
 * last value from the observed stream.
 *
 * If the observable stream completes before any values were emitted, the
 * returned promise will reject with {@link EmptyError} or will resolve
 * with the default value if a default was specified.
 *
 * If the observable stream emits an error, the returned promise will reject
 * with that error.
 *
 * **WARNING**: Only use this with observables you *know* will complete. If the source
 * observable does not complete, you will end up with a promise that is hung up, and
 * potentially all of the state of an async function hanging out in memory. To avoid
 * this situation, look into adding something like {@link timeout}, {@link take},
 * {@link takeWhile}, or {@link takeUntil} amongst others.
 *
 * ### Example
 *
 * Wait for the last value from a stream and emit it from a promise in
 * an async function.
 *
 * ```ts
 * import { interval, lastValueFrom } from 'rxjs';
 * import { take } from 'rxjs/operators';
 *
 * async function execute() {
 *   const source$ = interval(2000).pipe(take(10));
 *   const finalNumber = await lastValueFrom(source$);
 *   console.log(`The final number is ${finalNumber}`);
 * }
 *
 * execute();
 *
 * // Expected output:
 * // "The final number is 9"
 * ```
 *
 * @see {@link firstValueFrom}
 *
 * @param source the observable to convert to a promise
 * @param config a configuration object to define the `defaultValue` to use if the source completes without emitting a value
 */
export function lastValueFrom<T, D>(source: Observable<T>, config?: LastValueFromConfig<D>): Promise<T | D> {
  return new Promise<T | D>((resolve, reject) => {
    // We must track if we have a value or not, because if
    // we don't, then the promised value never arrived.
    let _hasValue = false;
    let _value: T;
    const subscriber = new SafeSubscriber<T>({
      next: (value) => {
        // We have a value! The promise can resolve later.
        _value = value;
        _hasValue = true;
      },
      error: reject,
      complete: () => {
        if (_hasValue) {
          // Happy path.
          resolve(_value);
        } else if (config && 'defaultValue' in config) {
          // The observable was empty, but we have a default value we'd like to emit.
          resolve(config.defaultValue!);
        } else {
          // if the observable is empty, and we don't have a default value, we'll reject with an EmptyError
          // because promises _must_ resolve or reject. We cannot just leave this hanging.
          reject(new EmptyError());
        }
      },
    });

    const signal = config?.signal;
    if (signal) {
      // The user provided an abort signal. Wire it up. The
      // subscriber *is* the subscription.
      linkSignalToSubscription(signal, subscriber, () => {
        reject(new AbortError());
      });
    }

    // Start the subscription. We are not keeping the subscription returned
    // because it's technically the same instance as the subscriber.
    source.subscribe(subscriber);
  });
}
