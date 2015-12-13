import {Observable} from '../../../Observable';
import {isEmpty} from '../../../operator/extended/isEmpty';
import {KitchenSinkOperators} from '../../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>><any>Observable.prototype);
observableProto.isEmpty = isEmpty;

export var _void: void;
