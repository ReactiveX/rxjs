import {Observable} from '../../Observable';
import {observeOn} from '../../operator/observeOn';
Observable.prototype.observeOn = observeOn;

export var _void: void;