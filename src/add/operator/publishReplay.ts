import {Observable} from '../../Observable';
import {publishReplay} from '../../operator/publishReplay';
Observable.prototype.publishReplay = publishReplay;

export var _void: void;