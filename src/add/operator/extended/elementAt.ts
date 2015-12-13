import {Observable} from '../../../Observable';
import {elementAt} from '../../../operator/extended/elementAt';
import {KitchenSinkOperators} from '../../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>><any>Observable.prototype);
observableProto.elementAt = elementAt;

export var _void: void;
