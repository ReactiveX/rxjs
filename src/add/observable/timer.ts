import {Observable} from '../../Observable';
import {TimerObservable} from '../../observable/timer';
Observable.timer = TimerObservable.create;

export var _void: void;