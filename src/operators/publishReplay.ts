import { Observable } from '../Observable';
import { ReplaySubject } from '../ReplaySubject';
import { IScheduler } from '../Scheduler';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { UnaryFunction } from '../interfaces';

export function publishReplay<T>(bufferSize: number = Number.POSITIVE_INFINITY,
                                 windowTime: number = Number.POSITIVE_INFINITY,
                                 selector?: (source: Observable<T>) => Observable<T>,
                                 scheduler?: IScheduler): UnaryFunction<Observable<T>, ConnectableObservable<T>> {
  const subject = new ReplaySubject<T>(bufferSize, windowTime, scheduler);
  return (source: Observable<T>) => multicast(() => subject, selector)(source) as ConnectableObservable<T>;
}
