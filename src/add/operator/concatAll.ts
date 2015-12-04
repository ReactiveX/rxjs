import {Observable} from '../../Observable';
import {concatAll} from '../../operator/concatAll';
Observable.prototype.concatAll = concatAll;
