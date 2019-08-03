import {Subject} from '../Subject';
import {Subscriber} from '../Subscriber';
import {rxSubscriber as rxSubscriberSymbol} from '../symbol/rxSubscriber';
import {empty as emptyObserver} from '../Observer';
import {PartialObserver} from '../types';

export function toSubscriber<T>(
  nextOrObserver?: PartialObserver<T> | ((value: T) => void),
  error?: (error: any) => void,
  complete?: () => void
): Subscriber<T> {

  if (nextOrObserver instanceof Subscriber) {
    return (<Subscriber<T>>nextOrObserver);
  }

  if (!nextOrObserver && !error && !complete) {
    return new Subscriber(emptyObserver);
  }

  return new Subscriber(nextOrObserver, error, complete);
}
