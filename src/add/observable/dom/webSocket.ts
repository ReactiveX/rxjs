
import {Observable} from '../../../Observable';
import {WebSocketSubject} from '../../../observable/dom/WebSocketSubject';

Observable.webSocket = WebSocketSubject.create;

export var _void: void;