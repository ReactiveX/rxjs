import Observable from '../Observable';
import Scheduler from '../Scheduler';
import publishBehavior from './publishBehavior';

export default function shareBehavior<T>(value: T): Observable<T> {
  return publishBehavior.call(this, value).refCount();
}