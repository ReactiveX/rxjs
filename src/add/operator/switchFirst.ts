import {Observable} from '../../Observable';
import {switchFirst} from '../../operator/switchFirst';
Observable.prototype.switchFirst = switchFirst;
