import {Observable} from '../../../Observable';
import {mergeScan} from '../../../operator/extended/mergeScan';
import {KitchenSinkOperators} from '../../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>><any>Observable.prototype);
observableProto.mergeScan = mergeScan;

export var _void: void;
