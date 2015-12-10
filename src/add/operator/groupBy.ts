import {Observable} from '../../Observable';
import {groupBy} from '../../operator/groupBy';
Observable.prototype.groupBy = groupBy;

export var _void: void;