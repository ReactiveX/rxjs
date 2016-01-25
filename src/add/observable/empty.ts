import {Observable} from '../../Observable';
import {EmptyObservable} from '../../observable/EmptyObservable';

Observable.empty = EmptyObservable.create;

export var _void: void;