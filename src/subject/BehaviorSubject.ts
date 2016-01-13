import {Subject} from '../Subject';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {throwError} from '../util/throwError';
import {ObjectUnsubscribedError} from '../util/ObjectUnsubscribedError';

export class BehaviorSubject<T> extends Subject<T> {

  constructor(private _value: T) {
    super();
  }

  getValue(): T {
    if (this.hasErrored) {
      throwError(this.errorValue);
    } else if (this.isUnsubscribed) {
      throwError(new ObjectUnsubscribedError());
    } else {
      return this._value;
    }
  }

  get value(): T {
    return this.getValue();
  }

  protected _subscribe(subscriber: Subscriber<T>): Subscription | Function | void {
    const subscription = super._subscribe(subscriber);
    if (subscription && !(<Subscription> subscription).isUnsubscribed) {
      subscriber.next(this._value);
    }
    return subscription;
  }

  protected _next(value: T): void {
    super._next(this._value = value);
  }

  protected _error(err: any): void {
    this.hasErrored = true;
    super._error(this.errorValue = err);
  }
}
