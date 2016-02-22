import {Observable} from '../Observable';
import {publishReplay} from './publishReplay';
import {Scheduler} from '../Scheduler';
import {ConnectableObservable} from '../observable/ConnectableObservable';

/**
 * @param bufferSize
 * @param windowTime
 * @param scheduler
 * @return {Observable<any>}
 * @method cache
 * @owner Observable
 */
export function cache<T>(bufferSize: number = Number.POSITIVE_INFINITY,
                         windowTime: number = Number.POSITIVE_INFINITY,
                         scheduler?: Scheduler): Observable<T> {
  return (<ConnectableObservable<any>>publishReplay.call(this, bufferSize, windowTime, scheduler)).refCount();
}

export interface CacheSignature<T> {
  (bufferSize?: number, windowTime?: number, scheduler?: Scheduler): Observable<T>;
}
