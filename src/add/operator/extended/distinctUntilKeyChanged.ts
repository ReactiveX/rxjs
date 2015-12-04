import {Observable} from '../../../Observable';
import {distinctUntilKeyChanged} from '../../../operator/extended/distinctUntilKeyChanged';
import {KitchenSinkOperators} from '../../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);
observableProto.distinctUntilKeyChanged = distinctUntilKeyChanged;
