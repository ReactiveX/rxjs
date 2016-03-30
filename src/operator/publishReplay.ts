import {ReplaySubject} from '../ReplaySubject';
import {Scheduler} from '../Scheduler';
import {multicast} from './multicast';
import {ConnectableObservable} from '../observable/ConnectableObservable';

/**
 * @param bufferSize
 * @param windowTime
 * @param scheduler
 * @return {ConnectableObservable<T>}
 * @method publishReplay
 * @owner Observable
 */
export function publishReplay<T>(bufferSize: number = Number.POSITIVE_INFINITY,
                                 windowTime: number = Number.POSITIVE_INFINITY,
                                 scheduler?: Scheduler): ConnectableObservable<T> {
  return multicast.call(this, new ReplaySubject<T>(bufferSize, windowTime, scheduler));
}

export interface PublishReplaySignature<T> {
  (bufferSize?: number, windowTime?: number, scheduler?: Scheduler): ConnectableObservable<T>;
}
