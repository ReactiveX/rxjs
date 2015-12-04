import {Observable} from '../../../Observable';
import {findIndex} from '../../../operator/extended/findIndex';
import {KitchenSinkOperators} from '../../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);
observableProto.findIndex = findIndex;
