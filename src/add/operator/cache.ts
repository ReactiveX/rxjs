
import {Observable} from '../../Observable';
import {cache} from '../../operator/cache';

Observable.prototype.cache = cache;

export var _void: void;