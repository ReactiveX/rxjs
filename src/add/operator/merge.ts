import {Observable} from '../../Observable';
import {merge} from '../../operator/merge';
Observable.prototype.merge = merge;

export var _void: void;