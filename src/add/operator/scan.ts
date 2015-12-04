import {Observable} from '../../Observable';
import {scan} from '../../operator/scan';
Observable.prototype.scan = scan;
