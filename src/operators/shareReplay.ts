import { Observable } from '../Observable';
import { multicast } from './multicast';
import { refCount } from './refCount';
import { ReplaySubject } from '../ReplaySubject';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { IScheduler } from '../Scheduler';

import { MonoTypeOperatorFunction } from '../interfaces';

/**
 * @method shareReplay
 * @owner Observable
 */
export function shareReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: IScheduler ): MonoTypeOperatorFunction<T> {
  let subject: ReplaySubject<T>;

  const connectable = multicast(function shareReplaySubjectFactory(this: ConnectableObservable<T>) {
    if (this._isComplete) {
      return subject;
    } else {
      return (subject = new ReplaySubject<T>(bufferSize, windowTime, scheduler));
    }
  });
  return (source: Observable<T>) => refCount()(connectable(source));
};