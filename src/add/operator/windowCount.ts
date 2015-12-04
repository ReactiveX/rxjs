import {Observable} from '../../Observable';
import {windowCount} from '../../operator/windowCount';
Observable.prototype.windowCount = windowCount;
