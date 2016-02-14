
import {Observable} from '../../Observable';
import {last} from '../../operator/last';

Observable.prototype.last = <any>last;

export var _void: void;