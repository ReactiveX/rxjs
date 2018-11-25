import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';

export class OperatorSubscriber<T> extends Subscriber<T> {
  constructor(subscription: Subscription, protected _destination: Subscriber<any>) {
    super(subscription);
  }

  next(value: T) {
    this._destination.next(value);
  }

  error(err: any) {
    this._destination.error(err);
  }

  complete() {
    this._destination.complete();
  }
}