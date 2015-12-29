import {Observable} from '../../Observable';
import {doOnError} from '../../operator/doOnError';
Observable.prototype.doOnError = doOnError;
