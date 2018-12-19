
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { PartialObserver } from './types';
import { noop } from './util/noop';

const DEFAULT_ERROR_HANDLER = (err: any) => {
  setTimeout(() => { throw err; });
};

export class SafeSubscriber<T> extends Subscriber<T> {
  private _next: (value: T, subscription: Subscription) => void;
  private _error: (err: any) => void;
  private _complete: () => void;

  constructor(
    subscription: Subscription,
    nextOrObserver?: PartialObserver<T>|((value: T, subscription: Subscription) => void),
    errorHandler?: (err: any) => void,
    completeHandler?: () => void,
  ) {
    super(subscription);

    if (nextOrObserver && typeof nextOrObserver === 'object') {
      this._next = (nextOrObserver.next || noop).bind(nextOrObserver);
      this._error = (nextOrObserver.error || DEFAULT_ERROR_HANDLER).bind(nextOrObserver);
      this._complete = (nextOrObserver.complete || noop).bind(nextOrObserver);
    } else {
      this._next = (nextOrObserver as any) || noop;
      this._error = errorHandler || DEFAULT_ERROR_HANDLER;
      this._complete = completeHandler || noop;
    }
  }

  next(value: T) {
    if (!this.closed) {
      this._next(value, this._subscription);
    }
  }

  error(err: any) {
    if (!this.closed) {
      this._error(err);
      this._subscription.unsubscribe();
    } else {
      debugger;
      console.warn('Subscription called error multiple times');
    }
  }

  complete() {
    if (!this.closed) {
      this._complete();
      this._subscription.unsubscribe();
    }
  }
}
