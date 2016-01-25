import {Observable} from '../../Observable';
import {TimerObservable} from '../../observable/TimerObservable';

Observable.timer = TimerObservable.create;

export var _void: void;