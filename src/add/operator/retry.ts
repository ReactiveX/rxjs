import {Observable} from '../../Observable';
import {retry} from '../../operator/retry';
Observable.prototype.retry = retry;

export var _void: void;