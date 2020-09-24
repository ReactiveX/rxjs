/** @prettier */
import { Observable } from '../Observable';
import { ReplaySubject } from '../ReplaySubject';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { UnaryFunction, MonoTypeOperatorFunction, OperatorFunction, SchedulerLike, ObservableInput, ObservedValueOf } from '../types';
import { isFunction } from '../util/isFunction';

/* tslint:disable:max-line-length */
export function publishReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
export function publishReplay<T, O extends ObservableInput<any>>(
  bufferSize?: number,
  windowTime?: number,
  selector?: (shared: Observable<T>) => O,
  scheduler?: SchedulerLike
): OperatorFunction<T, ObservedValueOf<O>>;
/* tslint:enable:max-line-length */

export function publishReplay<T, R>(
  bufferSize?: number,
  windowTime?: number,
  selectorOrScheduler?: SchedulerLike | OperatorFunction<T, R>,
  scheduler?: SchedulerLike
): UnaryFunction<Observable<T>, ConnectableObservable<R>> {
  if (selectorOrScheduler && !isFunction(selectorOrScheduler)) {
    scheduler = selectorOrScheduler;
  }

  const selector = isFunction(selectorOrScheduler) ? selectorOrScheduler : undefined;
  const subject = new ReplaySubject<T>(bufferSize, windowTime, scheduler);

  return (source: Observable<T>) => multicast(() => subject, selector!)(source) as ConnectableObservable<R>;
}
