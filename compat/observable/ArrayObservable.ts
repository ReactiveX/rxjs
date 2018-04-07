import { Observable, SchedulerLike, from } from 'rxjs';

export class ArrayObservable<T> extends Observable<T> {
  static create<T>(array: T[], scheduler?: SchedulerLike) {
    return from(array, scheduler);
  }
}