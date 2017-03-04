import { Observable } from '../Observable';
import { multicast } from './multicast';
import { ReplaySubject } from '../ReplaySubject';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { IScheduler } from '../Scheduler';

/**
 * @method shareReplay
 * @owner Observable
 */
export function shareReplay<T>(
  this: Observable<T>,
  bufferSize?: number,
  windowTime?: number,
  scheduler?: IScheduler
): Observable<T> {
  let subject: ReplaySubject<T>;
  const connectable = multicast.call(this, function shareReplaySubjectFactory(this: ConnectableObservable<T>) {
    if (this._isComplete) {
      return subject;
    } else {
      return (subject = new ReplaySubject<T>(bufferSize, windowTime, scheduler));
    }
  });
  return connectable.refCount();
};