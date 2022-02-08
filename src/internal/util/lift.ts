import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { OperatorFunction, Subscribable } from '../types';
import { isFunction } from './isFunction';

/**
 * Used to determine if an object is an Observable with a lift function.
 */
export function hasLift(source: any): source is { lift: InstanceType<typeof Observable>['lift'] } {
  return isFunction(source?.lift);
}

/**
 * Creates an `OperatorFunction`. Used to define operators throughout the library in a concise way.
 * @param init The logic to connect the liftedSource to the subscriber at the moment of subscription.
 */
export function operate<T, R>(
  init: (liftedSource: Observable<T>, subscriber: Subscriber<R>) => (() => void) | void
): OperatorFunction<T, R> {
  return (source: Subscribable<T>) => {
    if (hasLift(source)) {
      // The current v7 path for operators over our own observables.
      return source.lift(function (this: Subscriber<R>, liftedSource: Observable<T>) {
        try {
          return init(liftedSource, this);
        } catch (err) {
          this.error(err);
        }
      }) as Subscribable<R>;
    } else {
      // Allow our operators to handle non-liftable sources.
      const rxSource = fromSubscribable(source);
      return new Observable<R>((ths) => {
        try {
          return init(rxSource as any, ths);
        } catch (err) {
          ths.error(err);
        }
      });
    }
  };
}

function fromSubscribable<T>(source: Subscribable<T>) {
  return new Observable<T>((subscriber) => {
    return source.subscribe(subscriber);
  });
}
