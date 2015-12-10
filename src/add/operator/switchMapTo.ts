import {Observable} from '../../Observable';
import {switchMapTo} from '../../operator/switchMapTo';
Observable.prototype.switchMapTo = switchMapTo;

export var _void: void;