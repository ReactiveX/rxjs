import {Observable} from '../../Observable';
import {publish} from '../../operator/publish';
Observable.prototype.publish = publish;

export var _void: void;