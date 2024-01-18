import { from } from '@rxjs/observable';
import { observeOn } from '../operators/observeOn.js';
import { subscribeOn } from '../operators/subscribeOn.js';
import type { InteropObservable, SchedulerLike } from '../types.js';

export function scheduleObservable<T>(input: InteropObservable<T>, scheduler: SchedulerLike) {
  return from(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
}
