import {Observable} from '../../Observable';
import {multicast} from '../../operator/multicast';
Observable.prototype.multicast = multicast;

export var _void: void;