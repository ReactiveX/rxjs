import {Observable} from '../../Observable';
import {skipUntil} from '../../operator/skipUntil';
Observable.prototype.skipUntil = skipUntil;

export var _void: void;