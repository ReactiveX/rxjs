import { Subscriber } from '../Subscriber';
import { rxSubscriber as rxSubscriberSymbol } from '../symbol/rxSubscriber';
import { ErrorObserver } from '../types';

/**
 * Reports the error to the ErrorObserver unless the observer is closed or
 * stopped - in which case, an alternative reporting mechanism is used.
 * @param err the error to report
 */
export function reportError(err: any, observer: ErrorObserver<any>): void {
  if (canReportError(observer)) {
     observer.error(err);
  } else {
    consoleWarn(err);
  }
}

function canReportError(observer: ErrorObserver<any>): boolean {
  const { closed, destination, isStopped } = observer as any;
  if (closed || isStopped) {
    return false;
  } else if (destination instanceof Subscriber || (destination && destination[rxSubscriberSymbol])) {
    return canReportError(destination);
  }
  return true;
}

function consoleWarn(err: any): void {
  if (console.warn) {
    console.warn(err);
  } else {
    console.log(err);
  }
}
