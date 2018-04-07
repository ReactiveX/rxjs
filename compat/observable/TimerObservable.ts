import { Observable, SchedulerLike, timer } from 'rxjs';

export class TimerObservable<T> extends Observable<T> {
  static create(initialDelay: number | Date = 0,
                period?: number | SchedulerLike,
                scheduler?: SchedulerLike): Observable<number> {
    return timer(initialDelay, period, scheduler);
  }
}