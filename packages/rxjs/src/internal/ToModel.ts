import type { MonoTypeOperatorFunction, Subscriber } from 'rxjs';
import { Observable } from 'rxjs';

export type Constructor<T> = { new (...args: any[]): T };

/**
 * Transforms an observable stream by mapping emitted values to instances of a specified model.
 * This function takes a constructor as a parameter and returns a MonoTypeOperatorFunction,
 * which can be used to convert emitted values into instances of the specified class.
 *
 * @param {Constructor<T>} Constructor - The constructor function used to create model instances from emitted values.
 * @returns {MonoTypeOperatorFunction<T>} A function that takes an observable and transforms its emitted values.
 */
export function toModel<T>(Constructor: Constructor<T>): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) =>
    new Observable<T>((subscriber: Subscriber<T>) => {
      // Subscribe to the source observable
      source.subscribe({
        // On receiving new data, instantiate the constructor with the data and emit it
        next(data: T): void {
          subscriber.next(new Constructor(data));
        },
        // Propagate errors to the subscriber
        error(err): void {
          subscriber.error(err);
        },
        // Signal completion to the subscriber
        complete(): void {
          subscriber.complete();
        },
      });
    });
}
