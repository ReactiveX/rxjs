import {Observable} from '../../Observable';
import {debounceTime} from '../../operator/debounceTime';
Observable.prototype.debounceTime = debounceTime;
