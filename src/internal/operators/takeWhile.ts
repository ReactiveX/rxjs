import { OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subscriber } from 'rxjs/internal/Subscriber';
import { OperatorSubscriber } from 'rxjs/internal/OperatorSubscriber';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';

export function takeWhile<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T> {
  return (source: Observable<T>) => source.lift(takeWhileOperator(predicate));
}

function takeWhileOperator<T>(predicate: (value: T, index: number) => boolean) {
  return function takeWhileLift(this: Subscriber<T>, source: Observable<T>, subscription: Subscription) {
    return source.subscribe(new TakeWhileSubscriber(subscription, this, predicate), subscription);
  };
}

class TakeWhileSubscriber<T> extends OperatorSubscriber<T> {
  private _index = 0;

  constructor(subscription: Subscription, destination: Subscriber<T>, private predicate: (value: T, index: number) => boolean) {
    super(subscription, destination);
  }

  next(value: T) {
    const { _destination } = this;
    const result = tryUserFunction(this.predicate, [value, this._index++]);
    if (resultIsError(result)) {
      _destination.error(result.error);
    } else {
      if (result) {
        _destination.next(value);
      } else {
        _destination.complete();
      }
    }
  }
}
