import {Observable} from '../../Observable';
import {delayWhen} from '../../operator/delayWhen';

Observable.prototype.delayWhen = delayWhen;

export var _void: void;