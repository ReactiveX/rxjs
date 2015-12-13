import {Observable} from '../../Observable';
import {exhaustMap} from '../../operator/exhaustMap';
(Observable.prototype as any).exhaustMap = exhaustMap;

export var _void: void;
