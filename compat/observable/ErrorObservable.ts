import { Observable, SchedulerLike, throwError } from 'rxjs';

export class ErrorObservable<T> extends Observable<T> {
  static create<T>(error: any, scheduler?: SchedulerLike) {
    return throwError(error, scheduler);
  }
}
