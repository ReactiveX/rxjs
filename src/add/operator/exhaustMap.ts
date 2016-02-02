
import {Observable} from '../../Observable';
import {exhaustMap} from '../../operator/exhaustMap';
import {KitchenSinkOperators} from '../../Rx.KitchenSink';

const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);
observableProto.exhaustMap = exhaustMap;