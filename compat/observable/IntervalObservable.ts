import { Observable, SchedulerLike, asyncScheduler, interval } from 'rxjs';

export class IntervalObservable<T> extends Observable<T> {
  static create(period: number = 0,
                scheduler: SchedulerLike = asyncScheduler): Observable<number> {
    return interval(period, scheduler);
  }
}