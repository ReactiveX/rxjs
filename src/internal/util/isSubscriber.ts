import { Subscriber } from '../Subscriber';
import { isSubscription } from '../Subscription';
import { isObserver } from './isObserver';

export function isSubscriber<T>(value: any): value is Subscriber<T> {
  return (value && value instanceof Subscriber) || (isObserver(value) && isSubscription(value));
}
