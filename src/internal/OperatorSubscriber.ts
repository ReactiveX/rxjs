import { Subscriber } from './Subscriber';

export class OperatorSubscriber<T> extends Subscriber<T> {
  constructor(protected _destination: Subscriber<any>) {
    super();
    (this._destination as any)._subscription.add(this._subscription);
  }

  _next(value: T) {
    this._destination.next(value);
  }

  _error(err: any) {
    this._destination.error(err);
  }

  _complete() {
    this._destination.complete();
  }
}
