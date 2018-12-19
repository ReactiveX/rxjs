import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { OperatorSubscriber } from '../OperatorSubscriber';
import { Subscriber } from 'rxjs/internal/Subscriber';
import { OperatorFunction } from '../types';

export function defaultIfEmpty<T, R>(defaultValue: R = null): OperatorFunction<T, T|R> {
  return (source: Observable<T>) => source.lift(defaultIfEmptyOperator(defaultValue));
}

function defaultIfEmptyOperator<T, R>(defaultValue: R) {
  return function defaultIfEmptyLift(this: Subscriber<T|R>, source: Observable<T>, subscription: Subscription) {
    return source.subscribe(new DefaultIfEmptySubscriber(subscription, this, defaultValue));
  };
}

class DefaultIfEmptySubscriber<T, R> extends OperatorSubscriber<T> {
  private _hasValue = false;

  constructor(subscription: Subscription, destination: Subscriber<T|R>, private _defaultValue: T|R) {
    super(subscription, destination);
  }

  next(value: T) {
    this._hasValue = true;
    this._destination.next(value);
  }

  complete() {
    const { _destination } = this;
    if (!this._hasValue) {
      _destination.next(this._defaultValue);
    }
    _destination.complete();
  }
}
