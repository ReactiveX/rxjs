import {Observable} from '../../Observable';
import {ErrorObservable} from '../../observable/ErrorObservable';

Observable.throw = ErrorObservable.create;

export var _void: void;