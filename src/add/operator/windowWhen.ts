import {Observable} from '../../Observable';
import {windowWhen} from '../../operator/windowWhen';
Observable.prototype.windowWhen = windowWhen;
