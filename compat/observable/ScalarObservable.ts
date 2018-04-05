import { Observable, SchedulerLike, of } from 'rxjs';

export class ScalarObservable<T> extends Observable<T> {
  static create<T>(value: T, scheduler?: SchedulerLike) {
    return arguments.length > 1 ? of(value, scheduler) : of(value);
  }
}