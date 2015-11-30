import {distinctUntilChanged} from '../distinctUntilChanged';
import {Observable} from '../../Observable';
import {KitchenSinkOperators} from '../../Rx.KitchenSink';

const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);

export function distinctUntilKeyChanged<T>(key: string, compare?: (x: any, y: any) => boolean, thisArg?: any) {
  return distinctUntilChanged.call(this, function(x, y) {
    if (compare) {
      return compare.call(thisArg, x[key], y[key]);
    }
    return x[key] === y[key];
  });
}

observableProto.distinctUntilKeyChanged = distinctUntilKeyChanged;