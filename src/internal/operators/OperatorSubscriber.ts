/** @prettier */
import { Subscriber } from '../Subscriber';

export class OperatorSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<any>, onNext?: (value: T) => void) {
    super(destination);
    if (onNext) {
      this._next = function (value: T) {
        try {
          onNext?.(value);
        } catch (err) {
          this._error(err);
        }
      };
    }
  }
}
