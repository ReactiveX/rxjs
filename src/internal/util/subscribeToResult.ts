import { root } from './root';
import { isArrayLike } from './isArrayLike';
import { isPromise } from './isPromise';
import { isObject } from './isObject';
import { Observable, ObservableInput } from '../Observable';
import { iterator as Symbol_iterator } from '../symbol/iterator';
import { Subscription } from '../Subscription';
import { InnerSubscriber } from '../InnerSubscriber';
import { OuterSubscriber } from '../OuterSubscriber';
import { observable as Symbol_observable } from '../symbol/observable';
import { Subscriber } from '../Subscriber';

export function subscribeToResult<T, R>(outerSubscriber: OuterSubscriber<T, R>,
                                        result: any,
                                        outerValue?: T,
                                        outerIndex?: number): Subscription;
export function subscribeToResult<T>(outerSubscriber: OuterSubscriber<any, any>,
                                     result: ObservableInput<T>,
                                     outerValue?: T,
                                     outerIndex?: number): Subscription | void {
  const destination = new InnerSubscriber(outerSubscriber, outerValue, outerIndex);

  if (destination.closed) {
    return null;
  }

  if (result instanceof Observable) {
    if (result._isScalar) {
      return subscribeToScalar(result as any, destination);
    } else {
      return result.subscribe(destination);
    }
  } else if (isArrayLike(result)) {
    return subscribeToArray(result as ArrayLike<any>, destination);
  } else if (isPromise(result)) {
    return subscribeToPromise(result as Promise<any>, destination);
  } else if (result && typeof result[Symbol_iterator] === 'function') {
    return subscribeToIteratable(result as any, destination);
  } else if (result && typeof result[Symbol_observable] === 'function') {
    return subscribeToObservable(result as any, new InnerSubscriber(outerSubscriber, outerValue, outerIndex));
  } else {
    const value = isObject(result) ? 'an invalid object' : `'${result}'`;
    const msg = `You provided ${value} where a stream was expected.`
      + ' You can provide an Observable, Promise, Array, or Iterable.';
    destination.error(new TypeError(msg));
  }
  return null;
}

function subscribeToScalar<T>(scalar: { value: T }, subscriber: Subscriber<T>): null {
  subscriber.next(scalar.value);
  subscriber.complete();
  return null;
}

function subscribeToArray<T>(array: ArrayLike<T>, subscriber: Subscriber<T>) {
  for (let i = 0, len = array.length; i < len && !subscriber.closed; i++) {
    subscriber.next(array[i]);
  }
  if (!subscriber.closed) {
    subscriber.complete();
  }
}

function subscribeToPromise<T>(promise: PromiseLike<T>, subscriber: Subscriber<T>): Subscription {
  promise.then(
    (value) => {
      if (!subscriber.closed) {
        subscriber.next(value);
        subscriber.complete();
      }
    },
    (err: any) => subscriber.error(err)
  )
  .then(null, (err: any) => {
    // Escaping the Promise trap: globally throw unhandled errors
    root.setTimeout(() => { throw err; });
  });
  return subscriber;
}

function subscribeToIteratable<T>(iterable: Iterable<T>, subscriber: Subscriber<T>) {
  const iterator = iterable[Symbol_iterator]();
  do {
    let item = iterator.next();
    if (item.done) {
      subscriber.complete();
      break;
    }
    subscriber.next(item.value);
    if (subscriber.closed) {
      break;
    }
  } while (true);
}

function subscribeToObservable<T>(obj: any, subscriber: Subscriber<T>) {
  const obs = obj[Symbol_observable]();
  if (typeof obs.subscribe !== 'function') {
    // Should be caught by observable subscribe function error handling.
    throw new TypeError('Provided object does not correctly implement Symbol.observable');
  } else {
    return obs.subscribe(subscriber);
  }
}
