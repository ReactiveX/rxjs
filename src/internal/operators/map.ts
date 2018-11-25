import { Observable } from 'rxjs/internal/Observable';
import { OperatorSubscriber } from 'rxjs/internal/OperatorSubscriber';
import { Subscriber } from '../Subscriber';
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { Subscription } from '../Subscription';
import { OperatorFunction } from '../types';


export function map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.lift(mapOperator(project));
}

function mapOperator<T, R>(project: (value: T, index: number) => R) {
  return function mapLift(this: Subscriber<R>, source: Observable<T>, subscription: Subscription) {
    return source.subscribe(new MapSubscriber(subscription, this, project))
  }
}

class MapSubscriber<T, R> extends OperatorSubscriber<T> {
  private _index = 0;

  constructor(subscription: Subscription, destination: Subscriber<R>, private _project: (value: T, index: number) => R) {
    super(subscription, destination);
  }

  next(value: T) {
    const index = this._index++;
    const { _destination } = this;
    const result = tryUserFunction(this._project, value, index);
    if (resultIsError(result)) {
      _destination.error(result.error);
    } else {
      _destination.next(result);
    }
  }
}