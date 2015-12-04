import {Observable} from '../../Observable';
import {bufferWhen} from '../../operator/bufferWhen';
Observable.prototype.bufferWhen = bufferWhen;
