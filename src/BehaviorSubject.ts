import {Subject} from './Subject';
import {Subscriber} from './Subscriber';
import {TeardownLogic, ISubscription} from './Subscription';
import {throwError} from './util/throwError';
import {ObjectUnsubscribedError} from './util/ObjectUnsubscribedError';

/**
 * @class BehaviorSubject<T>
 */
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

  protected _subscribe(subscriber: Subscriber<T>): TeardownLogic {
    const subscription = super._subscribe(subscriber);
    if (subscription && !(<ISubscription> subscription).isUnsubscribed) {
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
