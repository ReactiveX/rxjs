
import { Observable } from '../../Observable';
import { asyncScheduler } from '../../scheduler/asyncScheduler';
import { SchedulerLike, Operation } from '../../types';
import { scan } from '../scan';
import { defer } from '../../create/defer';
import { map } from '../map';

export function timeInterval<T>(scheduler: SchedulerLike = asyncScheduler): Operation<T, TimeInterval<T>> {
  return (source: Observable<T>) => defer(() => {
    return source.pipe(
      scan(
        ({ current }, value) => ({ value, current: scheduler.now(), last: current }),
        { current: scheduler.now(), value: undefined,  last: undefined }
      ),
      map(({ current, last, value }) => new TimeInterval(value, current - last)),
    );
  });
}

export class TimeInterval<T> {
  constructor(public value: T, public interval: number) {}
}
