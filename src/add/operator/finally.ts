import {Observable} from '../../Observable';
import {_finally} from '../../operator/finally';
Observable.prototype.finally = _finally;

export var _void: void;