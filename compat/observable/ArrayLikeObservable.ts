import { Observable, SchedulerLike, from } from 'rxjs';

export class ArrayLikeObservable<T> extends Observable<T> {
  static create<T>(arrayLike: ArrayLike<T>, scheduler?: SchedulerLike): Observable<T> {
    return from(arrayLike, scheduler);
  }
}