import {root} from './root';
import {isArray} from './isArray';
import {isPromise} from './isPromise';
import {Subscriber} from '../Subscriber';
import {Observable, ObservableInput} from '../Observable';
import {$$iterator} from '../symbol/iterator';
import {Subscription} from '../Subscription';
import {InnerSubscriber} from '../InnerSubscriber';
import {OuterSubscriber} from '../OuterSubscriber';

import * as $$observable from 'symbol-observable';

export function subscribeToResult<T, R>(outerSubscriber: OuterSubscriber<T, R>,
                                        result: any,
                                        outerValue?: T,
                                        outerIndex?: number): Subscription;
export function subscribeToResult<T>(outerSubscriber: OuterSubscriber<any, any>,
                                     result: ObservableInput<T>,
                                     outerValue?: T,
                                     outerIndex?: number): Subscription {
  let destination: Subscriber<any> = new InnerSubscriber(outerSubscriber, outerValue, outerIndex);

  if (destination.isUnsubscribed) {
    return;
  }

  if (result instanceof Observable) {
    if (result._isScalar) {
      destination.next((<any>result).value);
      destination.complete();
      return;
    } else {
      return result.subscribe(destination);
    }
  }

  if (isArray(result)) {
    for (let i = 0, len = result.length; i < len && !destination.isUnsubscribed; i++) {
      destination.next(result[i]);
    }
    if (!destination.isUnsubscribed) {
      destination.complete();
    }
  } else if (isPromise(result)) {
    result.then(
      (value) => {
        if (!destination.isUnsubscribed) {
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
    for (let item of <any>result) {
      destination.next(<any>item);
      if (destination.isUnsubscribed) {
        break;
      }
    }
    if (!destination.isUnsubscribed) {
      destination.complete();
    }
  } else if (typeof result[$$observable] === 'function') {
    const obs = result[$$observable]();
    if (typeof obs.subscribe !== 'function') {
      destination.error('invalid observable');
    } else {
      return obs.subscribe(new InnerSubscriber(outerSubscriber, outerValue, outerIndex));
    }
  } else {
    destination.error(new TypeError('unknown type returned'));
  }
}
