import {Observable} from '../../Observable';
import {publishLast} from '../../operator/publishLast';

Observable.prototype.publishLast = publishLast;