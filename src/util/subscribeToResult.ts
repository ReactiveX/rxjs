import { root } from './root';
import { isArray } from './isArray';
import { isPromise } from './isPromise';
import { Subscriber } from '../Subscriber';
import { Observable, ObservableInput } from '../Observable';
import { $$iterator } from '../symbol/iterator';
import { Subscription } from '../Subscription';
import { InnerSubscriber } from '../InnerSubscriber';
import { OuterSubscriber } from '../OuterSubscriber';
import { $$observable } from '../symbol/observable';

export function subscribeToResult<T, R>(outerSubscriber: OuterSubscriber<T, R>,
                                        result: any,
                                        outerValue?: T,
                                        outerIndex?: number): Subscription;
export function subscribeToResult<T>(outerSubscriber: OuterSubscriber<any, any>,
                                     result: ObservableInput<T>,
                                     outerValue?: T,
                                     outerIndex?: number): Subscription {
  let destination: Subscriber<any> = new InnerSubscriber(outerSubscriber, outerValue, outerIndex);

  if (destination.closed) {
    return null;
  }

  if (result instanceof Observable) {
    if (result._isScalar) {
      destination.next((<any>result).value);
      destination.complete();
      return null;
    } else {
      return result.subscribe(destination);
    }
  }

  if (isArray(result)) {
    for (let i = 0, len = result.length; i < len && !destination.closed; i++) {
      destination.next(result[i]);
    }
    if (!destination.closed) {
      destination.complete();
    }
  } else if (isPromise(result)) {
    result.then(
      (value) => {
        if (!destination.closed) {
          destination.next(<any>value);
          destination.complete();
        }
      },
      (err: any) => destination.error(err)
    )
    .then(null, (err: any) => {
      // Escaping the Promise trap: globally throw unhandled errors
      root.setTimeout(() => { throw err; });
    });
    return destination;
  } else if (typeof result[$$iterator] === 'function') {
    const iterator = <any>result[$$iterator]();
    do {
      let item = iterator.next();
      if (item.done) {
        destination.complete();
        break;
      }
      destination.next(item.value);
      if (destination.closed) {
        break;
      }
    } while (true);
  } else if (typeof result[$$observable] === 'function') {
    const obs = result[$$observable]();
    if (typeof obs.subscribe !== 'function') {
      destination.error(new Error('invalid observable'));
    } else {
      return obs.subscribe(new InnerSubscriber(outerSubscriber, outerValue, outerIndex));
    }
  } else {
    destination.error(new TypeError('unknown type returned'));
  }
  return null;
}
