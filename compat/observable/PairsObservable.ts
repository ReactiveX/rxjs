import { Observable, SchedulerLike, pairs } from 'rxjs';

export class PairsObservable<T> extends Observable<T> {
  static create<T>(obj: Object, scheduler?: SchedulerLike): Observable<(string | T)[]> {
    return pairs(obj, scheduler);
  }
}