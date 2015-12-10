import {Observable} from '../../Observable';
import {reduce} from '../../operator/reduce';
Observable.prototype.reduce = reduce;

export var _void: void;