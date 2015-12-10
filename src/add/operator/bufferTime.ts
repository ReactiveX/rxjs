import {Observable} from '../../Observable';
import {bufferTime} from '../../operator/bufferTime';
Observable.prototype.bufferTime = bufferTime;

export var _void: void;