import { Observable, SchedulerLike, empty } from 'rxjs';

export class EmptyObservable<T> extends Observable<T> {
  static create<T>(scheduler?: SchedulerLike): Observable<T> {
    return empty(scheduler);
  }
}