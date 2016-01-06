import {Observable} from '../../Observable';
import {BoundNodeCallbackObservable} from '../../observable/bindNodeCallback';
Observable.bindNodeCallback = BoundNodeCallbackObservable.create;

export var _void: void;