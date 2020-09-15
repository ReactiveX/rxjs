/** @prettier */
import { Subscriber } from '../Subscriber';

export class OperatorSubscriber<T> extends Subscriber<T> {
  constructor(
    destination: Subscriber<any>,
    onNext?: (value: T) => void,
    onError?: (err: any) => void,
    onComplete?: () => void,
    private onUnsubscribe?: () => void
  ) {
    super(destination);
    if (onNext) {
      this._next = function (value: T) {
        try {
          onNext?.(value);
        } catch (err) {
          this.error(err);
        }
      };
    }
    if (onError) {
      this._error = function (err) {
        try {
          onError(err);
        } catch (err) {
          this.destination.error(err);
        }
        this.unsubscribe();
      };
    }
    if (onComplete) {
      this._complete = function () {
        try {
          onComplete();
        } catch (err) {
          this.destination.error(err);
        }
        this.unsubscribe();
      };
    }
  }

  unsubscribe() {
    !this.closed && this.onUnsubscribe?.();
    super.unsubscribe();
  }
}
