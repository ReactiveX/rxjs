import {Observable} from '../../../Observable';
import {mergeScan} from '../../../operator/extended/mergeScan';
import {KitchenSinkOperators} from '../../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);
observableProto.mergeScan = mergeScan;
