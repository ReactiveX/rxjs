import {Observable} from '../../Observable';
import {_catch} from '../../operator/catch';
Observable.prototype.catch = _catch;

export var _void: void;