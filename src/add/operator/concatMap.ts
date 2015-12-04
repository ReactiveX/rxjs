import {Observable} from '../../Observable';
import {concatMap} from '../../operator/concatMap';
Observable.prototype.concatMap = concatMap;
