import {Observable} from '../../Observable';
import {retryWhen} from '../../operator/retryWhen';
Observable.prototype.retryWhen = retryWhen;

export var _void: void;