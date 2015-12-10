import {Observable} from '../../Observable';
import {throttle} from '../../operator/throttle';
Observable.prototype.throttle = throttle;

export var _void: void;