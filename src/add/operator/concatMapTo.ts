import {Observable} from '../../Observable';
import {concatMapTo} from '../../operator/concatMapTo';
Observable.prototype.concatMapTo = concatMapTo;

export var _void: void;