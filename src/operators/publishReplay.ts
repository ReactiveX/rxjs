import {ConnectableObservable} from '../observables/ConnectableObservable';
import {ReplaySubject} from '../subjects/ReplaySubject';
import {Scheduler} from '../Scheduler';
import {multicast} from './multicast';

export function publishReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: Scheduler): ConnectableObservable<T>;
export function publishReplay<T>(bufferSize: number = Number.POSITIVE_INFINITY,
                                 windowTime: number = Number.POSITIVE_INFINITY,
                                 scheduler?: Scheduler): ConnectableObservable<T> {
  return multicast.call(this, new ReplaySubject(bufferSize, windowTime, scheduler));
}
