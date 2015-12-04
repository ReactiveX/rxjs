import {Observable} from '../../Observable';
import {switchMapFirst} from '../../operator/switchMapFirst';
Observable.prototype.switchMapFirst = switchMapFirst;
