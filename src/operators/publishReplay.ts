import ReplaySubject from '../subjects/ReplaySubject';
import Scheduler from '../Scheduler';
import multicast from './multicast';

export default function publishReplay(bufferSize: number = Number.POSITIVE_INFINITY,
                                      windowTime: number = Number.POSITIVE_INFINITY,
                                      scheduler?: Scheduler) {
  return multicast.call(this,
    () => new ReplaySubject(bufferSize, windowTime, scheduler)
  );
}