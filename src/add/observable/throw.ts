import {Observable} from '../../Observable';
import {ErrorObservable} from '../../observable/throw';
Observable.throw = ErrorObservable.create;

export var _void: void;