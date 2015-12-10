import {Observable} from '../../Observable';
import {distinctUntilChanged} from '../../operator/distinctUntilChanged';
Observable.prototype.distinctUntilChanged = distinctUntilChanged;

export var _void: void;