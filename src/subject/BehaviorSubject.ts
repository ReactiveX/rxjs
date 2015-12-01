import {Subject} from '../Subject';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {throwError} from '../util/throwError';
import {ObjectUnsubscribedError} from '../util/ObjectUnsubscribedError';

export class BehaviorSubject<T> extends Subject<T> {
  private _hasError: boolean = false;
  private _err: any;

  constructor(private _value: T) {
    super();
  }

  getValue(): T {
    if (this._hasError) {
      throwError(this._err);
    } else if (this.isUnsubscribed) {
      throwError(new ObjectUnsubscribedError());
    } else {
      return this._value;
    }
  }

  get value(): T {
    return this.getValue();
  }

  _subscribe(subscriber: Subscriber<any>): Subscription<T> {
    const subscription = super._subscribe(subscriber);
    if (!subscription) {
      return;
    } else if (!subscription.isUnsubscribed) {
      subscriber.next(this._value);
    }
    return subscription;
  }

  _next(value: T): void {
    super._next(this._value = value);
  }

  _error(err: any): void {
    this._hasError = true;
    super._error(this._err = err);
  }
}