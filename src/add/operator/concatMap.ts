import {Observable} from '../../Observable';
import {concatMap} from '../../operator/concatMap';
Observable.prototype.concatMap = concatMap;

export var _void: void;