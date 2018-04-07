import { Observable, SchedulerLike, bindNodeCallback } from 'rxjs';

export class BoundNodeCallbackObservable<T> extends Observable<T> {
  /* tslint:disable:max-line-length */
  static create<R>(callbackFunc: (callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: SchedulerLike): () => Observable<R>;
  static create<T, R>(callbackFunc: (v1: T, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: SchedulerLike): (v1: T) => Observable<R>;
  static create<T, T2, R>(callbackFunc: (v1: T, v2: T2, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: SchedulerLike): (v1: T, v2: T2) => Observable<R>;
  static create<T, T2, T3, R>(callbackFunc: (v1: T, v2: T2, v3: T3, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: SchedulerLike): (v1: T, v2: T2, v3: T3) => Observable<R>;
  static create<T, T2, T3, T4, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: SchedulerLike): (v1: T, v2: T2, v3: T3, v4: T4) => Observable<R>;
  static create<T, T2, T3, T4, T5, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: SchedulerLike): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => Observable<R>;
  static create<T, T2, T3, T4, T5, T6, R>(callbackFunc: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6, callback: (err: any, result: R) => any) => any, selector?: void, scheduler?: SchedulerLike): (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => Observable<R>;
  static create<T>(callbackFunc: Function, selector?: void, scheduler?: SchedulerLike): (...args: any[]) => Observable<T>;
  static create<T>(callbackFunc: Function, selector?: (...args: any[]) => T, scheduler?: SchedulerLike): (...args: any[]) => Observable<T>;
  /* tslint:enable:max-line-length */
  static create<T>(func: Function,
                   selector: Function | void = undefined,
                   scheduler?: SchedulerLike): (...args: any[]) => Observable<T> {
    return bindNodeCallback(func, <any>selector, scheduler);
  }
}
