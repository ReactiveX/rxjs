import {Observable} from '../../Observable';
import {find} from '../../operator/find';
import {KitchenSinkOperators} from '../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);
observableProto.find = find;

export var _void: void;