import {Observable} from '../../Observable';
import {BoundCallbackObservable} from '../../observable/bindCallback';
Observable.bindCallback = BoundCallbackObservable.create;

export var _void: void;