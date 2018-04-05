import { Observable, SchedulerLike, range } from 'rxjs';

export class RangeObservable<T> extends Observable<T> {
  static create(start: number = 0,
                count: number = 0,
                scheduler?: SchedulerLike): Observable<number> {
    return range(start, count, scheduler);
  }
}