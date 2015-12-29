import {Observable} from '../../Observable';
import {doOnNext} from '../../operator/doOnNext';
Observable.prototype.doOnNext = doOnNext;
