import { Observable } from '../Observable';
import { ReplaySubject } from '../ReplaySubject';
import { IScheduler } from '../Scheduler';
import { Subscription } from '../Subscription';
import { MonoTypeOperatorFunction } from '../interfaces';
/**
 * @method shareReplay
 * @owner Observable
 */
export function shareReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: IScheduler ): MonoTypeOperatorFunction<T> {
  let subject: ReplaySubject<T>;
  let refCount = 0;
  let subscription: Subscription;
  let hasError = false;
  let isComplete = false;

  return (source: Observable<T>) => new Observable<T>(observer => {
    refCount++;
    if (!subject || hasError) {
      hasError = false;
      subject = new ReplaySubject<T>(bufferSize, windowTime, scheduler);
      subscription = source.subscribe({
        next(value) { subject.next(value); },
        error(err) {
          hasError = true;
          subject.error(err);
        },
        complete() {
          isComplete = true;
          subject.complete();
        },
      });
    }

    const innerSub = subject.subscribe(observer);

    return () => {
      refCount--;
      innerSub.unsubscribe();
      if (subscription && refCount === 0 && isComplete) {
        subscription.unsubscribe();
      }
    };
  });
};
