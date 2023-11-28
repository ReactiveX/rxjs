import type { Observable, Subject, Subscription } from 'rxjs';
import { Subscriber } from 'rxjs';

/**
 * Returns an observable that will be deemed by this package's implementation
 * to be an observable that requires interop. The returned observable will fail
 * the `instanceof Observable` test and will deem any `Subscriber` passed to
 * its `subscribe` method to be untrusted.
 */
export function asInteropObservable<T>(observable: Observable<T>): Observable<T> {
  return new Proxy(observable, {
    get(target: Observable<T>, key: string | number | symbol) {
      if (key === 'subscribe') {
        const { subscribe } = target;
        return interopSubscribe(subscribe);
      }
      return Reflect.get(target, key);
    },
    getPrototypeOf(target: Observable<T>) {
      const { lift, subscribe, ...rest } = Object.getPrototypeOf(target);
      return {
        ...rest,
        subscribe: interopSubscribe(subscribe)
      };
    }
  });
}

/**
 * Returns a subject that will be deemed by this package's implementation to
 * be untrusted. The returned subject will not include the symbol that
 * identifies trusted subjects.
 */
export function asInteropSubject<T>(subject: Subject<T>): Subject<T> {
  return asInteropSubscriber(subject as any) as any;
}

/**
 * Returns a subscriber that will be deemed by this package's implementation to
 * be untrusted. The returned subscriber will fail the `instanceof Subscriber`
 * test and will not include the symbol that identifies trusted subscribers.
 */
export function asInteropSubscriber<T>(subscriber: Subscriber<T>): Subscriber<T> {
  return new Proxy(subscriber, {
    get(target: Subscriber<T>, key: string | number | symbol) {
      return Reflect.get(target, key);
    },
    getPrototypeOf(target: Subscriber<T>) {
      const { ...rest } = Object.getPrototypeOf(target);
      return rest;
    }
  });
}

function interopSubscribe<T>(subscribe: (...args: any[]) => Subscription) {
  return function (this: Observable<T>, ...args: any[]): Subscription {
    const [arg] = args;
    if (arg instanceof Subscriber) {
      return subscribe.call(this, asInteropSubscriber(arg));
    }
    return subscribe.apply(this, args);
  };
}
