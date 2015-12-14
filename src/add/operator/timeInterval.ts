import {Observable} from '../../Observable';
import {timeInterval} from '../../operator/timeInterval';
import {KitchenSinkOperators} from '../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);
observableProto.timeInterval = timeInterval;

export var _void: void;