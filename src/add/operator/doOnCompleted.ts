import {Observable} from '../../Observable';
import {doOnCompleted} from '../../operator/doOnCompleted';
Observable.prototype.doOnCompleted = doOnCompleted;
