import { Observable, SchedulerLike, from } from 'rxjs';

export class IteratorObservable<T> extends Observable<T> {
  static create<T>(iterator: any, scheduler?: SchedulerLike) {
    return from<T>(iterator, scheduler);
  }
}