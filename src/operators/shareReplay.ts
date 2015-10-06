import Observable from '../Observable';
import Scheduler from '../Scheduler';
import publishReplay from './publishReplay';

export default function shareReplay<T>(bufferSize: number = Number.POSITIVE_INFINITY,
                                       windowTime: number = Number.POSITIVE_INFINITY,
                                       scheduler?: Scheduler) {
  return publishReplay.call(this, bufferSize, windowTime, scheduler).refCount();
}
