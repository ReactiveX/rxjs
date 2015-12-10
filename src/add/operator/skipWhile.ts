import {Observable} from '../../Observable';
import {skipWhile} from '../../operator/skipWhile';
Observable.prototype.skipWhile = skipWhile;

export var _void: void;