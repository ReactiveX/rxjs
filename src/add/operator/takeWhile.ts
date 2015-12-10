import {Observable} from '../../Observable';
import {takeWhile} from '../../operator/takeWhile';
Observable.prototype.takeWhile = takeWhile;

export var _void: void;