
import {Observable} from '../../Observable';
import {race} from '../../operator/race';

Observable.prototype.race = race;

export var _void: void;