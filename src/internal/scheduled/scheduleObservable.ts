import { from } from '../observable/from';
import { observeOn } from '../operators/observeOn';
import { subscribeOn } from '../operators/subscribeOn';
import { InteropObservable, SchedulerLike } from '../types';

export function scheduleObservable<T>(input: InteropObservable<T>, scheduler: SchedulerLike) {
  return from(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
}
