import { Subscriber } from '../Subscriber';
import { rxSubscriber as rxSubscriberSymbol } from '../symbol/rxSubscriber';
import { ErrorObserver } from '../types';

/**
 * Determines whether the ErrorObserver is closed or stopped or has a
 * destination that is closed or stopped - in which case errors will
 * need to be reported via a different mechanism.
 * @param observer the observer
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
