import Observable from '../Observable';
import Scheduler from '../Scheduler';
import { ObserveOnOperator } from './observeOn-support';

export default function observeOn<T>(scheduler: Scheduler, delay: number = 0): Observable<T> {
  return this.lift(new ObserveOnOperator(scheduler, delay));
}