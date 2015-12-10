import {Observable} from '../../Observable';
import {switchMap} from '../../operator/switchMap';
Observable.prototype.switchMap = switchMap;

export var _void: void;