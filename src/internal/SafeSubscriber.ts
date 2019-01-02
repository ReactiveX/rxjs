
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { PartialObserver } from './types';
import { noop } from './util/noop';

const DEFAULT_ERROR_HANDLER = (err: any) => {
  setTimeout(() => { throw err; });
};

export class SafeSubscriber<T> extends Subscriber<T> {
  private __next: (value: T, subscription: Subscription) => void;
  private __error: (err: any) => void;
  private __complete: () => void;

  constructor(
    nextOrObserver?: PartialObserver<T>|((value: T, subscription: Subscription) => void),
    errorHandler?: (err: any) => void,
    completeHandler?: () => void,
  ) {
    super();

    if (nextOrObserver && typeof nextOrObserver === 'object') {
      this.__next = (nextOrObserver.next || noop).bind(nextOrObserver);
      this.__error = (nextOrObserver.error || DEFAULT_ERROR_HANDLER).bind(nextOrObserver);
      this.__complete = (nextOrObserver.complete || noop).bind(nextOrObserver);
    } else {
      this.__next = (nextOrObserver as any) || noop;
      this.__error = errorHandler || DEFAULT_ERROR_HANDLER;
      this.__complete = completeHandler || noop;
    }
  }

  _next(value: T) {
    this.__next(value, this._subscription);
  }

  _error(err: any) {
    this.__error(err);
  }

  _complete() {
    this.__complete();
  }
}
