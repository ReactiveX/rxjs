import {Observable} from '../../Observable';
import {observeOn} from '../../operator/observeOn';
Observable.prototype.observeOn = observeOn;
