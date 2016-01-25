import {Observable} from '../../Observable';
import {BoundNodeCallbackObservable} from '../../observable/BoundNodeCallbackObservable';

Observable.bindNodeCallback = BoundNodeCallbackObservable.create;

export var _void: void;