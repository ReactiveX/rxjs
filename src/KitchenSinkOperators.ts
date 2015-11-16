import * as operators from './operator-typings';
import {CoreOperators} from './CoreOperators';
export interface KitchenSinkOperators<T> extends CoreOperators<T> {
  isEmpty: operators.operator_proto_isEmpty<T>;
  elementAt: operators.operator_proto_elementAt<T>;
  distinctUntilKeyChanged: operators.operator_proto_distinctUntilKeyChanged<T>;
  find: operators.operator_proto_find<T>;
  findIndex: operators.operator_proto_findIndex<T>;
  max: operators.operator_proto_max<T>;
  min: operators.operator_proto_min<T>;
  timeInterval: operators.operator_proto_timeInterval<T>;
  mergeScan: operators.operator_proto_mergeScan<T>;
  switchFirst: operators.operator_proto_switchFirst<T>;
  switchMapFirst: operators.operator_proto_switchMapFirst<T>;
}
