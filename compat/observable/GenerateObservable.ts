import { Observable, SchedulerLike, generate } from 'rxjs';
import { ConditionFunc, IterateFunc, ResultFunc, GenerateBaseOptions, GenerateOptions } from 'rxjs/internal-compatibility';

export class GenerateObservable<T> extends Observable<T> {
  /* tslint:disable:max-line-length */
  static create<T, S>(initialState: S, condition: ConditionFunc<S>, iterate: IterateFunc<S>, resultSelector: ResultFunc<S, T>, scheduler?: SchedulerLike): Observable<T>;
  static create<S>(initialState: S, condition: ConditionFunc<S>, iterate: IterateFunc<S>, scheduler?: SchedulerLike): Observable<S>;
  static create<S>(options: GenerateBaseOptions<S>): Observable<S>;
  static create<T, S>(options: GenerateOptions<T, S>): Observable<T>;
  /* tslint:enable:max-line-length */

  static create<T, S>(initialStateOrOptions: S | GenerateOptions<T, S>,
                      condition?: ConditionFunc<S>,
                      iterate?: IterateFunc<S>,
                      resultSelectorOrObservable?: (ResultFunc<S, T>) | SchedulerLike,
                      scheduler?: SchedulerLike): Observable<T> {
    return generate(<S>initialStateOrOptions, condition, iterate, <ResultFunc<S, T>>resultSelectorOrObservable, scheduler);
  }
}