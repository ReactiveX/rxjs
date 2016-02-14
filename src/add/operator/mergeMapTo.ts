
import {Observable} from '../../Observable';
import {mergeMapTo} from '../../operator/mergeMapTo';

Observable.prototype.mergeMapTo = <any>mergeMapTo;

export var _void: void;