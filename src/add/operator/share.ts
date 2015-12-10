import {Observable} from '../../Observable';
import {share} from '../../operator/share';
Observable.prototype.share = share;

export var _void: void;