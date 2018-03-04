import { Operator } from '../Operator';
import { Observable } from '../Observable';
import { ReplaySubject } from '../ReplaySubject';
import { IScheduler } from '../Scheduler';
import { Subscription } from '../Subscription';
import { MonoTypeOperatorFunction, TeardownLogic } from '../types';
import { Subscriber } from '../Subscriber';

/**
 * @method shareReplay
 * @owner Observable
 */
export function shareReplay<T>(bufferSize?: number, windowTime?: number, scheduler?: IScheduler ): MonoTypeOperatorFunction<T> {
  return function shareReplayFunction(source: Observable<T>) {
    return source.lift(shareReplayOperator(bufferSize, windowTime, scheduler));
  };
}

function shareReplayOperator<T>(bufferSize?: number, windowTime?: number, scheduler?: IScheduler) {
  let subject: ReplaySubject<T>;
  let refCount = 0;
  let subscription: Subscription;
  let hasError = false;
  let isComplete = false;

  function removeSubscriber() {
    refCount--;
    if (subscription && refCount === 0 && isComplete) {
      subscription.unsubscribe();
    }
  }

  return function shareReplayOperation(this: Subscriber<T>, source: Observable<T>) {
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

    subject.subscribe(new ShareReplaySubscriber(this, removeSubscriber));
  };
}

class ShareReplaySubscriber<T> extends Subscriber<T> {
  constructor(
    destination: Subscriber<T>,
    protected onUnsubscribe: () => void,
  ) {
    super(destination);
  }

  protected _unsubscribe() {
    this.onUnsubscribe();
  }
}
