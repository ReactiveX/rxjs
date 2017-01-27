import { Observable } from '../Observable';
import { root } from '../util/root';

/* tslint:disable:max-line-length */
export function toPromise<T>(this: Observable<T>): Promise<T>;
export function toPromise<T>(this: Observable<T>, PromiseCtor: typeof Promise): Promise<T>;
/* tslint:disable:max-line-length */

/**
 * Converts an Observable sequence to a ES2015 compliant promise.
 *
 * @example
 * // Using normal ES2015
 * let source = Rx.Observable
 *   .just(42)
 *   .toPromise();
 *
 * source.then((value) => console.log('Value: %s', value));
 * // => Value: 42
 *
 * // Rejected Promise
 * // Using normal ES2015
 * let source = Rx.Observable
 *   .throw(new Error('woops'))
 *   .toPromise();
 *
 * source
 *   .then((value) => console.log('Value: %s', value))
 *   .catch((err) => console.log('Error: %s', err));
 * // => Error: Error: woops
 *
 * // Setting via the config
 * Rx.config.Promise = RSVP.Promise;
 *
 * let source = Rx.Observable
 *   .of(42)
 *   .toPromise();
 *
 * source.then((value) => console.log('Value: %s', value));
 * // => Value: 42
 *
 * // Setting via the method
 * let source = Rx.Observable
 *   .just(42)
 *   .toPromise(RSVP.Promise);
 *
 * source.then((value) => console.log('Value: %s', value));
 * // => Value: 42
 *
 * @param PromiseCtor promise The constructor of the promise. If not provided,
 * it will look for a constructor first in Rx.config.Promise then fall back to
 * the native Promise constructor if available.
 * @return {Promise<T>} An ES2015 compatible promise with the last value from
 * the observable sequence.
 * @method toPromise
 * @owner Observable
 */
export function toPromise<T>(this: Observable<T>, PromiseCtor?: typeof Promise): Promise<T> {
  if (!PromiseCtor) {
    if (root.Rx && root.Rx.config && root.Rx.config.Promise) {
      PromiseCtor = root.Rx.config.Promise;
    } else if (root.Promise) {
      PromiseCtor = root.Promise;
    }
  }

  if (!PromiseCtor) {
    throw new Error('no Promise impl found');
  }

  return new PromiseCtor((resolve, reject) => {
    let value: any;
    this.subscribe((x: T) => value = x, (err: any) => reject(err), () => resolve(value));
  });
}
