import { Observable, SchedulerLike, from } from 'rxjs';

export class PromiseObservable<T> extends Observable<T> {
  static create<T>(promise: PromiseLike<T>, scheduler?: SchedulerLike): Observable<T> {
    return from(promise, scheduler);
  }
}