import {SubjectSubscriber} from 'rxjs/Subject';
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

  if (nextOrObserver) {
    if (nextOrObserver instanceof Subscriber) {
      return (<Subscriber<T>>nextOrObserver);
    }
    if ((nextOrObserver as any).constructor
      && (nextOrObserver as any).constructor.name.indexOf('Subject') !== -1) {
      return new SubjectSubscriber(nextOrObserver as any) as any;
    }
  }

  if (!nextOrObserver && !error && !complete) {
    return new Subscriber(emptyObserver);
  }

  return new Subscriber(nextOrObserver, error, complete);
}
