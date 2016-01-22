
import {Observable} from '../../Observable';
import {letProto} from '../../operator/let';

Observable.prototype.let = letProto;
Observable.prototype.letBind = letProto;

export var _void: void;