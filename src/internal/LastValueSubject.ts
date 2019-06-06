import { Subject } from './Subject';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';

/**
 * This subject will emit the last value that was passed into via `next`, but
 * only when `complete` is called.
 *
 * If the subject has already completed at the time of subscription, it will emit
 * the last value, then complete.
 */
export class LastValueSubject<T> extends Subject<T> {
  private _value: T = null;
  private _hasNext: boolean = false;
  private _hasCompleted: boolean = false;

  /** @deprecated This is an internal implementation detail, do not use. */
  _subscribe(subscriber: Subscriber<any>): Subscription {
    if (this.hasError) {
      subscriber.error(this.thrownError);
      return Subscription.EMPTY;
    } else if (this._hasCompleted && this._hasNext) {
      subscriber.next(this._value);
      subscriber.complete();
      return Subscription.EMPTY;
    }
    return super._subscribe(subscriber);
  }

  next(value: T): void {
    if (!this._hasCompleted) {
      this._value = value;
      this._hasNext = true;
    }
  }

  error(error: any): void {
    if (!this._hasCompleted) {
      super.error(error);
    }
  }

  complete(): void {
    this._hasCompleted = true;
    if (this._hasNext) {
      super.next(this._value);
    }
    super.complete();
  }
}

/** @deprecated remove in v8. Use {@link LastValueSubject} */
export const AsyncSubject = LastValueSubject;
