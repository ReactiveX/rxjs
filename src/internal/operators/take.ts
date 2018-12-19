import { OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subscriber } from 'rxjs/internal/Subscriber';
import { OperatorSubscriber } from 'rxjs/internal/OperatorSubscriber';

export function take<T>(total: number): OperatorFunction<T, T> {
  return (source: Observable<T>) => source.lift(takeOperator(total));
}

function takeOperator<T>(total: number) {
  return function takeLift(this: Subscriber<T>, source: Observable<T>, subscription: Subscription) {
    return source.subscribe(new TakeSubscriber(subscription, this, total), subscription);
  };
}

class TakeSubscriber<T> extends OperatorSubscriber<T> {
  private _counter = 0;

  constructor(subscription: Subscription, destination: Subscriber<any>, private total: number) {
    super(subscription, destination);
    if (total === 0) {
      destination.complete();
    }
  }

  next(value: T) {
    const { _destination } = this;
    const c = ++this._counter;
    if (c <= this.total) {
      _destination.next(value);
      if (c === this.total) {
        _destination.complete();
      }
    }
  }
}
