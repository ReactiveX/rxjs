import {Observable} from '../Observable';
import {ReplaySubject} from '../subjects/ReplaySubject';
import {Scheduler} from '../Scheduler';
import {multicast} from './multicast';

export function publishReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: Scheduler): Observable<T>;
export function publishReplay<T>(bufferSize: number = Number.POSITIVE_INFINITY,
                                 windowTime: number = Number.POSITIVE_INFINITY,
                                 scheduler?: Scheduler): Observable<T> {
  return multicast.call(this, new ReplaySubject(bufferSize, windowTime, scheduler));
}
