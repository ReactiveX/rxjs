import {Observer} from '../Observer';
import {Subscriber} from '../Subscriber';
import {rxSubscriber} from '../symbol/rxSubscriber';

export function toSubscriber<T>(
  next?: Observer<T> | ((value: T) => void),
  error?: (error: any) => void,
  complete?: () => void): Subscriber<T> {

  if (next && typeof next === 'object') {
    if (next instanceof Subscriber) {
      return (<Subscriber<T>> next);
    } else if (typeof next[rxSubscriber] === 'function') {
      return next[rxSubscriber]();
    } else {
      return new Subscriber(<Observer<T>> next);
    }
  }

  return Subscriber.create(<((value: T) => void)> next, error, complete);
}
