import {Observable} from '../../Observable';
import {FromObservable} from '../../observable/FromObservable';

Observable.from = FromObservable.create;