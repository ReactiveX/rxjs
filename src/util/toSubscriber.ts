import {PartialObserver} from '../Observer';
import {Subscriber} from '../Subscriber';
import {$$rxSubscriber} from '../symbol/rxSubscriber';

export function toSubscriber<T>(
  nextOrObserver?: PartialObserver<T> | ((value: T) => void),
  error?: (error: any) => void,
  complete?: () => void): Subscriber<T> {

  if (nextOrObserver && typeof nextOrObserver === 'object') {
    if (nextOrObserver instanceof Subscriber) {
      return (<Subscriber<T>> nextOrObserver);
    } else if (typeof nextOrObserver[$$rxSubscriber] === 'function') {
      return nextOrObserver[$$rxSubscriber]();
    }
  }

  return new Subscriber(nextOrObserver, error, complete);
}
