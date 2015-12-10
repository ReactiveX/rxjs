import {Observable} from '../../Observable';
import {combineLatest} from '../../operator/combineLatest';
Observable.prototype.combineLatest = combineLatest;

export var _void: void;