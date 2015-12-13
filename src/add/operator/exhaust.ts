import {Observable} from '../../Observable';
import {exhaust} from '../../operator/exhaust';
(Observable.prototype as any).exhaust = exhaust;

export var _void: void;
