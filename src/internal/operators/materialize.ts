import { OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { Notification } from 'rxjs/internal/Notification';
import { Subscriber } from '../Subscriber';
import { OperatorSubscriber } from '../OperatorSubscriber';

export function materialize<T>(): OperatorFunction<T, Notification<T>> {
  return (source: Observable<T>) => new Observable(subscriber => source.subscribe(new MaterializeSubscriber(subscriber)));
}

function materializeOperator<T>() {
  return function materializeLift(this: Subscriber<Notification<T>>, source: Observable<T>) {
    return source.subscribe(new MaterializeSubscriber(this));
  };
}

class MaterializeSubscriber<T> extends OperatorSubscriber<T> {
  _next(value: T) {
    this._destination.next(Notification.createNext(value));
  }

  _error(err: any) {
    const { _destination } = this;
    _destination.next(Notification.createError(err));
    _destination.complete();
  }

  _complete() {
    const { _destination } = this;
    _destination.next(Notification.createComplete());
    _destination.complete();
  }
}
