import {Observable} from '../../Observable';
import {max} from '../../operator/max';
import {KitchenSinkOperators} from '../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);
observableProto.max = max;

export var _void: void;