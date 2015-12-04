import {Observable} from '../../../Observable';
import {find} from '../../../operator/extended/find';
import {KitchenSinkOperators} from '../../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);
observableProto.find = find;
