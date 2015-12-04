import {Observable} from '../../Observable';
import {defaultIfEmpty} from '../../operator/defaultIfEmpty';
Observable.prototype.defaultIfEmpty = defaultIfEmpty;
