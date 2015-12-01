import {Observable} from '../../Observable';
import {FindValueOperator} from './find-support';
import {KitchenSinkOperators} from '../../Rx.KitchenSink';

const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);

export function findIndex<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): Observable<number> {
  return this.lift(new FindValueOperator(predicate, this, true, thisArg));
}

observableProto.findIndex = findIndex;
