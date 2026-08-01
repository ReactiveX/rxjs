import { installObservableExtension } from './util/install-observable-extension.js';
import { createDerivedObservable, runWithErrorForwarding, subscribeToSource } from './util/observable-helpers.js';

export const map: unique symbol = Symbol('map');

declare global {
  interface Observable<T> {
    [map]: {
      <R>(project: (value: T, index: number) => R): Observable<R>;
      <R, A>(project: (this: A, value: T, index: number) => R, thisArg: A): Observable<R>;
    };
  }
}

function mapOperator<T, R>(this: Observable<T>, project: (value: T, index: number) => R): Observable<R>;
function mapOperator<T, R, A>(this: Observable<T>, project: (this: A, value: T, index: number) => R, thisArg: A): Observable<R>;
function mapOperator<T, R, A>(
  this: Observable<T>,
  project: (this: A | undefined, value: T, index: number) => R,
  thisArg?: A
): Observable<R> {
  return createDerivedObservable({
    receiver: this,
    init: (subscriber) => {
      let index = 0;

      subscribeToSource({
        source: this,
        subscriber,
        next: (value) => {
          const result = runWithErrorForwarding({
            subscriber,
            run: () => project.call(thisArg, value, index++),
          });
          if (result.ok) {
            subscriber.next(result.value);
          }
        },
      });
    },
  });
}

installObservableExtension({ instance: mapOperator, name: 'map', symbol: map });
