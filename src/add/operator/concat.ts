import {Observable} from '../../Observable';
import {concat} from '../../operator/concat';
Observable.prototype.concat = concat;

export var _void: void;