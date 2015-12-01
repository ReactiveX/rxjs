import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {SymbolShim} from '../util/SymbolShim';
import {Subscription} from '../Subscription';
import {InnerSubscriber} from '../InnerSubscriber';
import {OuterSubscriber} from '../OuterSubscriber';

const isArray = Array.isArray;

export function subscribeToResult<T, R>(outerSubscriber: OuterSubscriber<T, R>,
                                        result: any,
                                        outerValue?: T,
                                        outerIndex?: number): Subscription<T> {
  let destination: Subscriber<R> = new InnerSubscriber(outerSubscriber, outerValue, outerIndex);

  if (destination.isUnsubscribed) {
    return;
  }

  if (result instanceof Observable) {
    if (result._isScalar) {
      destination.next(result.value);
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
  } else if (typeof result.then === 'function') {
    result.then(x => {
      if (!destination.isUnsubscribed) {
        destination.next(x);
        destination.complete();
      }
    }, err => destination.error(err))
    .then(null, err => {
      // Escaping the Promise trap: globally throw unhandled errors
      setTimeout(() => { throw err; });
    });
    return destination;
  } else if (typeof result[SymbolShim.iterator] === 'function') {
    for (let item of result) {
      destination.next(item);
      if (destination.isUnsubscribed) {
        break;
      }
    }
    if (!destination.isUnsubscribed) {
      destination.complete();
    }
  } else if (typeof result[SymbolShim.observable] === 'function') {
    const obs = result[SymbolShim.observable]();
    if (typeof obs.subscribe !== 'function') {
      destination.error('invalid observable');
    } else {
      return obs.subscribe(new InnerSubscriber(outerSubscriber, outerValue, outerIndex));
    }
  } else {
    destination.error(new TypeError('unknown type returned'));
  }
}