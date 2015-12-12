import {Observable} from '../../Observable';
import {pairwise} from '../../operator/pairwise';
import {KitchenSinkOperators} from '../../Rx.KitchenSink';
const observableProto = (<KitchenSinkOperators<any>>Observable.prototype);
observableProto.pairwise = pairwise;

export var _void: void;
