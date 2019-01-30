import { Observable, SchedulerLike, from } from 'rxjs';

export class IteratorObservable<T> extends Observable<T> {
  static create<T>(iterable: Iterable<T>, scheduler?: SchedulerLike) {
    return from(iterable, scheduler);
  }
}
