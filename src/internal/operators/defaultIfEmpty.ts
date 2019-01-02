import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { OperatorSubscriber } from '../OperatorSubscriber';
import { Subscriber } from 'rxjs/internal/Subscriber';
import { OperatorFunction } from '../types';

export function defaultIfEmpty<T, R>(defaultValue: R = null): OperatorFunction<T, T|R> {
  return (source: Observable<T>) => new Observable(subscriber => source.subscribe(new DefaultIfEmptySubscriber(subscriber, defaultValue)));
}

class DefaultIfEmptySubscriber<T, R> extends OperatorSubscriber<T> {
  private _hasValue = false;

  constructor(destination: Subscriber<T|R>, private _defaultValue: T|R) {
    super(destination);
  }

  _next(value: T) {
    this._hasValue = true;
    this._destination.next(value);
  }

  _complete() {
    const { _destination } = this;
    if (!this._hasValue) {
      _destination.next(this._defaultValue);
    }
    _destination.complete();
  }
}
