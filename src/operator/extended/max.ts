import {Observable} from '../../Observable';
import {ReduceOperator} from '../reduce-support';
import {KitchenSinkOperators} from '../../Rx.KitchenSink';

const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);

export function max<T, R>(comparer?: (x: R, y: T) => R): Observable<R> {
  const max = (typeof comparer === 'function')
    ? comparer
    : (x, y) => x > y ? x : y;
  return this.lift(new ReduceOperator(max));
}

observableProto.max = max;
