
import { isArrayLike } from './isArrayLike';
import { isPromise } from './isPromise';
import { isObject } from './isObject';
import { Observable, ObservableInput } from '../Observable';
import { iterator as Symbol_iterator } from '../symbol/iterator';
import { Subscription } from '../Subscription';
import { InnerSubscriber } from '../InnerSubscriber';
import { OuterSubscriber } from '../OuterSubscriber';
import { observable as Symbol_observable } from '../symbol/observable';
import { subscribeToObservable } from './subscribeToObservable';
import { subscribeToArray } from './subscribeToArray';
import { subscribeToPromise } from './subscribeToPromise';
import { subscribeToIterable } from './subscribeToIterable';

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
      destination.next((result as any).value);
      destination.complete();
      return null;
    } else {
      return result.subscribe(destination);
    }
  } else if (isArrayLike(result)) {
    return subscribeToArray(result)(destination);
  } else if (isPromise(result)) {
    return subscribeToPromise(result as Promise<any>)(destination);
  } else if (result && typeof result[Symbol_iterator] === 'function') {
    return subscribeToIterable(result as any)(destination);
  } else if (result && typeof result[Symbol_observable] === 'function') {
    return subscribeToObservable(result as any)(destination);
  } else {
    const value = isObject(result) ? 'an invalid object' : `'${result}'`;
    const msg = `You provided ${value} where a stream was expected.`
      + ' You can provide an Observable, Promise, Array, or Iterable.';
    destination.error(new TypeError(msg));
  }
  return null;
}
