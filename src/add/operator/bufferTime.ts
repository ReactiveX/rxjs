import {Observable} from '../../Observable';
import {bufferTime} from '../../operator/bufferTime';
Observable.prototype.bufferTime = bufferTime;
