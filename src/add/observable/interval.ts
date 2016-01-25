import {Observable} from '../../Observable';
import {IntervalObservable} from '../../observable/IntervalObservable';

Observable.interval = IntervalObservable.create;

export var _void: void;