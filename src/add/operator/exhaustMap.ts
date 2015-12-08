import {Observable} from '../../Observable';
import {exhaustMap} from '../../operator/exhaustMap';
Observable.prototype.exhaustMap = exhaustMap;
