import { empty } from '../Observer';
import { ErrorObserver } from '../types';

/**
 * Reports the error to the ErrorObserver unless the observer is closed or
 * stopped - in which case, an alternative reporting mechanism is used.
 * @param err the error to report
 */
export function reportError(err: any, observer: ErrorObserver<any>, report?: (err: any) => void): void {
  if (canReportError(observer)) {
     observer.error(err);
  } else {
    (report || consoleReportError)(err);
  }
}

function canReportError(observer: ErrorObserver<any>): boolean {
  const { closed, destination, isStopped } = observer as any;
  if (closed || isStopped) {
    return false;
  } else if (destination && destination !== empty) {
    return canReportError(destination);
  }
  return true;
}

function consoleReportError(err: any): void {
  if (console.warn) {
    console.warn(err);
  } else {
    console.log(err);
  }
}
