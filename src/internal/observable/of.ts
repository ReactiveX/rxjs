import { SchedulerLike } from '../types';
import { isScheduler } from '../util/isScheduler';
import { fromArray } from './fromArray';
import { empty } from './empty';
import { scalar } from './scalar';
import { Observable } from '../Observable';

export function of<T>(a: T, scheduler?: SchedulerLike): Observable<T>;
export function of<T, T2>(a: T, b: T2, scheduler?: SchedulerLike): Observable<T | T2>;
export function of<T, T2, T3>(a: T, b: T2, c: T3, scheduler?: SchedulerLike): Observable<T | T2 | T3>;
export function of<T, T2, T3, T4>(a: T, b: T2, c: T3, d: T4, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4>;
export function of<T, T2, T3, T4, T5>(a: T, b: T2, c: T3, d: T4, e: T5, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
export function of<T, T2, T3, T4, T5, T6>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, scheduler?: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
export function of<T, T2, T3, T4, T5, T6, T7>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, scheduler?: SchedulerLike):
  Observable<T | T2 | T3 | T4 | T5 | T6 | T7>;
export function of<T, T2, T3, T4, T5, T6, T7, T8>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, h: T8, scheduler?: SchedulerLike):
  Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
export function of<T, T2, T3, T4, T5, T6, T7, T8, T9>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, h: T8, i: T9, scheduler?: SchedulerLike):
  Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
export function of<T>(...args: Array<T | SchedulerLike>): Observable<T>;
export function of<T>(...args: Array<T | SchedulerLike>): Observable<T> {
  let scheduler = args[args.length - 1] as SchedulerLike;
  if (isScheduler(scheduler)) {
    args.pop();
  } else {
    scheduler = undefined;
  }
  switch (args.length) {
    case 0:
      return empty(scheduler);
    case 1:
      return scheduler ? fromArray(args as T[], scheduler) : scalar(args[0] as T);
    default:
      return fromArray(args as T[], scheduler);
  }
}
