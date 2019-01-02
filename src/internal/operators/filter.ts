import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { Subscriber } from '../Subscriber';
import { OperatorSubscriber } from '../OperatorSubscriber';

export function filter<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T> {
  return (source: Observable<T>) => new Observable(subscriber => source.subscribe(new FilterSubscriber(subscriber, predicate)));
}

class FilterSubscriber<T> extends OperatorSubscriber<T> {
  private _index = 0;

  constructor(destination: Subscriber<T>, private _predicate: (value: T, index: number) => boolean) {
    super(destination);
  }

  _next(value: T) {
    const { _destination } = this;
    const result = tryUserFunction(this._predicate, [value, this._index++]);
    if (resultIsError(result)) {
      _destination.error(result.error);
    } else {
      if (result) {
        _destination.next(value);
      }
    }
  }
}
