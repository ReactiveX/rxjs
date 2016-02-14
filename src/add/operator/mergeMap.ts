
import {Observable} from '../../Observable';
import {mergeMap} from '../../operator/mergeMap';

Observable.prototype.mergeMap = <any>mergeMap;
Observable.prototype.flatMap = <any>mergeMap;

export var _void: void;