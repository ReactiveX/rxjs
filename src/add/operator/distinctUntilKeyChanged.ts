import {Observable} from '../../Observable';
import {distinctUntilKeyChanged} from '../../operator/distinctUntilKeyChanged';
import {KitchenSinkOperators} from '../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);
observableProto.distinctUntilKeyChanged = distinctUntilKeyChanged;

export var _void: void;