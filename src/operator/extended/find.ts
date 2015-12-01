import {FindValueOperator} from './find-support';
import {Observable} from '../../Observable';
import {KitchenSinkOperators} from '../../Rx.KitchenSink';

const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);

export function find<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<T> {
  return this.lift(new FindValueOperator(predicate, this, false, thisArg));
}

observableProto.find = find;