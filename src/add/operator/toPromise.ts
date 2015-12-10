import {Observable} from '../../Observable';
import {toPromise} from '../../operator/toPromise';
Observable.prototype.toPromise = toPromise;

export var _void: void;