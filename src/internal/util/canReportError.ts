import { Subscriber } from '../Subscriber';
import { rxSubscriber as rxSubscriberSymbol } from '../symbol/rxSubscriber';
import { ErrorObserver } from '../types';

/**
 * Reports the error to the ErrorObserver unless the observer is closed or
 * stopped - in which case, an alternative reporting mechanism is used.
 * @param err the error to report
 */
export function canReportError(observer: ErrorObserver<any>): boolean {
  while (observer) {
    const { closed, destination, isStopped } = observer as any;
    if (closed || isStopped) {
      return false;
    } else if (destination instanceof Subscriber || (destination && destination[rxSubscriberSymbol])) {
      observer = destination;
    } else {
      observer = null;
    }
  }
  return true;
}
