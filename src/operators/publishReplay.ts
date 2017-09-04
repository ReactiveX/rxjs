import { Observable } from '../Observable';
import { ReplaySubject } from '../ReplaySubject';
import { IScheduler } from '../Scheduler';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { UnaryFunction } from '../interfaces';

export function publishReplay<T>(bufferSize: number = Number.POSITIVE_INFINITY,
                                 windowTime: number = Number.POSITIVE_INFINITY,
                                 scheduler?: IScheduler): UnaryFunction<Observable<T>, ConnectableObservable<T>> {
  return (source: Observable<T>) => multicast(new ReplaySubject<T>(bufferSize, windowTime, scheduler))(source) as ConnectableObservable<T>;
}
