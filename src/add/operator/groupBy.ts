
import {Observable} from '../../Observable';
import {groupBy} from '../../operator/groupBy';

Observable.prototype.groupBy = <any>groupBy;

export var _void: void;