import {Observable} from '../../Observable';
import {dematerialize} from '../../operator/dematerialize';
Observable.prototype.dematerialize = dematerialize;

export var _void: void;