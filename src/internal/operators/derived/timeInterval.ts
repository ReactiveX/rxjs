
import { Observable } from 'rxjs/internal/Observable';
import { asyncScheduler } from 'rxjs/internal/scheduler/asyncScheduler';
import { SchedulerLike, Operation } from 'rxjs/internal/types';
import { scan } from 'rxjs/internal/operators/scan';
import { defer } from 'rxjs/internal/create/defer';
import { map } from 'rxjs/internal/operators/map';

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
