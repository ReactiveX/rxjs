import { Observable } from './Observable';
import { EmptyError } from './util/EmptyError';
import { SafeSubscriber } from './Subscriber';

/**
 * Converts an observable to a promise by subscribing to the observable,
 * and returning a promise that will resolve as soon as the first value
 * arrives from the observable. The subscription will then be closed.
 *
 * If the observable stream completes before any values were emitted, the
 * returned promise will reject with {@link EmptyError}.
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
 *    const source$ = interval(2000);
 *    const firstNumber = await firstValueFrom(source$);
 *    console.log(`The first number is ${firstNumber}`);
 * }
 *
 * execute();
 *
 * // Expected output:
 * // "The first number is 0"
 * ```
 *
 * @param source the observable to convert to a promise
 */
export function firstValueFrom<T>(source: Observable<T>) {
  return new Promise<T>((resolve, reject) => {
    const subscriber = new SafeSubscriber<T>({
      next: value => {
        resolve(value);
        subscriber.unsubscribe();
      },
      error: reject,
      complete: () => {
        reject(new EmptyError());
      },
    });
    source.subscribe(subscriber);
  });
}
