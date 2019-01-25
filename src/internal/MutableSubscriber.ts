import { Subscription } from 'rxjs/internal/Subscription';
import { PartialObserver } from 'rxjs/internal/types';
import { noop } from 'rxjs/internal/util/noop';
import { hostReportError } from 'rxjs/internal/util/hostReportError';

export class MutableSubscriber<T> {
  closed = false;
  subscription = new Subscription();

  constructor(
    public next: (value: T) => void,
    public error: (err: any) => void,
    public complete: () => void,
  ) {
    this.subscription.add(() => this.closed = true);
  }
}

export class MutableObserverSubscriber<T> extends MutableSubscriber<T> {
  constructor(observer: PartialObserver<T>) {
    super(
      observer.next ? (value: T) => {
        if (!this.closed) {
          observer.next(value, this.subscription);
        }
      } : noop,
      (err: any) => {
        if (!this.closed) {
          this.closed = true;
          if (observer.error) {
            observer.error(err);
          } else {
            hostReportError(err);
          }
          this.subscription.unsubscribe();
        } else {
          hostReportError(new Error('Multiple errors at: Your face')); // TODO: make this match v6
        }
      },
      () => {
        if (!this.closed) {
          this.closed = true;
          observer.complete && observer.complete();
          this.subscription.unsubscribe();
        }
      }
    );
  }
}

export function mutableSubscriberFromCallbacks<T>(
  next?: (value: T, subscription: Subscription) => void,
  error?: (err: any) => void,
  complete?: () => void,
) {
  return new MutableObserverSubscriber({
    next, error, complete,
  });
}
