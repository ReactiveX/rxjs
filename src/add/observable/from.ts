import {Observable} from '../../Observable';
import {FromObservable} from '../../observable/from';
Observable.from = FromObservable.create;
