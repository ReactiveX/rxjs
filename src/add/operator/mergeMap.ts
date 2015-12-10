import {Observable} from '../../Observable';
import {mergeMap} from '../../operator/mergeMap';
Observable.prototype.mergeMap = mergeMap;
Observable.prototype.flatMap = mergeMap;

export var _void: void;