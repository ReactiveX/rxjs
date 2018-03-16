import { Observable } from '../Observable';
import { ReplaySubject } from '../ReplaySubject';
import { MonoTypeOperatorFunction, SchedulerLike } from '../types';
import { Subscriber } from '../Subscriber';

/**
 * @method shareReplay
 * @owner Observable
 */
export function shareReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike ): MonoTypeOperatorFunction<T> {
  return function shareReplayFunction(source: Observable<T>) {
    return source.lift(shareReplayOperator(bufferSize, windowTime, scheduler));
  };
}

function shareReplayOperator<T>(bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike) {
  let subject: ReplaySubject<T>;
  let hasError = false;

  return function shareReplayOperation(this: Subscriber<T>, source: Observable<T>) {
    if (!subject || hasError) {
      hasError = false;
      subject = new ReplaySubject<T>(bufferSize, windowTime, scheduler);
      source.subscribe({
        next(value) { subject.next(value); },
        error(err) {
          hasError = true;
          subject.error(err);
        },
        complete() {
          subject.complete();
        },
      });
    }

    subject.subscribe(this);
  };
}
