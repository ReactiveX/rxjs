import {Observable} from '../../Observable';
import {min} from '../../operator/min';
import {KitchenSinkOperators} from '../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);
observableProto.min = min;

export var _void: void;