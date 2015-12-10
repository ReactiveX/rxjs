import {Observable} from '../../Observable';
import {throttleTime} from '../../operator/throttleTime';
Observable.prototype.throttleTime = throttleTime;

export var _void: void;