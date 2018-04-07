import { Observable, SchedulerLike, NEVER } from 'rxjs';

export class NeverObservable<T> extends Observable<T> {
  static create<T>() {
    return NEVER;
  }
}