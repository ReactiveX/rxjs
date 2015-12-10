import {Observable} from '../../Observable';
import {debounce} from '../../operator/debounce';
Observable.prototype.debounce = debounce;

export var _void: void;