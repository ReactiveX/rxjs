import {Observable} from '../../../Observable';
import {distinctUntilKeyChanged} from '../../../operator/extended/distinctUntilKeyChanged';
import {KitchenSinkOperators} from '../../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>><any>Observable.prototype);
observableProto.distinctUntilKeyChanged = distinctUntilKeyChanged;

export var _void: void;
