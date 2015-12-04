import {Observable} from '../../Observable';
import {ErrorObservable} from '../../observable/throw';
Observable.throw = ErrorObservable.create;
