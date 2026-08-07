import { create } from './create.js';
import { Notification, type ObservableNotification } from './notification.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const materialize: unique symbol = Symbol('materialize');

declare global {
  interface Observable<T> {
    [materialize](): Observable<Notification<T> & ObservableNotification<T>>;
  }
}

Observable.prototype[materialize] = function <T>(this: Observable<T>): Observable<Notification<T> & ObservableNotification<T>> {
  return this[create]((subscriber) => {
    subscribeToSource(this, subscriber, {
      next: (value) => subscriber.next(Notification.createNext(value)),
      error: (error) => {
        subscriber.next(Notification.createError<T>(error));
        subscriber.complete();
      },
      complete: () => {
        subscriber.next(Notification.createComplete<T>());
        subscriber.complete();
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `materialize` form of the exact-Symbol `[materialize]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[materialize]` to its source.
 */
export function pipeableMaterialize<T>(): (source: Observable<T>) => Observable<Notification<T> & ObservableNotification<T>>;
export function pipeableMaterialize(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[materialize] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
