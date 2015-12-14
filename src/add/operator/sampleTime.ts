import {Observable} from '../../Observable';
import {sampleTime} from '../../operator/sampleTime';
Observable.prototype.sampleTime = sampleTime;

export var _void: void;