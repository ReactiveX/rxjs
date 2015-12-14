import {Observable} from '../../Observable';
import {findIndex} from '../../operator/findIndex';
import {KitchenSinkOperators} from '../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);
observableProto.findIndex = findIndex;

export var _void: void;