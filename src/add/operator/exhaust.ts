
import {Observable} from '../../Observable';
import {exhaust} from '../../operator/exhaust';
import {KitchenSinkOperators} from '../../Rx.KitchenSink';

const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);
observableProto.exhaust = exhaust;

export var _void: void;